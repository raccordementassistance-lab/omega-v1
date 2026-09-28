/**
 * Orchestrateur Lydie V2 — PHASE 1 : OBSERVATION UNIQUEMENT.
 *
 * Architecture cible de cette phase :
 *
 *   Utilisateur → Orchestrateur → classification/extraction → observation structurée
 *
 * ════════════════════════════════════════════════════════════════════════
 * GARANTIES DE CETTE PHASE (lues avant tout le reste de ce fichier)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Ce module est un lecteur pur. Il :
 *   - n'importe ni Prisma, ni `@/lib/prisma`, ni aucun repository ;
 *   - n'écrit aucun état métier (aucun `create`/`update`/`delete`) ;
 *   - ne touche jamais Dossier, Demande ou Document ;
 *   - ne déclenche aucune transition J20 (n'importe pas
 *     `transitionDossierInTransaction` ni `assertGuards`) ;
 *   - ne modifie ni n'appelle le mandat, ni ne crée/modifie MANDAT_SIGNE ;
 *   - ne remplace ni n'appelle `stepLydie()` (le moteur Lydie actuel) —
 *     il ne fait qu'observer le même texte brut, EN PARALLÈLE, sans jamais
 *     influencer la vraie conversation ni le vrai `LydieContext` ;
 *   - ne modifie AUCUN fichier existant (engine.ts, parseAddress.ts,
 *     state-machine-engine.ts, documentRecommendations.ts, route.ts, les
 *     validations Zod, la doctrine documentaire) : ce fichier est neuf et
 *     isolé, rien d'autre n'a été touché pour le construire.
 *
 * `observe()` est une fonction synchrone, pure, sans effet de bord : même
 * entrée → même sortie, aucun appel réseau, aucune lecture/écriture disque
 * ou base de données. C'est ce qui rend la garantie « lecture seule »
 * vérifiable mécaniquement (voir le test dédié dans
 * src/tests/unit/lydie-orchestrator.test.ts, section « Garantie read-only »).
 *
 * Ce que l'orchestrateur PRODUIT reste, pour l'instant, sans consommateur :
 * aucune route API, aucun composant, aucun autre fichier n'importe encore
 * `observe()` — ce module n'est appelé par rien en production à l'issue de
 * cette phase. Le brancher sur quoi que ce soit de réel (route, moteur,
 * UI) est explicitement hors périmètre de la Phase 1.
 *
 * ════════════════════════════════════════════════════════════════════════
 * CE QUE CE FICHIER RÉUTILISE DU MOTEUR RÉEL (jamais dupliqué à l'identique
 * sans le dire), ET CE QU'IL DUPLIQUE DÉLIBÉRÉMENT
 * ════════════════════════════════════════════════════════════════════════
 *
 * Réutilisé tel quel (fonctions déjà exportées par le moteur réel — la
 * référence reste `src/lib/lydie/engine.ts`, non modifié) :
 *   - `isSkip`, `isNegative`, `isValidEmail` (engine.ts)
 *   - `parseAddressStrict` (parseAddress.ts), pour CONFIRMER qu'un candidat
 *     d'adresse trouvé dans un message plus long est bien une adresse
 *     complète au sens strict déjà validé par le moteur.
 *
 * Dupliqué délibérément, avec commentaire d'alignement (même principe déjà
 * établi dans ce projet entre `ADDRESS_PATTERN` d'engine.ts et de
 * parseAddress.ts) :
 *   - La détection de type de projet par mots-clés : `detectProject()`
 *     n'est PAS exportée par engine.ts, et cette phase interdit de modifier
 *     engine.ts pour l'exporter. La version ci-dessous
 *     (`inferProjectTypeHeuristic`) reprend les mêmes catégories et les
 *     mêmes mots-clés, mais est explicitement qualifiée de MODEL_INFERENCE
 *     (une supposition de l'observateur), jamais de DETERMINISTIC_RULE —
 *     seule `detectProject()` dans le moteur réel a l'autorité de decision
 *     métier. DOIT rester alignée si `LydieProjectType` change.
 *   - La recherche d'une adresse en SOUS-CHAÎNE d'un message plus long :
 *     `parseAddressStrict()` est ancrée (`^...$`) sur tout le texte reçu —
 *     par construction (c'est un validateur d'étape ADDRESS où le tour
 *     entier EST la réponse). L'orchestrateur observe du texte libre où
 *     l'adresse peut n'être qu'un fragment de la phrase (cas de test n°2 :
 *     projet + adresse dans le même message) ; il lui faut donc une
 *     recherche non ancrée. Le motif ci-dessous n'est qu'une version non
 *     ancrée du même schéma structurel, et le résultat trouvé est ensuite
 *     RE-VALIDÉ en appelant `parseAddressStrict()` sur le fragment isolé —
 *     jamais une validation propre, toujours une délégation à la fonction
 *     réelle pour le verdict final.
 */

import {
  isSkip,
  isNegative,
  isValidEmail,
  type LydieProjectType,
} from "./engine";
import { parseAddressStrict } from "./parseAddress";

// ────────────────────────────────────────────────────────────────────────
// PHASE 2A — imports ajoutés UNIQUEMENT pour le nouveau point d'entrée
// `orchestrate()` tout en bas de ce fichier (voir cette section). Rien
// au-dessus de cette ligne, et rien dans `observe()` lui-même, n'est
// modifié : la Phase 1 reste inchangée et son comportement, testé par
// src/tests/unit/lydie-orchestrator.test.ts, reste garanti identique.
import { extractAll } from "./extraction";
import { mergeWorkingContext, INITIAL_WORKING_CONTEXT, type WorkingContext } from "./context";
import { reason, type Reasoning } from "./reasoning";

// ──────────────────────────────────────────────────────────────────────
// Statuts épistémologiques
// ──────────────────────────────────────────────────────────────────────

/**
 * Statut épistémologique d'une valeur observée ou d'une classification.
 *
 * Distinction volontairement stricte, demandée explicitement :
 * MODEL_INFERENCE ≠ USER_CONFIRMED ≠ VALIDATED.
 *
 *  - MODEL_INFERENCE   : supposition de l'observateur (mot-clé, heuristique
 *                        de formulation) — jamais une certitude.
 *  - CONTEXT_DERIVED   : valeur reportée depuis le contexte de travail
 *                        précédent (l'utilisateur n'a rien redit dans CE
 *                        message ; on réutilise ce qui était déjà observé).
 *  - USER_CONFIRMED    : l'utilisateur vient d'confirmer EXPLICITEMENT,
 *                        dans ce message, une valeur déjà proposée par un
 *                        tour précédent (ex. intent CONFIRMATION sur un
 *                        champ qui était encore MODEL_INFERENCE). Ce n'est
 *                        toujours qu'une observation textuelle : ça ne
 *                        déclenche ni n'équivaut à une validation métier.
 *  - DETERMINISTIC_RULE: produit par une règle mécanique sans ambiguïté
 *                        (regex, fonction déjà validée du moteur réel —
 *                        isSkip/isNegative/isValidEmail/parseAddressStrict).
 *  - INTERNAL_RULE     : politique interne de l'orchestrateur (ex. heuristique
 *                        de détection de tentative de contournement
 *                        d'instructions) — distincte d'une règle purement
 *                        linguistique : c'est une garde de sécurité, pas
 *                        une extraction de sens.
 *  - VERIFIED_SOURCE   : vérifié auprès d'une source faisant autorité en
 *                        dehors du message lui-même (ex. une vraie
 *                        vérification d'adresse via l'API BAN). RÉSERVÉ —
 *                        jamais produit par cette Phase 1, qui n'accède à
 *                        aucune source externe.
 *  - VALIDATED         : validé par le vrai moteur métier J20 (guards,
 *                        transitions). RÉSERVÉ — cet orchestrateur ne
 *                        produit JAMAIS ce statut lui-même (voir le test
 *                        dédié « aucun VALIDATED émis par l'orchestrateur »).
 *  - UNKNOWN           : rien de déterminé.
 */
export type EpistemicStatus =
  | "MODEL_INFERENCE"
  | "CONTEXT_DERIVED"
  | "USER_CONFIRMED"
  | "DETERMINISTIC_RULE"
  | "INTERNAL_RULE"
  | "VERIFIED_SOURCE"
  | "VALIDATED"
  | "UNKNOWN";

/** Statuts que cette Phase 1 s'interdit explicitement de produire elle-même. */
export const RESERVED_STATUSES: readonly EpistemicStatus[] = ["VERIFIED_SOURCE", "VALIDATED"];

export interface ObservedValue<T> {
  value: T | null;
  status: EpistemicStatus;
  /** Extrait du message ayant produit cette valeur — traçabilité, jamais réutilisé pour décider. */
  evidence: string | null;
}

function unknownValue<T>(): ObservedValue<T> {
  return { value: null, status: "UNKNOWN", evidence: null };
}

// ──────────────────────────────────────────────────────────────────────
// Intentions
// ──────────────────────────────────────────────────────────────────────

export type LydieIntent =
  | "QUESTION"
  | "INFORMATION"
  | "CORRECTION"
  | "DESCRIPTION_PROJET"
  | "CONFIRMATION"
  | "REFUS"
  | "ABANDON"
  | "DEMANDE_STATUT"
  | "DEMANDE_HUMAINE"
  | "PROMPT_INJECTION"
  | "INCONNU";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface IntentClassification {
  intent: LydieIntent;
  status: EpistemicStatus;
  confidence: Confidence;
  /** Explications lisibles des règles/mots-clés ayant produit ce verdict. */
  reasons: string[];
}

// ──────────────────────────────────────────────────────────────────────
// Ambiguïtés / contradictions
// ──────────────────────────────────────────────────────────────────────

export type ObservationFlagCode =
  | "PROJECT_TYPE_UNRESOLVED"
  | "PROJECT_TYPE_CONTRADICTION"
  | "ELLIPTICAL_MESSAGE"
  | "POSSIBLE_INSTRUCTION_OVERRIDE_ATTEMPT"
  | "MULTIPLE_INTENTS_POSSIBLE";

export interface ObservationFlag {
  code: ObservationFlagCode;
  message: string;
}

// ──────────────────────────────────────────────────────────────────────
// Contexte de travail (JAMAIS le vrai LydieContext, jamais transmis à
// stepLydie(), jamais persisté)
// ──────────────────────────────────────────────────────────────────────

export interface WorkingLydieContext {
  project: ObservedValue<LydieProjectType>;
  address: ObservedValue<string>;
  email: ObservedValue<string>;
  /** true si isSkip() (moteur réel) reconnaît ce message comme un "aucun/rien/pas de...". */
  skipSignal: ObservedValue<boolean>;
  /** true si isNegative() (moteur réel) reconnaît ce message comme un refus isolé. */
  negativeSignal: ObservedValue<boolean>;
  /**
   * Identifiants du monde réel. Explicitement nullable au démarrage — cette
   * Phase 1 ne les résout, ne les devine et ne les crée jamais : ce sont de
   * simples valeurs d'entrée, transmises telles que fournies par l'appelant
   * (qui n'existe pas encore en Phase 1), jamais lues depuis Prisma.
   */
  dossierId: string | null;
  demandeId: string | null;
}

export interface ObserveInput {
  message: string;
  /**
   * Contexte de travail du tour précédent, tel que RENVOYÉ par un appel
   * antérieur à `observe()` — jamais le vrai `LydieContext` du moteur.
   * Optionnel : le tout premier message d'une conversation n'en a pas.
   */
  previous?: WorkingLydieContext;
  /** Transmis tel quel, jamais résolu ni deviné ici (voir WorkingLydieContext). */
  dossierId?: string | null;
  demandeId?: string | null;
}

export interface LydieObservation {
  message: string;
  intent: IntentClassification;
  context: WorkingLydieContext;
  flags: ObservationFlag[];
}

// ──────────────────────────────────────────────────────────────────────
// Normalisation locale (copie minimale et alignée de engine.ts#normalize —
// non exportée là-bas ; ne change jamais de comportement indépendamment).
// ──────────────────────────────────────────────────────────────────────

// Même correctif, pour la même raison, qu'engine.ts#normalize (voir son
// commentaire) : les claviers mobiles substituent silencieusement
// l'apostrophe droite (') par une variante typographique (’, ‘, ´) — sans
// cette normalisation, tous les mots-clés à apostrophe de ce fichier
// (CONFIRMATION_WORDS, ABANDON_WORDS, ...) cessaient de matcher.
function normalize(value: string): string {
  return value
    .replace(/[’‘´]/g, "'")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function containsAny(text: string, words: string[]): string | null {
  const n = normalize(text);
  for (const word of words) {
    if (n.includes(normalize(word))) return word;
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// Extraction — type de projet (MODEL_INFERENCE, jamais DETERMINISTIC_RULE)
// ──────────────────────────────────────────────────────────────────────

const PROJECT_KEYWORDS: Array<{ type: LydieProjectType; words: string[] }> = [
  { type: "MAISON_NEUVE", words: ["maison neuve", "construction", "nouvelle maison", "terrain", "maison", "neuve"] },
  { type: "LOCAL_PROFESSIONNEL", words: ["local professionnel", "commerce", "bureau", "entreprise", "atelier"] },
  { type: "DEPLACEMENT_COMPTEUR", words: ["deplacement compteur", "deplacement de compteur", "compteur a deplacer"] },
  { type: "MODIFICATION_BRANCHEMENT", words: ["modification", "augmentation de puissance", "changement de puissance", "branchement existant"] },
  { type: "RACCORDEMENT_PROVISOIRE", words: ["provisoire", "chantier", "installation temporaire"] },
  { type: "NOUVEAU_RACCORDEMENT", words: ["borne", "recharge", "voiture electrique", "vehicule electrique"] },
];

/**
 * Heuristique d'observation, PAS une décision métier. Retourne toujours
 * MODEL_INFERENCE quand un mot-clé matche, jamais DETERMINISTIC_RULE :
 * seule `detectProject()` dans engine.ts a autorité pour faire progresser
 * une vraie conversation. Retourne UNKNOWN si aucune des catégories
 * connues ne matche — en particulier, un mot comme "extension" (absent de
 * `LydieProjectType`) ne matche RIEN ici, volontairement : ce fichier ne
 * doit jamais inventer une catégorie métier qui n'existe pas dans le
 * moteur réel (voir cas de test n°5 et la note d'ambiguïté associée dans
 * le rapport livré avec cette Phase 1).
 */
function inferProjectTypeHeuristic(message: string): ObservedValue<LydieProjectType> {
  for (const { type, words } of PROJECT_KEYWORDS) {
    const hit = containsAny(message, words);
    if (hit) {
      return { value: type, status: "MODEL_INFERENCE", evidence: hit };
    }
  }
  return unknownValue();
}

// ──────────────────────────────────────────────────────────────────────
// Extraction — adresse (candidat en sous-chaîne, puis RE-VALIDÉ par la
// vraie fonction du moteur : parseAddressStrict)
// ──────────────────────────────────────────────────────────────────────

// Version NON ANCRÉE du schéma structurel de ADDRESS_PATTERN
// (engine.ts / parseAddress.ts, non modifiés) : cherche un candidat
// n'importe où dans un texte plus long. Le verdict final n'appartient
// jamais à ce motif — voir extractAddressCandidate() ci-dessous.
const ADDRESS_SUBSTRING_PATTERN =
  /\d+\s*(?:bis|ter)?\s+[^\d,]+?\s*(?:,\s*[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*?\s+\d{5}|,?\s*\d{5}\s+[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*)/i;

function extractAddressCandidate(message: string): ObservedValue<string> {
  // 1) Le message ENTIER est peut-être déjà une adresse complète (cas
  //    habituel de l'étape ADDRESS du moteur réel) : délégation directe.
  if (parseAddressStrict(message) !== null) {
    return { value: message.trim().replace(/\s+/g, " "), status: "DETERMINISTIC_RULE", evidence: message.trim() };
  }
  // 2) Sinon, un FRAGMENT du message contient peut-être une adresse
  //    complète (cas de test n°2 : projet + adresse dans le même message).
  //    On isole le candidat, puis on délègue à nouveau à la vraie fonction
  //    du moteur pour confirmer : jamais de validation "faite à la main"
  //    ici, uniquement une recherche de fragment.
  const match = message.match(ADDRESS_SUBSTRING_PATTERN);
  if (match) {
    const candidate = match[0].trim().replace(/\s+/g, " ");
    if (parseAddressStrict(candidate) !== null) {
      return { value: candidate, status: "DETERMINISTIC_RULE", evidence: candidate };
    }
  }
  return unknownValue();
}

// ──────────────────────────────────────────────────────────────────────
// Extraction — e-mail (délégation directe à isValidEmail du moteur réel)
// ──────────────────────────────────────────────────────────────────────

const EMAIL_SEARCH_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

function extractEmailCandidate(message: string): ObservedValue<string> {
  const match = message.match(EMAIL_SEARCH_PATTERN);
  if (match && isValidEmail(match[0])) {
    return { value: match[0], status: "DETERMINISTIC_RULE", evidence: match[0] };
  }
  return unknownValue();
}

// ──────────────────────────────────────────────────────────────────────
// Classification d'intention
// ──────────────────────────────────────────────────────────────────────

// Heuristique interne, volontairement prudente et NON exhaustive : ceci
// n'est PAS un dispositif de sécurité (aucune garantie de détection
// exhaustive d'injection de prompt), seulement un signal d'observation
// destiné à être examiné par un humain avant toute décision. Ne bloque,
// ne filtre et ne modifie jamais le message ni son traitement — Phase 1
// est purement observationnelle.
const INSTRUCTION_OVERRIDE_PATTERNS: RegExp[] = [
  /\bignore\b.{0,30}\b(regles?|instructions?|consignes?)\b/i,
  /\boutrepasse/i,
  /\bcontourne/i,
  /\bdesactive\b.{0,20}\b(regles?|guard|verification)\b/i,
  /\btu\s+es\s+maintenant\b/i,
  /\bnouvelles?\s+instructions?\b/i,
  /\bvalide\s+(mon\s+dossier|directement)\b/i,
  /\bsans\s+v[ée]rification\b/i,
];

const ABANDON_WORDS = ["j'abandonne", "jabandonne", "laisse tomber", "annule tout", "je ne veux plus continuer", "stop tout"];
const HUMAN_REQUEST_WORDS = ["conseiller humain", "un humain", "vrai conseiller", "parler a quelqu'un", "parler a une personne"];
const STATUS_REQUEST_WORDS = ["ou en est mon dossier", "statut de mon dossier", "avancement de mon dossier", "ou en est ma demande"];
const CORRECTION_WORDS = ["finalement", "en fait non", "je me suis trompe", "plutot que", "correction :", "je corrige"];
const CONFIRMATION_WORDS = ["j'accepte", "jaccepte", "accepte", "d'accord", "daccord", "je confirme", "oui"];
const INTERROGATIVE_STARTERS = ["quoi", "comment", "pourquoi", "quand", "ou est", "est-ce que", "qui", "combien"];

function classifyIntent(message: string, projectHeuristic: ObservedValue<LydieProjectType>, addressHeuristic: ObservedValue<string>): IntentClassification {
  const trimmed = message.trim();

  const injectionHit = INSTRUCTION_OVERRIDE_PATTERNS.find((pattern) => pattern.test(trimmed));
  if (injectionHit) {
    return {
      intent: "PROMPT_INJECTION",
      status: "INTERNAL_RULE",
      confidence: "MEDIUM",
      reasons: [`motif de contournement détecté : ${injectionHit}`],
    };
  }

  // isNegative()/isSkip() sont les fonctions RÉELLES du moteur (non
  // dupliquées) : un refus ou un "aucun/rien" isolé au sens du moteur est
  // rapporté ici avec la même autorité (DETERMINISTIC_RULE), jamais
  // reclassé différemment par cet orchestrateur.
  if (isNegative(trimmed)) {
    return { intent: "REFUS", status: "DETERMINISTIC_RULE", confidence: "HIGH", reasons: ["isNegative() du moteur réel a reconnu un refus isolé"] };
  }

  const abandonHit = containsAny(trimmed, ABANDON_WORDS);
  if (abandonHit) {
    return { intent: "ABANDON", status: "MODEL_INFERENCE", confidence: "MEDIUM", reasons: [`mot-clé d'abandon détecté : "${abandonHit}"`] };
  }

  const humanHit = containsAny(trimmed, HUMAN_REQUEST_WORDS);
  if (humanHit) {
    return { intent: "DEMANDE_HUMAINE", status: "MODEL_INFERENCE", confidence: "HIGH", reasons: [`demande explicite d'un interlocuteur humain : "${humanHit}"`] };
  }

  const statusHit = containsAny(trimmed, STATUS_REQUEST_WORDS);
  if (statusHit) {
    return { intent: "DEMANDE_STATUT", status: "MODEL_INFERENCE", confidence: "HIGH", reasons: [`demande de statut détectée : "${statusHit}"`] };
  }

  const correctionHit = containsAny(trimmed, CORRECTION_WORDS);
  if (correctionHit) {
    return { intent: "CORRECTION", status: "MODEL_INFERENCE", confidence: "MEDIUM", reasons: [`formulation de correction détectée : "${correctionHit}"`] };
  }

  const confirmationHit = containsAny(trimmed, CONFIRMATION_WORDS);
  if (confirmationHit) {
    return { intent: "CONFIRMATION", status: "MODEL_INFERENCE", confidence: "MEDIUM", reasons: [`formulation de confirmation détectée : "${confirmationHit}"`] };
  }

  const hasQuestionMark = trimmed.includes("?");
  const interrogativeHit = containsAny(trimmed, INTERROGATIVE_STARTERS);
  if (hasQuestionMark || interrogativeHit) {
    return {
      intent: "QUESTION",
      status: hasQuestionMark ? "DETERMINISTIC_RULE" : "MODEL_INFERENCE",
      confidence: hasQuestionMark ? "HIGH" : "MEDIUM",
      reasons: [
        hasQuestionMark ? "présence d'un point d'interrogation" : `mot interrogatif détecté : "${interrogativeHit}"`,
      ],
    };
  }

  if (projectHeuristic.value || addressHeuristic.value) {
    return {
      intent: "DESCRIPTION_PROJET",
      status: "MODEL_INFERENCE",
      confidence: projectHeuristic.value && addressHeuristic.value ? "HIGH" : "MEDIUM",
      reasons: [
        projectHeuristic.value ? `type de projet suggéré : ${projectHeuristic.value}` : null,
        addressHeuristic.value ? "adresse complète détectée dans le message" : null,
      ].filter((r): r is string => r !== null),
    };
  }

  // isValidEmail seul (message = uniquement une adresse e-mail, ex. cas de
  // test n°9) : ce n'est ni une question, ni un projet — c'est une
  // information transmise, sans plus.
  if (isValidEmail(trimmed)) {
    return { intent: "INFORMATION", status: "DETERMINISTIC_RULE", confidence: "HIGH", reasons: ["message reconnu comme une adresse e-mail valide"] };
  }

  if (isSkip(trimmed)) {
    return { intent: "INFORMATION", status: "DETERMINISTIC_RULE", confidence: "MEDIUM", reasons: ["isSkip() du moteur réel a reconnu une réponse de type \"aucun/rien\""] };
  }

  return { intent: "INCONNU", status: "UNKNOWN", confidence: "LOW", reasons: ["aucune règle de classification ne matche ce message"] };
}

// ──────────────────────────────────────────────────────────────────────
// Point d'entrée
// ──────────────────────────────────────────────────────────────────────

/**
 * Observe un message, de façon purement fonctionnelle et sans effet de
 * bord (voir les garanties en tête de fichier). Ne modifie ni ne lit
 * jamais aucun état réel — `previous` est uniquement le résultat d'un
 * appel antérieur à `observe()` elle-même, jamais le vrai `LydieContext`.
 */
export function observe(input: ObserveInput): LydieObservation {
  const { message, previous, dossierId = null, demandeId = null } = input;
  const flags: ObservationFlag[] = [];

  const projectHeuristic = inferProjectTypeHeuristic(message);
  const addressHeuristic = extractAddressCandidate(message);
  const emailHeuristic = extractEmailCandidate(message);
  const skipSignal: ObservedValue<boolean> = { value: isSkip(message), status: "DETERMINISTIC_RULE", evidence: message };
  const negativeSignal: ObservedValue<boolean> = { value: isNegative(message), status: "DETERMINISTIC_RULE", evidence: message };

  const intent = classifyIntent(message, projectHeuristic, addressHeuristic);

  // Message elliptique : aucune extraction, aucun signal fort, et pas de
  // question explicite non plus (ex. cas de test n°4, "Et après ?", capté
  // ici seulement s'il n'a même pas déclenché la règle "?").
  if (intent.intent === "INCONNU" && message.trim().length > 0) {
    flags.push({
      code: "ELLIPTICAL_MESSAGE",
      message: "Message trop elliptique pour être classifié avec confiance ; dépend du contexte conversationnel non observable ici.",
    });
  }

  // Type de projet mentionné mais non reconnu par les catégories connues
  // (ex. "extension") : signalé, jamais deviné.
  const mentionsUnrecognizedProjectChange =
    intent.intent === "CORRECTION" && projectHeuristic.status === "UNKNOWN";
  if (mentionsUnrecognizedProjectChange) {
    flags.push({
      code: "PROJECT_TYPE_UNRESOLVED",
      message:
        "Le message semble corriger le type de projet, mais aucune catégorie LydieProjectType connue ne correspond au texte fourni. Décision métier requise avant toute interprétation (voir rapport de livraison).",
    });
  }

  // Contradiction avec le tour précédent : un type de projet différent
  // était déjà observé, et ce nouveau message ne le confirme pas.
  let project = projectHeuristic;
  if (previous?.project.value && projectHeuristic.value && previous.project.value !== projectHeuristic.value) {
    flags.push({
      code: "PROJECT_TYPE_CONTRADICTION",
      message: `Le projet précédemment observé (${previous.project.value}) contredit le nouveau type détecté (${projectHeuristic.value}). Non résolu automatiquement.`,
    });
  } else if (previous?.project.value && projectHeuristic.status === "UNKNOWN" && mentionsUnrecognizedProjectChange) {
    flags.push({
      code: "PROJECT_TYPE_CONTRADICTION",
      message: `Le projet précédemment observé (${previous.project.value}) est remis en cause par ce message, mais le nouveau type mentionné n'est pas reconnu. Non résolu automatiquement.`,
    });
  } else if (!projectHeuristic.value && previous?.project.value) {
    // Rien de nouveau dit sur le projet dans ce tour : on reporte la
    // valeur précédente en la requalifiant CONTEXT_DERIVED (jamais
    // MODEL_INFERENCE, puisque ce tour-ci n'a rien inféré de neuf).
    project = { ...previous.project, status: "CONTEXT_DERIVED" };
  }

  let address = addressHeuristic.value ? addressHeuristic : previous?.address.value ? { ...previous.address, status: "CONTEXT_DERIVED" as const } : addressHeuristic;
  let email = emailHeuristic.value ? emailHeuristic : previous?.email.value ? { ...previous.email, status: "CONTEXT_DERIVED" as const } : emailHeuristic;

  // Transition MODEL_INFERENCE → USER_CONFIRMED : seulement quand ce tour
  // est une CONFIRMATION explicite ET qu'un champ du tour précédent était
  // encore à l'état MODEL_INFERENCE. Jamais l'inverse (une confirmation ne
  // fabrique jamais de valeur qui n'existait pas déjà).
  if (intent.intent === "CONFIRMATION" && previous) {
    if (previous.project.status === "MODEL_INFERENCE" && previous.project.value) {
      project = { ...previous.project, status: "USER_CONFIRMED" };
    }
    if (previous.address.status === "MODEL_INFERENCE" && previous.address.value) {
      address = { ...previous.address, status: "USER_CONFIRMED" };
    }
    if (previous.email.status === "MODEL_INFERENCE" && previous.email.value) {
      email = { ...previous.email, status: "USER_CONFIRMED" };
    }
  }

  const context: WorkingLydieContext = {
    project,
    address,
    email,
    skipSignal,
    negativeSignal,
    dossierId,
    demandeId,
  };

  return { message, intent, context, flags };
}

// ════════════════════════════════════════════════════════════════════════
// PHASE 2A — Orchestrateur V2 : `orchestrate()`
// ════════════════════════════════════════════════════════════════════════
//
// Tout ce qui précède cette section est la Phase 1, INCHANGÉE. `observe()`
// n'est ni modifiée, ni remplacée : `orchestrate()` la RÉUTILISE (elle
// l'appelle une fois, sans lui transmettre `previous` — voir plus bas
// pourquoi) uniquement pour sa classification d'intention, déjà validée
// par les 22 tests Phase 1. Toutes les garanties read-only de l'en-tête de
// ce fichier restent valables pour `orchestrate()` : aucun import Prisma,
// aucun import de `@/lib/prisma`, aucun appel `create`/`update`/`delete`,
// aucun import ni appel de `transitionDossierInTransaction`,
// `assertGuards()` ou `state-machine-engine`, et `stepLydie()` n'est ni
// importée ni appelée nulle part dans ce fichier.
//
// Architecture obtenue (voir le rapport de livraison, section C) :
//
//   message → orchestrate()
//               ├─ observe()          (Phase 1, réutilisée à l'identique — intention)
//               ├─ extractAll()       (extraction.ts — candidats bruts)
//               ├─ mergeWorkingContext() (context.ts — fusion + protection §7)
//               └─ reason()           (reasoning.ts — recommandation déterministe)
//
// Pourquoi `previous` n'est PAS transmis à `observe()` ici : la Phase 1
// fusionne déjà, À SA FAÇON, le contexte précédent dans son propre
// `WorkingLydieContext` (report CONTEXT_DERIVED, contradiction signalée
// mais valeur remplacée sans protection). Cette Phase 2A a une exigence
// supplémentaire et différente (§7 : une donnée USER_CONFIRMED/VALIDATED
// ne doit JAMAIS être silencieusement remplacée), que `context.ts` implémente
// intégralement et indépendamment. Faire fusionner les DEUX logiques à la
// fois (celle, plus simple, de `observe()`, et celle, protectrice, de
// `mergeWorkingContext()`) produirait un résultat ambigu et non spécifié.
// `orchestrate()` n'utilise donc de `observe()` que sa classification
// d'intention pour LE message courant (indépendante de tout historique),
// et laisse `context.ts` seul responsable de la fusion avec l'historique.

export interface OrchestrateInput {
  message: string;
  /** Contexte de travail Phase 2A du tour précédent — jamais le vrai LydieContext. */
  previous?: WorkingContext;
  dossierId?: string | null;
  demandeId?: string | null;
}

export interface OrchestrationResult {
  message: string;
  intent: IntentClassification;
  context: WorkingContext;
  reasoning: Reasoning;
}

/**
 * Point d'entrée Phase 2A. Fonction pure, synchrone, sans effet de bord —
 * mêmes garanties que `observe()` (voir l'en-tête de ce fichier). Ne crée,
 * ne lit ni ne modifie aucun `Dossier`/`Demande`/`Document` réel ; ne
 * déclenche aucune transition J20 ; n'écrit rien de persistant.
 * `dossierId`/`demandeId` restent nullable et ne sont jamais résolus ou
 * devinés ici — transmis tels quels, exactement comme en Phase 1.
 */
export function orchestrate(input: OrchestrateInput): OrchestrationResult {
  const { message, previous, dossierId = null, demandeId = null } = input;
  const base: WorkingContext = previous ?? INITIAL_WORKING_CONTEXT;

  // Classification d'intention pour CE message, réutilisant intégralement
  // la Phase 1 (voir la note d'architecture ci-dessus sur `previous`).
  const observation = observe({ message, dossierId, demandeId });

  const extracted = extractAll(message);
  const mergedFields = mergeWorkingContext(base, extracted, observation.intent.intent);

  const context: WorkingContext = {
    projectType: mergedFields.projectType,
    projectDescription: mergedFields.projectDescription,
    address: mergedFields.address,
    email: mergedFields.email,
    currentIntent: observation.intent.intent,
    // Jamais calculé en exécutant le vrai moteur (voir context.ts) : reporté
    // tel quel depuis le tour précédent.
    currentStep: base.currentStep,
    ambiguities: mergedFields.ambiguities,
    contradictions: mergedFields.contradictions,
    proposals: mergedFields.proposals,
    dossierId,
    demandeId,
  };

  return {
    message,
    intent: observation.intent,
    context,
    reasoning: reason(context),
  };
}
