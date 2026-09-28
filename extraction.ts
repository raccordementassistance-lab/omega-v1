/**
 * Extraction structurée — Lydie V2, Phase 2A.
 *
 * Isolé de `orchestrator.ts` pour séparer clairement les responsabilités
 * (demandé explicitement pour cette phase) : ce fichier ne fait QUE
 * repérer des candidats dans un message brut. Il ne classe pas
 * d'intention, ne fusionne rien avec un contexte précédent, ne décide
 * jamais d'une contradiction — ça, c'est `context.ts`.
 *
 * Mêmes garanties read-only que `orchestrator.ts` (voir son en-tête) :
 * aucun import Prisma, aucune écriture, fonctions pures.
 *
 * RÉUTILISATION vs DUPLICATION — inchangé depuis la Phase 1 :
 *   - `isSkip`, `isNegative`, `isValidEmail` (engine.ts) et
 *     `parseAddressStrict` (parseAddress.ts) sont réutilisées TELLES
 *     QUELLES, jamais réimplémentées.
 *   - La détection de type de projet par mots-clés et la recherche
 *     d'adresse en sous-chaîne restent des heuristiques PROPRES à cet
 *     observateur (`detectProject()` n'est pas exportée par engine.ts, et
 *     cette phase interdit explicitement de modifier engine.ts) — voir le
 *     commentaire détaillé déjà présent en Phase 1, repris ici à
 *     l'identique.
 */

import { isValidEmail, type LydieProjectType } from "./engine";
import { parseAddressStrict } from "./parseAddress";
// Import de TYPE uniquement : effacé à la compilation, donc aucune
// dépendance d'exécution réelle vers orchestrator.ts (qui, lui, importera
// des fonctions de ce fichier pour construire orchestrate() — voir Phase
// 2A). Un import de type n'introduit jamais de cycle au sens runtime.
import type { EpistemicStatus } from "./orchestrator";

export interface ObservedValue<T> {
  value: T | null;
  status: EpistemicStatus;
  evidence: string | null;
}

export function unknownValue<T>(): ObservedValue<T> {
  return { value: null, status: "UNKNOWN", evidence: null };
}

// Même correctif, pour la même raison, qu'engine.ts#normalize.
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
// Type de projet — catégories réelles de LydieProjectType uniquement
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
 * Heuristique d'observation, jamais une décision métier : retourne
 * toujours MODEL_INFERENCE, jamais DETERMINISTIC_RULE. Seule
 * `detectProject()` du moteur réel a autorité pour faire progresser une
 * vraie conversation.
 */
export function inferProjectTypeHeuristic(message: string): ObservedValue<LydieProjectType> {
  for (const { type, words } of PROJECT_KEYWORDS) {
    const hit = containsAny(message, words);
    if (hit) return { value: type, status: "MODEL_INFERENCE", evidence: hit };
  }
  return unknownValue();
}

// ──────────────────────────────────────────────────────────────────────
// Information descriptive de projet — décision métier EXTENSION verrouillée
// ──────────────────────────────────────────────────────────────────────

/**
 * Termes décrivant un projet SANS jamais être mappés vers une catégorie
 * `LydieProjectType` existante ni vers une nouvelle valeur d'enum — ceci
 * applique exactement la décision métier verrouillée pour « extension » :
 *
 *   « extension »
 *      → information descriptive (jamais un LydieProjectType)
 *      → conservée comme telle dans le contexte de travail
 *      → à clarifier par Lydie / proposer une catégorie existante
 *      → confirmation explicite de l'utilisateur avant tout usage métier
 *
 * Seul « extension » est couvert ici, parce que c'est la seule décision
 * effectivement verrouillée à ce jour. Ajouter d'autres termes de ce type
 * (« agrandissement », « rénovation », etc.) est une décision métier
 * distincte, non prise dans cette phase — ne pas généraliser silencieusement.
 *
 * IMPORTANT : « extension » désigne ici une extension de BÂTIMENT, jamais
 * une extension du RÉSEAU Enedis — cette fonction ne mélange jamais les
 * deux notions (voir la règle définitive verrouillée : EXTENSION bâtiment
 * ≠ EXTENSION réseau Enedis). Elle ne fait qu'observer le mot dans le
 * message ; elle ne suppose jamais lequel des deux sens est visé.
 */
const DESCRIPTIVE_PROJECT_TERMS: string[] = ["extension"];

export function extractDescriptiveProjectInfo(message: string): ObservedValue<string> {
  const hit = containsAny(message, DESCRIPTIVE_PROJECT_TERMS);
  if (hit) return { value: hit, status: "MODEL_INFERENCE", evidence: hit };
  return unknownValue();
}

// ──────────────────────────────────────────────────────────────────────
// Adresse — candidat en sous-chaîne, RE-VALIDÉ par la vraie fonction du
// moteur (parseAddressStrict, non modifiée, non dupliquée pour la
// validation elle-même — voir garanties en tête de fichier)
// ──────────────────────────────────────────────────────────────────────

// Version NON ANCRÉE du même schéma structurel que ADDRESS_PATTERN
// (engine.ts / parseAddress.ts, non modifiés). Sert uniquement à repérer
// un candidat n'importe où dans un texte plus long ; le verdict final
// n'appartient jamais à ce motif.
const ADDRESS_SUBSTRING_PATTERN =
  /\d+\s*(?:bis|ter)?\s+[^\d,]+?\s*(?:,\s*[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*?\s+\d{5}|,?\s*\d{5}\s+[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*)/i;

export function extractAddressCandidate(message: string): ObservedValue<string> {
  // 1) Le message ENTIER est peut-être déjà une adresse complète (cas de
  //    l'étape ADDRESS du moteur réel) : délégation directe.
  if (parseAddressStrict(message) !== null) {
    const cleaned = message.trim().replace(/\s+/g, " ");
    return { value: cleaned, status: "DETERMINISTIC_RULE", evidence: cleaned };
  }
  // 2) Sinon, un FRAGMENT du message contient peut-être une adresse
  //    complète (message composite : projet + adresse + email, etc.).
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
// E-mail — délégation directe à isValidEmail() du moteur réel
// ──────────────────────────────────────────────────────────────────────

// Le dernier segment (TLD) est restreint aux lettres (\b en fin) : sans
// cette restriction, un message composite se terminant par un point de
// ponctuation ("... mon email est test@example.com.") faisait entrer ce
// point final dans la capture (confirmé par exécution réelle — voir
// rapport de livraison). isValidEmail() (moteur réel, non modifié) reste
// le seul juge final de validité ; ce motif ne fait que délimiter le
// candidat à lui soumettre.
const EMAIL_SEARCH_PATTERN = /[^\s@]+@[^\s@]+\.[A-Za-z]{2,}\b/;

export function extractEmailCandidate(message: string): ObservedValue<string> {
  const match = message.match(EMAIL_SEARCH_PATTERN);
  if (match && isValidEmail(match[0])) {
    return { value: match[0], status: "DETERMINISTIC_RULE", evidence: match[0] };
  }
  return unknownValue();
}

/** Résultat groupé d'une passe d'extraction — un message peut produire les 4 à la fois (cas composite). */
export interface ExtractionResult {
  projectType: ObservedValue<LydieProjectType>;
  projectDescription: ObservedValue<string>;
  address: ObservedValue<string>;
  email: ObservedValue<string>;
}

/**
 * Exécute toutes les extractions sur le MÊME message, indépendamment les
 * unes des autres — c'est ce qui garantit qu'un message composite (« Je
 * construis une maison neuve au 42 rue Voltaire, 59300 Onnaing, mon email
 * est test@example.com ») ne perd aucune information : chaque extracteur
 * scanne le texte intégral, aucun ne s'arrête au premier trouvé.
 */
export function extractAll(message: string): ExtractionResult {
  return {
    projectType: inferProjectTypeHeuristic(message),
    projectDescription: extractDescriptiveProjectInfo(message),
    address: extractAddressCandidate(message),
    email: extractEmailCandidate(message),
  };
}
