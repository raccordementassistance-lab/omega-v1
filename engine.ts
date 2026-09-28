/**
 * Moteur Lydie — version à contexte structuré.
 *
 * Moteur à mots-clés déterministe (pas un modèle de langage) : il ne
 * comprend ni les fautes d'orthographe ni les références comme "ça" ou
 * "celui-là" au-delà des motifs explicitement couverts ci-dessous. C'est une
 * limite assumée du choix d'architecture, pas un oubli — la couvrir
 * réellement demanderait un moteur d'extraction basé sur un LLM, ce qui est
 * un changement d'architecture, pas un ajustement de ce fichier.
 *
 * Le parcours :
 *
 *   MODE → PROJECT → ADDRESS → DETAILS → DOCUMENTS → EMAIL → SUMMARY → MANDAT → DONE
 *
 * Le contexte (LydieContext) est la seule mémoire du moteur : il est fourni
 * par l'appelant à chaque appel et renvoyé mis à jour. Le moteur ne touche
 * jamais de base de données et ne crée jamais de dossier — il se contente
 * de signaler, via `readyToFinalize`, le tour exact où les 3 conditions du
 * mandat viennent d'être validées. C'est à l'appelant (route API) de
 * décider quoi faire de cette confirmation (créer le dossier si connecté,
 * demander une connexion sinon), et de revalider indépendamment côté
 * serveur avant d'écrire quoi que ce soit (voir route.ts).
 */

import { getRecommendedDocuments } from "./documentRecommendations";

export type LydieHistoryMessage = { role: "user" | "assistant"; content: string };

export type LydieMode = "TEXT" | "VOICE_UNAVAILABLE";

export type LydieProjectType =
  | "MAISON_NEUVE"
  | "LOCAL_PROFESSIONNEL"
  | "MODIFICATION_BRANCHEMENT"
  | "DEPLACEMENT_COMPTEUR"
  | "RACCORDEMENT_PROVISOIRE"
  | "NOUVEAU_RACCORDEMENT";

export type LydieStep = "MODE" | "PROJECT" | "ADDRESS" | "DETAILS" | "DOCUMENTS" | "EMAIL" | "SUMMARY" | "MANDAT" | "DONE";

export type LydieContext = {
  step: LydieStep;
  mode: LydieMode | null;
  project: LydieProjectType | null;
  address: string | null;
  /**
   * Fragment d'adresse encore incomplet, mémorisé entre deux tours à
   * l'étape ADDRESS uniquement (ex. voie envoyée seule, puis code postal
   * dans un message séparé) — jamais utilisé ailleurs, jamais persisté
   * comme une adresse valide : voir l'étape ADDRESS ci-dessous. `null` dès
   * qu'une adresse complète est retenue dans `address`.
   */
  addressDraft: string | null;
  details: string | null;
  documents: string | null;
  /** Obligatoire : jamais finalisable sans une adresse e-mail valide. */
  email: string | null;
  /** Les 3 conditions du mandat, distinctes. Les 3 doivent être vraies avant toute finalisation. */
  mandatRepresentation: boolean;
  mandatTransmission: boolean;
  mandatConfirmation: boolean;
  confirmed: boolean;
  dossierId: string | null;
  /**
   * Générée une seule fois, au premier affichage du récapitulatif, et
   * conservée telle quelle ensuite (y compris à travers un aller-retour
   * "modifier"). Sert de clé d'idempotence côté serveur (voir la migration
   * 20260926010000_lydie_confirmation_key et finalizeLydieQualification
   * dans src/app/api/lydie/route.ts).
   */
  confirmationKey: string | null;
};

export type LydieResult = {
  reply: string;
  context: LydieContext;
  step: LydieStep;
  /** true uniquement sur le tour où la 3ᵉ condition du mandat vient d'être acceptée. */
  readyToFinalize: boolean;
};

export const INITIAL_LYDIE_CONTEXT: LydieContext = {
  step: "MODE",
  mode: null,
  project: null,
  address: null,
  addressDraft: null,
  details: null,
  documents: null,
  email: null,
  mandatRepresentation: false,
  mandatTransmission: false,
  mandatConfirmation: false,
  confirmed: false,
  dossierId: null,
  confirmationKey: null,
};

const PROJECT_LABELS: Record<LydieProjectType, string> = {
  MAISON_NEUVE: "Maison neuve",
  LOCAL_PROFESSIONNEL: "Local professionnel",
  MODIFICATION_BRANCHEMENT: "Modification de branchement",
  DEPLACEMENT_COMPTEUR: "Déplacement de compteur",
  RACCORDEMENT_PROVISOIRE: "Raccordement provisoire",
  NOUVEAU_RACCORDEMENT: "Nouveau raccordement (borne de recharge, etc.)",
};

/** Les 3 conditions du mandat, dans l'ordre où elles sont posées. Toutes obligatoires. */
const MANDAT_CONDITIONS: Array<{ key: "mandatRepresentation" | "mandatTransmission" | "mandatConfirmation"; prompt: string }> = [
  {
    key: "mandatRepresentation",
    prompt: "1/3 — J'autorise Raccordement Assistance à me représenter auprès d'Enedis pour cette demande de raccordement. Répondez « j'accepte » ou « non ».",
  },
  {
    key: "mandatTransmission",
    prompt: "2/3 — J'autorise la transmission des informations et documents nécessaires à Enedis dans le cadre de cette demande. Répondez « j'accepte » ou « non ».",
  },
  {
    key: "mandatConfirmation",
    prompt: "3/3 — Je confirme l'exactitude des informations transmises dans le cadre de cette demande. Répondez « j'accepte » ou « non ».",
  },
];

// Les claviers mobiles (iPhone en t\u00eate, "guillemets typographiques" activ\u00e9s
// par d\u00e9faut) substituent silencieusement l'apostrophe droite (') par une
// apostrophe typographique (\u2019, U+2019) ou une autre variante (\u2018, U+2018,
// \u00b4, U+00B4) au moment de la frappe \u2014 jamais au choix de l'utilisateur.
// Sans cette normalisation, toute entr\u00e9e de `contains()` \u00e9crite avec une
// apostrophe droite ("c'est bon", "pas d'accord", ...) ne correspondait
// plus au texte r\u00e9ellement re\u00e7u (confirm\u00e9 par ex\u00e9cution r\u00e9elle : voir le
// rapport de correction livr\u00e9). Normalis\u00e9e AVANT la suppression des
// accents, pour rester align\u00e9e avec la m\u00eame r\u00e8gle d\u00e9j\u00e0 en vigueur dans
// orchestrator.ts/extraction.ts (Lydie V2), qui applique d\u00e9sormais le m\u00eame
// correctif dans leur propre copie de `normalize()`.
const APOSTROPHE_VARIANTS_PATTERN = /[\u2019\u2018\u00b4]/g;

const normalize = (value: string) =>
  value
    .replace(APOSTROPHE_VARIANTS_PATTERN, "'")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function contains(text: string, words: string[]) {
  const n = normalize(text);
  return words.some((word) => n.includes(normalize(word)));
}

// Tenu strictement aligné sur src/lib/lydie/parseAddress.ts#ADDRESS_PATTERN
// (voir le commentaire détaillé là-bas sur la virgule obligatoire avant la
// ville quand elle précède le code postal — évite l'ambiguïté voie/ville).
const ADDRESS_PATTERN =
  /^(\d+\s*(?:bis|ter)?)\s+([^\d,]+?)\s*(?:,\s*([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*?)\s+(\d{5})|,?\s*(\d{5})\s+([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*))$/i;

/**
 * Adresse complète = 4 composants distincts (numéro, voie, code postal,
 * ville) — voir src/lib/lydie/parseAddress.ts pour l'extraction utilisée à
 * la persistance. Dupliqué ici volontairement en une simple vérification
 * booléenne pour que ce fichier reste sans dépendance et testable seul ;
 * les deux DOIVENT rester alignés sur le même motif ADDRESS_PATTERN.
 */
function hasCompleteAddress(value: string) {
  return ADDRESS_PATTERN.test(value.trim().replace(/\s+/g, " "));
}

/**
 * Recompose une adresse envoyée en PLUSIEURS messages (ex. « 42 rue
 * Voltaire sur Onnaing » puis « 59264 »), sans jamais rendre
 * `ADDRESS_PATTERN` lui-même plus permissif : on essaie plusieurs
 * recombinaisons purement textuelles du fragment déjà mémorisé
 * (`draft`) et du nouveau message (`text`), et c'est TOUJOURS
 * `hasCompleteAddress()` (inchangée) qui tranche — jamais une heuristique
 * séparée qui déciderait elle-même qu'une adresse est valide.
 *
 * Ordre volontaire des tentatives :
 *  1. concaténation directe avec virgule ("draft, text") — cas où le
 *     fragment manquant est déjà à la bonne place (ex. code postal ET
 *     ville envoyés ensemble après une voie seule) ;
 *  2. concaténation directe avec espace ("draft text") — variante sans
 *     virgule, également acceptée par ADDRESS_PATTERN (voie ",? code
 *     postal ville") ;
 *  3. si le nouveau message est un code postal isolé (5 chiffres) et que
 *     `draft` se termine déjà par un mot qui pourrait être la ville (cas
 *     du test obligatoire : "42 rue voltaire sur Onnaing" + "59264"), on
 *     insère ce code postal juste avant ce dernier mot : la ville reste
 *     en dernière position, précédée du code postal, ce que
 *     ADDRESS_PATTERN reconnaît (deuxième alternative, virgule
 *     optionnelle) sans qu'aucune supposition sur CE QUI est une ville ne
 *     soit faite ailleurs que dans ce réagencement purement positionnel.
 *
 * Ne modifie et ne remplace jamais `ADDRESS_PATTERN`/`hasCompleteAddress` :
 * chaque candidat lui est simplement soumis tel quel.
 */
function buildAddressMergeCandidates(draft: string | null, text: string): string[] {
  const cleanDraft = draft?.trim().replace(/\s+/g, " ") ?? "";
  const cleanText = text.trim().replace(/\s+/g, " ");
  if (!cleanDraft) return [cleanText];

  const candidates = [`${cleanDraft}, ${cleanText}`, `${cleanDraft} ${cleanText}`];

  if (/^\d{5}$/.test(cleanText)) {
    const words = cleanDraft.split(" ");
    if (words.length >= 2) {
      const lastWord = words.pop() as string;
      candidates.push(`${words.join(" ")} ${cleanText} ${lastWord}`);
    }
  }

  return candidates;
}

// Variante NON ancrée de ADDRESS_PATTERN (pas de `^…$`), utilisée
// UNIQUEMENT pour repérer un candidat d'adresse À L'INTÉRIEUR d'un message
// plus long qui décrit aussi le projet dans la même phrase (mission P2B.1,
// priorité 2 : « aucune répétition des informations déjà connues » — ex.
// « Bonjour, je construis une maison neuve, 12 rue de la Paix, 75001
// Paris. »). Ne remplace ni n'assouplit JAMAIS ADDRESS_PATTERN lui-même :
// le candidat trouvé ici est toujours revalidé par hasCompleteAddress()
// (donc par ADDRESS_PATTERN, ancré, inchangé) avant d'être retenu — même
// principe de double validation que buildAddressMergeCandidates() ci-dessus.
const ADDRESS_SEARCH_PATTERN =
  /\d+\s*(?:bis|ter)?\s+[^\d,]+?\s*(?:,\s*[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*?\s+\d{5}|,?\s*\d{5}\s+[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*)/i;

/**
 * Cherche une adresse complète DANS un message plus long (par exemple un
 * message qui décrit aussi le projet). Renvoie `null` si rien n'est trouvé
 * OU si le candidat trouvé ne passe pas la revalidation stricte de
 * `hasCompleteAddress()` — jamais un composant deviné ou complété.
 */
function findEmbeddedAddress(text: string): string | null {
  const match = text.match(ADDRESS_SEARCH_PATTERN);
  if (!match) return null;
  const candidate = match[0].trim().replace(/\s+/g, " ");
  return hasCompleteAddress(candidate) ? candidate : null;
}

// Cœur de la question posée juste après qu'une adresse complète vient
// d'être retenue, SANS amorce — pour pouvoir la préfixer différemment
// selon le contexte (voir DETAILS_QUESTION ci-dessous, et
// projectAndAddressAcknowledgement(), mission P2B.2).
const DETAILS_QUESTION_CORE =
  "Une information complémentaire à ajouter sur le projet (puissance souhaitée, délai, contexte particulier) ? Si non, répondez « aucune ».";

/** Question posée juste après qu'une adresse complète vient d'être retenue (message seul ou fusion multi-messages) — inchangée depuis P2B.1. */
const DETAILS_QUESTION = `Merci. ${DETAILS_QUESTION_CORE}`;

// ---------------------------------------------------------------------------
// Mission P2B.2 — « Lydie devient humaine » : reformulation naturelle, sans
// jamais répéter une information déjà connue ni en inventer une manquante.
// ARBITRAGE OFFICIEL (2026-09-28) : hasCompleteAddress()/ADDRESS_PATTERN ne
// sont JAMAIS modifiés ici. Une ville seule (ex. « Bordeaux ») reste un
// simple contexte géographique de formulation — jamais une adresse
// validée, jamais stockée dans context.address/addressDraft, jamais
// utilisée pour sauter l'étape ADDRESS.
// ---------------------------------------------------------------------------

// Repère un indice géographique mentionné après une préposition de lieu
// (« à », « en », « dans », « sur »), suivie d'un mot (ou d'une séquence de
// mots) commençant par une majuscule — heuristique volontairement étroite
// pour limiter les faux positifs (ex. « à la mairie » n'est PAS retenu : « la »
// n'est pas capitalisé). Uniquement utilisé pour la formulation de la
// réponse de Lydie, jamais pour une décision de validation.
//
// `(?:^|\s)` remplace volontairement `\b` avant la préposition : `\b` ne
// détecte une frontière qu'entre un caractère \w ([A-Za-z0-9_], non
// Unicode-aware en JavaScript) et un caractère qui ne l'est pas — "à" n'est
// PAS un caractère \w, donc "espace + à" n'est PAS reconnu comme une
// frontière par `\b` et ne matchait jamais (bug détecté par le test « étape
// PROJECT... » ci-dessous, jamais publié). `(?:^|\s)` (début de chaîne ou
// espace) est la façon correcte d'exiger que la préposition soit un mot
// isolé ici. Pas de flag `/i` global (il rendrait `[A-ZÀ-Ö]` insensible à la
// casse et casserait le filtre « doit commencer par une majuscule » — voir
// « à la mairie » dans les tests) : chaque préposition est donc listée dans
// ses deux graphies (« à »/« À », etc.) explicitement.
const GEO_HINT_PATTERN =
  /(?:^|\s)(?:à|À|en|En|dans|Dans|sur|Sur)\s+([A-ZÀ-Ö][A-Za-zÀ-ÖØ-öø-ÿ'’\-]*(?:\s+[A-ZÀ-Ö][A-Za-zÀ-ÖØ-öø-ÿ'’\-]*)*)/;

// Exclusion des mots-clés déjà utilisés par detectProject() ou du
// vocabulaire de marque interne : évite qu'un mot du projet capitalisé en
// début de phrase, ou une mention d'Enedis/Lydie/Pluri Raccordé, ne soit
// pris à tort pour un indice géographique.
const GEO_HINT_EXCLUSIONS = new Set([
  "enedis", "lydie", "pluri", "raccorde", "raccordement", "assistance",
  "maison", "neuve", "construction", "terrain",
  "professionnel", "commerce", "bureau", "entreprise", "atelier",
  "compteur", "provisoire", "chantier", "borne", "recharge",
]);

/**
 * Cherche un indice géographique DANS un message, pour reformulation
 * uniquement (jamais une adresse). Renvoie `null` si le message contient
 * déjà une adresse complète (voir findEmbeddedAddress ci-dessus : une vraie
 * adresse prime toujours, pas de double message), si aucun indice n'est
 * trouvé, ou si le mot trouvé correspond à une exclusion connue.
 */
function findGeoHint(text: string): string | null {
  if (findEmbeddedAddress(text)) return null;
  const match = text.match(GEO_HINT_PATTERN);
  if (!match) return null;
  const candidate = match[1].trim();
  const firstWordNormalized = normalize(candidate.split(/\s+/)[0]);
  if (GEO_HINT_EXCLUSIONS.has(firstWordNormalized)) return null;
  return candidate;
}

/**
 * Reformule ce que Lydie a compris quand un projet vient d'être identifié
 * mais que l'adresse complète manque encore — jamais de répétition de la
 * question projet, jamais d'adresse inventée : `geoHint`, s'il existe,
 * n'est mentionné que comme contexte, jamais comme une adresse retenue.
 * Introduit Pluri Raccordé® au moment où le parcours raccordement vient
 * d'être identifié (décision Aristote, ARBITRAGES-P2B.2.md).
 */
function projectAcknowledgement(project: LydieProjectType, geoHint: string | null): string {
  const label = PROJECT_LABELS[project].toLowerCase();
  const location = geoHint ? ` situé à ${geoHint}` : "";
  return (
    `J'ai bien noté que vous décrivez un projet de ${label}${location}. ` +
    "Pour préparer votre dossier Pluri Raccordé®, il me manque une information : " +
    "l'adresse complète du projet (numéro, voie, code postal et ville)."
  );
}

/**
 * Reformule ce que Lydie a compris quand le projet ET une adresse complète
 * ont été donnés dans le même message (voir findEmbeddedAddress) — jamais
 * de répétition de la question projet ni de la question adresse.
 */
function projectAndAddressAcknowledgement(project: LydieProjectType, address: string): string {
  const label = PROJECT_LABELS[project].toLowerCase();
  return (
    `J'ai bien noté un projet de ${label} à l'adresse ${address}. ` +
    `Pour préparer votre dossier Pluri Raccordé®, ${DETAILS_QUESTION_CORE}`
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

/** Tentatives explicites de contourner l'e-mail obligatoire — jamais acceptées. */
function isEmailSkipAttempt(n: string) {
  return contains(n, ["pas de mail", "pas d'email", "pas d'e-mail", "je n'en ai pas", "aucun mail", "aucun email", "passer", "skip", "plus tard", "sans email", "sans e-mail"]);
}

function detectProject(value: string): LydieProjectType | null {
  const n = normalize(value);
  if (contains(n, ["maison neuve", "construction", "nouvelle maison", "terrain", "maison", "neuve"])) return "MAISON_NEUVE";
  if (contains(n, ["local professionnel", "commerce", "bureau", "entreprise", "atelier"])) return "LOCAL_PROFESSIONNEL";
  // Vérifié avant MODIFICATION_BRANCHEMENT : les deux mentionnent "compteur",
  // et un ordre inversé faisait tomber "déplacement de compteur" dans la
  // mauvaise catégorie (bug confirmé par les tests unitaires).
  if (contains(n, ["deplacement compteur", "deplacement de compteur", "compteur a deplacer"])) return "DEPLACEMENT_COMPTEUR";
  if (contains(n, ["modification", "augmentation de puissance", "changement de puissance", "branchement existant"])) return "MODIFICATION_BRANCHEMENT";
  if (contains(n, ["provisoire", "chantier", "installation temporaire"])) return "RACCORDEMENT_PROVISOIRE";
  if (contains(n, ["borne", "recharge", "voiture electrique", "vehicule electrique"])) return "NOUVEAU_RACCORDEMENT";
  return null;
}

export function isSkip(value: string) {
  // "non" est volontairement retiré de la liste ci-dessous vérifiée par
  // sous-chaîne (contains) : il provoquait un faux positif sur toute chaîne
  // le contenant, y compris à l'intérieur d'un autre mot (ex.
  // "manon.dupont@gmail.com" contient littéralement "non" — bug corrigé
  // ici). Il n'est reconnu que comme réponse négative ISOLÉE : le mot exact
  // "non", seul ou suivi uniquement de la politesse "merci" — jamais comme
  // sous-chaîne, et jamais comme détection générale des négations
  // françaises. En particulier, "non négociable" et "je ne veux pas" ne
  // doivent PAS devenir des skips par ce correctif (règle métier explicite) :
  // seule la présence exacte du mot isolé "non" (éventuellement + "merci")
  // déclenche ce cas, tout le reste de la phrase ("négociable", "ne veux
  // pas") le désactive.
  const n = normalize(value).trim();
  if (n === "non" || /^non\s+merci$/.test(n)) return true;
  return contains(value, ["aucun", "aucune", "rien", "pas de", "ras"]);
}

function isAffirmative(n: string) {
  return contains(n, ["j'accepte", "jaccepte", "accepte", "oui", "d'accord", "daccord", "ok", "je confirme"]);
}

export function isNegative(n: string) {
  // Même correctif que isSkip() (voir ci-dessus) et pour la même raison :
  // "non" détecté par sous-chaîne provoquait un faux positif sur toute
  // chaîne le contenant, y compris à l'intérieur d'un autre mot (ex.
  // "manon.dupont@gmail.com"). Il n'est reconnu ici que comme mot ISOLÉ
  // ("non" seul, ou suivi uniquement de "merci") — jamais comme sous-chaîne,
  // et jamais comme détection générale des négations françaises (ex. "non
  // négociable" reste volontairement hors de cette détection, comme pour
  // isSkip()). Les autres réponses négatives déjà reconnues ("refuse", "je
  // refuse", "pas d'accord", "pas daccord") restent inchangées, vérifiées
  // par sous-chaîne comme avant — ce correctif ne les modifie pas.
  const trimmed = normalize(n).trim();
  if (trimmed === "non" || /^non\s+merci$/.test(trimmed)) return true;
  return contains(n, ["refuse", "je refuse", "pas d'accord", "pas daccord"]);
}

/**
 * Génère une clé d'idempotence. Injectable via l'option `generateId` de
 * `stepLydie` pour garder le moteur testable de façon déterministe ; utilise
 * `crypto.randomUUID()` par défaut (disponible côté navigateur comme côté
 * Node ≥ 19, sans import supplémentaire).
 */
function defaultGenerateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Repli minimal, uniquement si crypto.randomUUID est indisponible dans
  // l'environnement d'exécution — ne doit normalement jamais servir.
  return `lydie-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Questions génériques, valables quel que soit l'étape — ne modifient jamais le contexte. */
function answerFaq(n: string): string | null {
  if (contains(n, ["gaz", "raccordement gaz"])) {
    return "Raccordement Assistance accompagne uniquement les demandes de raccordement électrique. Si votre projet concerne l'électricité, je peux vous guider.";
  }
  if (contains(n, ["prix", "tarif", "cout", "coût", "combien ça coute", "combien coute"])) {
    return "Le coût dépend du projet et de la situation du raccordement ; je ne peux pas l'inventer ici. Je peux en revanche vous aider à préparer le dossier.";
  }
  if (contains(n, ["delai", "délai", "combien de temps"])) {
    return "Le délai dépend du dossier et de la situation du raccordement. Je peux vous guider pour préparer les informations et pièces nécessaires.";
  }
  if (contains(n, ["enedis", "site enedis", "officiel"])) {
    return "Raccordement Assistance est un service indépendant et non affilié à Enedis. Je vous accompagne pour préparer votre demande ; Enedis prend ensuite le relais pour le traitement du raccordement.";
  }
  if (contains(n, ["suivre", "suivi", "numero de dossier", "numéro de dossier"])) {
    return "Pour suivre un dossier déjà créé, utilisez votre espace client avec votre numéro de dossier.";
  }
  return null;
}

function summaryText(context: LydieContext): string {
  const lines = [
    "Voici ce que j'ai compris :",
    `• Projet : ${context.project ? PROJECT_LABELS[context.project] : "non précisé"}`,
    `• Adresse : ${context.address ?? "non précisée"}`,
    `• E-mail de contact : ${context.email ?? "non précisé"}`,
    `• Informations complémentaires : ${context.details && !isSkip(context.details) ? context.details : "aucune"}`,
    `• Documents disponibles : ${context.documents && !isSkip(context.documents) ? context.documents : "aucun mentionné — si certains documents complémentaires sont nécessaires, ils pourront vous être directement demandés par Enedis au cours du traitement de votre dossier"}`,
    "",
    "Les documents seront transmis par e-mail, jamais directement dans l'application.",
    "",
    "Souhaitez-vous modifier une information, ou confirmer votre demande ?",
  ];
  return lines.join("\n");
}

/** La prochaine condition du mandat non encore acceptée, ou null si les 3 le sont. */
function nextMandatCondition(context: LydieContext) {
  return MANDAT_CONDITIONS.find((condition) => !context[condition.key]) ?? null;
}

/**
 * Fait avancer la conversation d'un tour. Fonction pure : aucun accès
 * réseau ni base de données, ce qui la rend entièrement testable en
 * unitaire sans dépendance.
 */
export function stepLydie(
  message: string,
  context: LydieContext = INITIAL_LYDIE_CONTEXT,
  options?: { generateId?: () => string }
): LydieResult {
  const generateId = options?.generateId ?? defaultGenerateId;
  const text = message.trim();
  const n = normalize(text);
  const notReady = (reply: string, nextContext: LydieContext = context): LydieResult => ({
    reply,
    context: nextContext,
    step: nextContext.step,
    readyToFinalize: false,
  });

  if (!text) {
    return notReady("Je n'ai pas bien compris. Pouvez-vous reformuler ?");
  }

  // Les questions génériques répondent sans jamais faire progresser ni régresser le parcours.
  const faqReply = answerFaq(n);
  if (faqReply && context.step !== "MODE") {
    return notReady(faqReply);
  }

  switch (context.step) {
    case "MODE": {
      // "parle" (et non seulement l'infinitif "parler") : "parler" reste
      // reconnu car il contient "parle" comme sous-chaîne — aucune perte de
      // couverture, ajout minimal pour couvrir la forme réellement tapée
      // ("Parle") sans construire de véritable mode vocal.
      if (contains(n, ["parle", "vocal", "appel", "telephone"])) {
        const next: LydieContext = { ...context, mode: "VOICE_UNAVAILABLE", step: "PROJECT" };
        return notReady(
          "Le mode vocal n'est pas disponible pour le moment, nous continuons par écrit. Décrivez-moi votre projet : maison neuve, local professionnel, modification de branchement, déplacement de compteur, raccordement provisoire ou borne de recharge.",
          next
        );
      }
      if (contains(n, ["ecrire", "texte", "chat", "bonjour", "salut", "hello", "bonsoir"]) || detectProject(text)) {
        const next: LydieContext = { ...context, mode: "TEXT", step: "PROJECT" };
        const project = detectProject(text);
        if (project) {
          // L'utilisateur a directement décrit son projet dès le premier
          // message. Mission P2B.1 (priorité 2/5) : s'il a AUSSI donné son
          // adresse complète dans ce même message, on ne la redemande pas
          // — voir findEmbeddedAddress() ci-dessus, toujours revalidée par
          // hasCompleteAddress() inchangée.
          const embeddedAddress = findEmbeddedAddress(text);
          if (embeddedAddress) {
            return notReady(
              projectAndAddressAcknowledgement(project, embeddedAddress),
              { ...next, project, address: embeddedAddress, addressDraft: null, step: "DETAILS" }
            );
          }
          return notReady(
            projectAcknowledgement(project, findGeoHint(text)),
            { ...next, project, step: "ADDRESS" }
          );
        }
        return notReady(
          "Parfait. Décrivez-moi votre projet : maison neuve, local professionnel, modification de branchement, déplacement de compteur, raccordement provisoire ou borne de recharge.",
          next
        );
      }
      return notReady("Bonjour 👋 Je suis Lydie. Vous préférez parler ou écrire ?");
    }

    case "PROJECT": {
      const project = detectProject(text);
      if (!project) {
        return notReady(
          "Je peux vous accompagner pour votre raccordement électrique. Décrivez-moi simplement votre projet : maison neuve, local professionnel, modification de branchement, déplacement de compteur, raccordement provisoire ou borne de recharge."
        );
      }
      // Même logique qu'en MODE ci-dessus (mission P2B.1, priorité 2/5) :
      // si l'adresse est déjà dans ce même message, on ne la redemande pas.
      const embeddedAddress = findEmbeddedAddress(text);
      if (embeddedAddress) {
        return notReady(
          projectAndAddressAcknowledgement(project, embeddedAddress),
          { ...context, project, address: embeddedAddress, addressDraft: null, step: "DETAILS" }
        );
      }
      return notReady(
        projectAcknowledgement(project, findGeoHint(text)),
        { ...context, project, step: "ADDRESS" }
      );
    }

    case "ADDRESS": {
      // Cas historique inchangé : ce seul message suffit déjà.
      if (hasCompleteAddress(text)) {
        return notReady(DETAILS_QUESTION, {
          ...context,
          address: text.trim().replace(/\s+/g, " "),
          addressDraft: null,
          step: "DETAILS",
        });
      }

      // Adresse envoyée en plusieurs messages : on tente de recomposer avec
      // le fragment déjà mémorisé (voir buildAddressMergeCandidates ci-
      // dessus). Toujours revalidé par hasCompleteAddress() — jamais une
      // validation séparée, jamais plus permissif que le cas ci-dessus.
      const validated = buildAddressMergeCandidates(context.addressDraft, text).find(hasCompleteAddress);
      if (validated) {
        return notReady(DETAILS_QUESTION, { ...context, address: validated, addressDraft: null, step: "DETAILS" });
      }

      // Toujours incomplet : on mémorise ce nouveau fragment (en le
      // combinant simplement au précédent) pour retenter au tour suivant —
      // jamais perdu, jamais accepté comme adresse valide entre-temps.
      const combinedDraft = context.addressDraft
        ? `${context.addressDraft.trim()} ${text.trim()}`.replace(/\s+/g, " ")
        : text.trim();
      return notReady(
        "Il me manque une adresse complète avec ses 4 éléments : numéro, voie, code postal et ville (exemple : 12 rue de la Paix, 75001 Paris). Vous pouvez me l'envoyer en plusieurs messages, je recomposerai ce qui manque.",
        { ...context, addressDraft: combinedDraft }
      );
    }

    case "DETAILS": {
      // Les documents proposés ici servent uniquement à anticiper et
      // accélérer le traitement du dossier — ce ne sont jamais des
      // documents bloquants (voir documentRecommendations.ts). Que le
      // client les ait ou non, l'étape DOCUMENTS qui suit fait toujours
      // avancer le parcours.
      const recommendation = getRecommendedDocuments(context.project);
      let question =
        "Quelles pièces ou justificatifs avez-vous déjà sous la main ? Si vous n'en avez pas, aucun problème : nous pouvons continuer, Enedis pourra vous les demander plus tard si nécessaire. Si vous en avez, ils seront à transmettre par e-mail, pas directement ici.";
      if (!recommendation.nonEtabli && recommendation.documents.length) {
        const labels = recommendation.documents.map((d) => d.label).join(" ou un ");
        question = `Pour préparer au mieux votre dossier auprès d'Enedis, avez-vous déjà un ${labels} ? Si non, aucun problème, nous pouvons continuer — Enedis pourra vous le demander plus tard si nécessaire. Si oui, dites-le-moi : il sera à transmettre par e-mail, pas directement ici.`;
      }
      return notReady(question, { ...context, details: text, step: "DOCUMENTS" });
    }

    case "DOCUMENTS": {
      // Les documents complémentaires ne sont jamais bloquants — toute
      // réponse ici (y compris "aucun") fait avancer vers l'e-mail.
      return notReady(
        "Merci. Il me faut maintenant votre adresse e-mail : c'est la seule façon de vous transmettre votre dossier et d'échanger les documents avec vous.",
        { ...context, documents: text, step: "EMAIL" }
      );
    }

    case "EMAIL": {
      if (isEmailSkipAttempt(n) || isSkip(text)) {
        return notReady("Sans e-mail, je ne peux malheureusement pas transmettre ni suivre votre dossier — c'est indispensable. Pouvez-vous m'en donner un valide ?");
      }
      if (!isValidEmail(text)) {
        return notReady("Cette adresse ne semble pas valide (format attendu : nom@domaine.fr). Pouvez-vous la resaisir ?");
      }
      const next: LydieContext = {
        ...context,
        email: text.trim(),
        step: "SUMMARY",
        // Générée une seule fois, à la première entrée dans le récapitulatif.
        confirmationKey: context.confirmationKey ?? generateId(),
      };
      return notReady(summaryText(next), next);
    }

    case "SUMMARY": {
      if (contains(n, ["confirmer", "confirme", "je confirme", "c'est bon", "ok pour moi"])) {
        const next: LydieContext = { ...context, step: "MANDAT" };
        const first = nextMandatCondition(next);
        return notReady(
          "Avant de transmettre votre demande, j'ai besoin de votre accord sur 3 points distincts.\n\n" + (first?.prompt ?? ""),
          next
        );
      }
      if (contains(n, ["modifier", "changer", "corriger"])) {
        if (contains(n, ["projet"]))
          // addressDraft est déjà garanti `null` à ce stade (il ne peut
          // devenir non-null qu'à l'étape ADDRESS, laquelle le remet
          // toujours à `null` avant de progresser vers DETAILS — voir
          // LYDIE-MEMORY-SPEC.md §6) : cette remise à zéro explicite est une
          // protection défensive, jamais un cas réellement atteignable avec
          // un fragment en attente, mais elle ferme ce cas limite plutôt que
          // de reposer uniquement sur cette garantie structurelle.
          return notReady("Très bien, redécrivez votre projet.", { ...context, project: null, addressDraft: null, step: "PROJECT" });
        // Bug trouvé et corrigé pendant l'audit P3.4 : « email » est
        // vérifié AVANT « adresse », volontairement. « adresse » est vérifié
        // par sous-chaîne (contains) — « modifier mon adresse email »/« ...
        // adresse mail » (tournure française courante) contient donc « adresse »
        // ET « email »/« mail » à la fois. Avec l'ordre inverse, une telle
        // phrase tombait TOUJOURS dans la branche adresse postale, jamais
        // dans la branche e-mail : un vrai parcours cassé pour quiconque
        // dit naturellement « adresse email ». Aucune régression côté
        // adresse postale : « adresse » seul ne contient jamais « mail ».
        if (contains(n, ["email", "e-mail", "mail"])) return notReady("Très bien, donnez-moi la nouvelle adresse e-mail.", { ...context, email: null, step: "EMAIL" });
        if (contains(n, ["adresse"])) return notReady("Très bien, redonnez-moi l'adresse exacte.", { ...context, address: null, addressDraft: null, step: "ADDRESS" });
        if (contains(n, ["detail", "complementaire", "information"])) return notReady("Très bien, quelles informations complémentaires voulez-vous préciser ?", { ...context, details: null, step: "DETAILS" });
        if (contains(n, ["document"])) return notReady("Très bien, quels documents avez-vous déjà ?", { ...context, documents: null, step: "DOCUMENTS" });
        return notReady("Que souhaitez-vous modifier : le projet, l'adresse, l'e-mail, les informations complémentaires ou les documents ?");
      }
      return notReady("Répondez « modifier » pour corriger une information, ou « confirmer » pour valider votre demande telle quelle.");
    }

    case "MANDAT": {
      const current = nextMandatCondition(context);
      if (!current) {
        // Les 3 sont déjà acceptées (ne devrait arriver qu'une fois, au tour
        // qui vient de les compléter) : on finalise.
        const next: LydieContext = { ...context, confirmed: true, step: "DONE" };
        return { reply: "Merci, les 3 conditions sont validées : votre demande est confirmée.", context: next, step: "DONE", readyToFinalize: true };
      }
      if (isNegative(n)) {
        return notReady(
          "Sans cet accord, votre demande ne peut pas être transmise — les 3 conditions sont toutes obligatoires. Vous pouvez reprendre quand vous êtes prêt.\n\n" + current.prompt
        );
      }
      if (!isAffirmative(n)) {
        return notReady("Merci de répondre « j'accepte » ou « non » pour continuer.\n\n" + current.prompt);
      }
      const updated: LydieContext = { ...context, [current.key]: true };
      const remaining = nextMandatCondition(updated);
      if (!remaining) {
        const next: LydieContext = { ...updated, confirmed: true, step: "DONE" };
        return { reply: "Merci, les 3 conditions sont validées : votre demande est confirmée.", context: next, step: "DONE", readyToFinalize: true };
      }
      return notReady(remaining.prompt, updated);
    }

    case "DONE": {
      if (context.dossierId) {
        return notReady("Votre dossier est déjà créé et confirmé. Vous pouvez le suivre depuis votre espace client.");
      }
      return notReady("Votre demande est confirmée et en attente de finalisation.");
    }

    default:
      return notReady("Bonjour 👋 Je suis Lydie. Vous préférez parler ou écrire ?", INITIAL_LYDIE_CONTEXT);
  }
}
