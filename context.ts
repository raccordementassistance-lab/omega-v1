/**
 * Working Context — Lydie V2, Phase 2A.
 *
 * Rôle unique de ce fichier : fusionner une extraction brute (extraction.ts)
 * dans le contexte de travail du tour précédent, en appliquant la règle de
 * protection des données confirmées (cahier des charges Phase 2A, §7) :
 *
 *   Une valeur déjà USER_CONFIRMED ou VALIDATED n'est JAMAIS écrasée
 *   silencieusement par une observation contradictoire ultérieure. Toute
 *   contradiction produit une Proposal (nécessitant une confirmation
 *   explicite de l'utilisateur) et un flag de contradiction ; la valeur
 *   confirmée reste inchangée jusqu'à cette confirmation.
 *
 * Ce fichier ne classe aucune intention (orchestrator.ts / observe()), ne
 * repère aucun candidat dans le texte brut (extraction.ts), et ne calcule
 * aucune recommandation (reasoning.ts) : il ne fait QUE fusionner.
 *
 * Mêmes garanties que extraction.ts et orchestrator.ts : aucun import
 * Prisma, `@/lib/prisma` ou `state-machine-engine`, aucun appel
 * `create`/`update`/`delete`/`updateMany`/`upsert`, aucune écriture, aucun
 * effet de bord. `mergeWorkingContext()` est une fonction pure.
 *
 * Décision métier EXTENSION (verrouillée) appliquée ici explicitement :
 *   « extension » (information descriptive, jamais un LydieProjectType) ne
 *   remplace ni ne devient JAMAIS automatiquement une catégorie
 *   `LydieProjectType` existante (ex. MODIFICATION_BRANCHEMENT). Ce fichier
 *   se contente de la conserver comme `projectDescription`, de signaler la
 *   remise en cause du `projectType` courant, et de produire une
 *   proposition de clarification — jamais un mapping automatique. Et
 *   surtout : ce module ne mélange jamais une extension de BÂTIMENT avec
 *   une extension du RÉSEAU Enedis — il n'observe que le mot, sans jamais
 *   supposer lequel des deux sens est visé.
 */

import type { LydieProjectType } from "./engine";
import type { EpistemicStatus, LydieIntent } from "./orchestrator";
import type { ExtractionResult, ObservedValue } from "./extraction";
import { unknownValue } from "./extraction";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────

export type AmbiguityCode =
  | "PROJECT_TYPE_UNRESOLVED"
  | "PROJECT_TYPE_CONTRADICTION"
  | "ELLIPTICAL_MESSAGE"
  | "POSSIBLE_INSTRUCTION_OVERRIDE_ATTEMPT"
  | "MULTIPLE_INTENTS_POSSIBLE"
  | "DESCRIPTIVE_PROJECT_INFO_AWAITING_CLARIFICATION";

export interface Ambiguity {
  code: AmbiguityCode;
  message: string;
}

export type ContradictionCode =
  | "PROJECT_TYPE_CONTRADICTION"
  | "CONFIRMED_VALUE_CONTRADICTED";

export type WorkingContextFieldName = "projectType" | "projectDescription" | "address" | "email";

export interface Contradiction {
  code: ContradictionCode;
  field: WorkingContextFieldName;
  message: string;
}

/**
 * Une Proposal ne modifie JAMAIS le contexte par elle-même : elle décrit un
 * changement candidat qui attend une confirmation explicite de
 * l'utilisateur avant de pouvoir remplacer une valeur déjà confirmée, ou
 * avant qu'une information descriptive (ex. « extension ») puisse être
 * utilisée par le contexte métier/backend.
 *
 *  - VALUE_CHANGE       : une nouvelle valeur concrète et reconnue est
 *                         candidate pour remplacer la valeur confirmée
 *                         actuelle du champ.
 *  - CLARIFICATION_NEEDED : aucune valeur concrète ne peut être proposée
 *                         automatiquement (ex. « extension ») ; Lydie doit
 *                         demander une précision et, éventuellement,
 *                         proposer une catégorie existante — jamais en
 *                         déduire une seule.
 */
export interface Proposal {
  field: WorkingContextFieldName;
  kind: "VALUE_CHANGE" | "CLARIFICATION_NEEDED";
  proposedValue: string | null;
  reason: string;
  requiresConfirmation: true;
}

export interface WorkingContext {
  projectType: ObservedValue<LydieProjectType>;
  projectDescription: ObservedValue<string>;
  address: ObservedValue<string>;
  email: ObservedValue<string>;
  currentIntent: LydieIntent;
  /**
   * Représentable, mais JAMAIS calculé en appelant `stepLydie()` (moteur
   * réel, protégé, non modifié ni exécuté par cette Phase 2A) : reporté tel
   * quel depuis le tour précédent, comme `dossierId`/`demandeId`. Reste
   * `null` par défaut. Le calculer réellement supposerait d'exécuter le
   * vrai moteur métier, hors périmètre de cette phase (observation
   * uniquement, aucune écriture, aucun pilotage du parcours réel).
   */
  currentStep: string | null;
  ambiguities: Ambiguity[];
  contradictions: Contradiction[];
  proposals: Proposal[];
  /** Nullable par construction — jamais résolu, deviné ou créé ici. */
  dossierId: string | null;
  demandeId: string | null;
}

export const INITIAL_WORKING_CONTEXT: WorkingContext = {
  projectType: unknownValue(),
  projectDescription: unknownValue(),
  address: unknownValue(),
  email: unknownValue(),
  currentIntent: "INCONNU",
  currentStep: null,
  ambiguities: [],
  contradictions: [],
  proposals: [],
  dossierId: null,
  demandeId: null,
};

// ──────────────────────────────────────────────────────────────────────
// Statuts « confirmés » — jamais écrasés silencieusement (§7)
// ──────────────────────────────────────────────────────────────────────

const CONFIRMED_STATUSES: ReadonlySet<EpistemicStatus> = new Set(["USER_CONFIRMED", "VALIDATED"]);

function isConfirmed(status: EpistemicStatus): boolean {
  return CONFIRMED_STATUSES.has(status);
}

// ──────────────────────────────────────────────────────────────────────
// Fusion d'un champ "simple" (address, email) : mêmes règles pour les deux.
// ──────────────────────────────────────────────────────────────────────

function mergeSimpleField(
  field: "address" | "email",
  previous: ObservedValue<string>,
  extracted: ObservedValue<string>,
  contradictions: Contradiction[],
  proposals: Proposal[]
): ObservedValue<string> {
  if (!extracted.value) {
    // Rien de nouveau ce tour-ci : on reporte la valeur précédente,
    // requalifiée CONTEXT_DERIVED (jamais promue toute seule).
    if (previous.value) return { ...previous, status: "CONTEXT_DERIVED" as EpistemicStatus };
    return extracted;
  }
  if (!previous.value) return extracted;
  if (previous.value === extracted.value) return previous;

  // Valeurs différentes : la valeur confirmée n'est jamais silencieusement
  // remplacée (§7) — on la conserve et on transforme le conflit en Proposal.
  if (isConfirmed(previous.status)) {
    contradictions.push({
      code: "CONFIRMED_VALUE_CONTRADICTED",
      field,
      message: `La valeur déjà confirmée pour « ${field} » (${previous.value}) est contredite par une nouvelle information (${extracted.value}). Valeur confirmée conservée ; confirmation explicite requise pour la remplacer.`,
    });
    proposals.push({
      field,
      kind: "VALUE_CHANGE",
      proposedValue: extracted.value,
      reason: `Nouvelle valeur détectée pour « ${field} » (${extracted.value}), en contradiction avec la valeur déjà confirmée (${previous.value}).`,
      requiresConfirmation: true,
    });
    return previous;
  }

  // Précédente non confirmée : simple mise à jour (aucune donnée métier
  // validée n'est en jeu), la nouvelle observation devient la valeur
  // courante.
  return extracted;
}

// ──────────────────────────────────────────────────────────────────────
// Fusion du type de projet — inclut la règle définitive EXTENSION
// ──────────────────────────────────────────────────────────────────────

function mergeProjectType(
  previous: ObservedValue<LydieProjectType>,
  extracted: ObservedValue<LydieProjectType>,
  descriptiveExtracted: ObservedValue<string>,
  contradictions: Contradiction[],
  proposals: Proposal[],
  ambiguities: Ambiguity[]
): ObservedValue<LydieProjectType> {
  // Cas EXTENSION (et tout autre terme descriptif non mappable) : ce
  // message décrit le projet sans correspondre à une catégorie
  // `LydieProjectType` reconnue. Ne JAMAIS deviner une correspondance —
  // seulement remettre en cause le type courant et demander clarification.
  if (descriptiveExtracted.value && !extracted.value) {
    ambiguities.push({
      code: "DESCRIPTIVE_PROJECT_INFO_AWAITING_CLARIFICATION",
      message: `Information descriptive « ${descriptiveExtracted.value} » reçue : ne correspond à aucune catégorie LydieProjectType existante. Une clarification et, éventuellement, une proposition d'une catégorie existante sont nécessaires — jamais une correspondance automatique (ex. « extension » → MODIFICATION_BRANCHEMENT est explicitement interdit).`,
    });

    if (!previous.value) {
      // Rien à contredire : simplement en attente de clarification.
      return unknownValue();
    }

    if (isConfirmed(previous.status)) {
      // §7 : la valeur confirmée reste intacte, seule une Proposal de
      // clarification est produite.
      contradictions.push({
        code: "CONFIRMED_VALUE_CONTRADICTED",
        field: "projectType",
        message: `Le type de projet déjà confirmé (${previous.value}) est remis en cause par une information descriptive (« ${descriptiveExtracted.value} ») qui ne correspond à aucune catégorie reconnue. Valeur confirmée conservée en l'état.`,
      });
      proposals.push({
        field: "projectType",
        kind: "CLARIFICATION_NEEDED",
        proposedValue: null,
        reason: `« ${descriptiveExtracted.value} » ne correspond à aucune catégorie existante ; une clarification est nécessaire avant toute remise en cause du type déjà confirmé (${previous.value}).`,
        requiresConfirmation: true,
      });
      return previous;
    }

    // Précédente non confirmée (simple MODEL_INFERENCE/CONTEXT_DERIVED) :
    // le type devient non résolu — jamais deviné, jamais conservé tel quel
    // par défaut (cas de test obligatoire : Maison neuve → extension).
    contradictions.push({
      code: "PROJECT_TYPE_CONTRADICTION",
      field: "projectType",
      message: `Le type de projet précédemment observé (${previous.value}) est remis en cause par une information descriptive (« ${descriptiveExtracted.value} ») non reconnue. Non résolu automatiquement.`,
    });
    proposals.push({
      field: "projectType",
      kind: "CLARIFICATION_NEEDED",
      proposedValue: null,
      reason: `« ${descriptiveExtracted.value} » ne correspond à aucune catégorie existante ; une clarification est nécessaire (proposition d'une catégorie existante possible, jamais automatique).`,
      requiresConfirmation: true,
    });
    return unknownValue();
  }

  // Pas de nouveau type observé, pas de terme descriptif non plus : report
  // du précédent, requalifié CONTEXT_DERIVED.
  if (!extracted.value) {
    if (previous.value) return { ...previous, status: "CONTEXT_DERIVED" as EpistemicStatus };
    return extracted;
  }

  if (!previous.value) return extracted;
  if (previous.value === extracted.value) return previous;

  // Deux catégories reconnues mais différentes.
  if (isConfirmed(previous.status)) {
    contradictions.push({
      code: "CONFIRMED_VALUE_CONTRADICTED",
      field: "projectType",
      message: `Le type de projet déjà confirmé (${previous.value}) est contredit par une nouvelle information (${extracted.value}). Valeur confirmée conservée ; confirmation explicite requise pour la remplacer.`,
    });
    proposals.push({
      field: "projectType",
      kind: "VALUE_CHANGE",
      proposedValue: extracted.value,
      reason: `Nouvelle catégorie détectée (${extracted.value}), en contradiction avec la valeur déjà confirmée (${previous.value}).`,
      requiresConfirmation: true,
    });
    return previous;
  }

  contradictions.push({
    code: "PROJECT_TYPE_CONTRADICTION",
    field: "projectType",
    message: `Le type de projet précédemment observé (${previous.value}) contredit le nouveau type détecté (${extracted.value}). Non résolu automatiquement.`,
  });
  return extracted;
}

// ──────────────────────────────────────────────────────────────────────
// Promotion MODEL_INFERENCE → USER_CONFIRMED (réplique alignée de la même
// règle déjà établie en Phase 1 dans orchestrator.ts#observe — jamais
// l'inverse, jamais fabriquée sans intention CONFIRMATION explicite).
// ──────────────────────────────────────────────────────────────────────

/**
 * La promotion se décide sur le statut de la valeur AVANT la fusion de ce
 * tour (`previous`), jamais sur le résultat déjà fusionné : un message de
 * confirmation isolé (« oui », « j'accepte ») n'apporte lui-même aucune
 * nouvelle extraction, donc `merged` aurait déjà requalifié la valeur en
 * CONTEXT_DERIVED avant que cette fonction ne s'exécute — ce qui masquerait
 * à tort la condition `MODEL_INFERENCE` attendue ici. On regarde donc
 * `previous`, et on ne retombe sur `merged` que si aucune promotion ne
 * s'applique.
 */
function promoteIfConfirmation<T>(merged: ObservedValue<T>, previous: ObservedValue<T>, intent: LydieIntent): ObservedValue<T> {
  if (intent === "CONFIRMATION" && previous.status === "MODEL_INFERENCE" && previous.value !== null) {
    return { value: previous.value, status: "USER_CONFIRMED", evidence: previous.evidence };
  }
  return merged;
}

/**
 * Si l'utilisateur confirme (« oui », « j'accepte », ...) alors qu'une
 * unique Proposal de type VALUE_CHANGE était en attente, celle-ci est
 * adoptée : la nouvelle valeur devient USER_CONFIRMED et la Proposal est
 * consommée. Une CLARIFICATION_NEEDED (ex. cas EXTENSION) n'est JAMAIS
 * résolue par une simple confirmation isolée : il n'existe encore aucune
 * valeur concrete à confirmer (une clarification réelle, nommant une
 * catégorie, est nécessaire — voir cas de test « correction de contexte »).
 * Choix explicite documenté ici plutôt que laissé implicite : s'il existe
 * plusieurs Proposals en attente à la fois, aucune n'est résolue
 * automatiquement (ambiguïté réelle, non tranchée silencieusement).
 */
function applyPendingProposalOnConfirmation(
  fields: Pick<WorkingContext, "projectType" | "address" | "email">,
  pendingProposals: Proposal[],
  intent: LydieIntent
): { fields: Pick<WorkingContext, "projectType" | "address" | "email">; remainingProposals: Proposal[] } {
  if (intent !== "CONFIRMATION" || pendingProposals.length !== 1) {
    return { fields, remainingProposals: pendingProposals };
  }
  const [only] = pendingProposals;
  if (only.kind !== "VALUE_CHANGE" || only.proposedValue === null) {
    return { fields, remainingProposals: pendingProposals };
  }
  if (only.field === "projectDescription") {
    return { fields, remainingProposals: pendingProposals };
  }
  const updated = { ...fields } as Record<string, ObservedValue<unknown>>;
  const current = updated[only.field];
  updated[only.field] = { value: only.proposedValue, status: "USER_CONFIRMED", evidence: current?.evidence ?? null };
  return {
    fields: updated as unknown as Pick<WorkingContext, "projectType" | "address" | "email">,
    remainingProposals: [],
  };
}

// ──────────────────────────────────────────────────────────────────────
// Point d'entrée
// ──────────────────────────────────────────────────────────────────────

/**
 * Fusionne une extraction brute dans le contexte de travail précédent.
 * Fonction pure : aucun effet de bord, aucune lecture/écriture externe.
 * `intent` provient de la classification déjà réalisée par `observe()`
 * (Phase 1, réutilisée telle quelle par orchestrator.ts#orchestrate).
 */
export function mergeWorkingContext(
  previous: WorkingContext,
  extracted: ExtractionResult,
  intent: LydieIntent
): Pick<WorkingContext, "projectType" | "projectDescription" | "address" | "email" | "ambiguities" | "contradictions" | "proposals"> {
  const ambiguities: Ambiguity[] = [];
  const contradictions: Contradiction[] = [];
  const proposals: Proposal[] = [];

  let projectType = mergeProjectType(previous.projectType, extracted.projectType, extracted.projectDescription, contradictions, proposals, ambiguities);
  let address = mergeSimpleField("address", previous.address, extracted.address, contradictions, proposals);
  let email = mergeSimpleField("email", previous.email, extracted.email, contradictions, proposals);

  // L'information descriptive elle-même est conservée dès qu'elle apparaît
  // (jamais perdue), et reportée sinon — jamais "confirmée" toute seule :
  // seule une vraie catégorie LydieProjectType peut être USER_CONFIRMED ici.
  const projectDescription = extracted.projectDescription.value
    ? extracted.projectDescription
    : previous.projectDescription.value
      ? { ...previous.projectDescription, status: "CONTEXT_DERIVED" as EpistemicStatus }
      : extracted.projectDescription;

  projectType = promoteIfConfirmation(projectType, previous.projectType, intent);
  address = promoteIfConfirmation(address, previous.address, intent);
  email = promoteIfConfirmation(email, previous.email, intent);

  const applied = applyPendingProposalOnConfirmation(
    { projectType, address, email },
    previous.proposals,
    intent
  );

  return {
    projectType: applied.fields.projectType,
    projectDescription,
    address: applied.fields.address,
    email: applied.fields.email,
    ambiguities,
    contradictions,
    proposals: [...applied.remainingProposals, ...proposals],
  };
}
