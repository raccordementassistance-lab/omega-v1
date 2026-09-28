import type { J20State } from "./client";

/**
 * Vue dérivée « Réseaux » de Mission Control — mission P3.2.
 *
 * DÉCISION OFFICIELLE D'ARISTOTE (2026-09-28, voir DECISION-LOG.md) : ce
 * sprint crée UNIQUEMENT une couche d'affichage. Aucune nouvelle table
 * Prisma, aucune migration, aucune modification de la State Machine. Les
 * réseaux affichés sont recalculés à partir de données déjà chargées par
 * l'appelant (état J20 du dossier, présence d'une Demande) — ce fichier ne
 * lit et n'écrit jamais en base lui-même, et n'importe aucun client
 * Prisma : c'est une fonction pure, testable seule, au même titre que
 * `src/lib/lydie/engine.ts`.
 *
 * Aujourd'hui, un Dossier ne peut porter qu'un raccordement électrique :
 * `DemandeType` (Prisma) — MAISON_NEUVE, LOCAL_PROFESSIONNEL,
 * MODIFICATION_BRANCHEMENT, DEPLACEMENT_COMPTEUR, RACCORDEMENT_PROVISOIRE,
 * NOUVEAU_RACCORDEMENT — ne décrit que des variantes du même raccordement
 * Enedis (voir `src/lib/lydie/engine.ts#LydieProjectType`, dont les valeurs
 * correspondent une à une). Eau/Fibre/Gaz ne sont donc JAMAIS identifiés ni
 * explicitement écartés par les données actuelles : ils restent
 * honnêtement « À déterminer » tant qu'aucune conversation ne les couvre
 * réellement. Ce n'est pas un oubli — c'est exactement ce qu'impose la
 * règle « ne jamais inventer une information manquante » ici. Le statut
 * « Non concerné » existe dans le type ci-dessous pour le jour où une vraie
 * source de données pourra le produire (voir la Constitution, §P3.2 :
 * « la persistance des réseaux viendra plus tard dans un sprint dédié si
 * elle devient nécessaire ») — cette fonction ne le produit jamais elle-même
 * aujourd'hui.
 */

export type ReseauKey = "ELECTRICITE" | "EAU" | "FIBRE" | "GAZ";

export type ReseauDisplayStatus =
  | "A_PREPARER"
  | "EN_COURS"
  | "ACTION_REQUISE"
  | "TERMINE"
  | "A_DETERMINER"
  | "NON_CONCERNE";

export type ReseauDisplay = {
  key: ReseauKey;
  icon: string;
  label: string;
  status: ReseauDisplayStatus;
  statusLabel: string;
};

const RESEAU_META: Record<ReseauKey, { icon: string; label: string }> = {
  ELECTRICITE: { icon: "⚡", label: "Électricité" },
  EAU: { icon: "💧", label: "Eau" },
  FIBRE: { icon: "🌐", label: "Fibre" },
  GAZ: { icon: "🔥", label: "Gaz" },
};

const STATUS_LABELS: Record<ReseauDisplayStatus, string> = {
  A_PREPARER: "À préparer",
  EN_COURS: "En cours",
  ACTION_REQUISE: "Action requise",
  TERMINE: "Terminé",
  A_DETERMINER: "À déterminer",
  NON_CONCERNE: "Non concerné",
};

/**
 * États J20 dans lesquels une action du client (ou un blocage) est
 * attendue — reflète `J20_MESSAGES`/`J20_LABELS` (src/lib/j20/client.ts,
 * non modifié), jamais une nouvelle logique de state machine : cette
 * fonction ne fait QUE choisir un libellé plus court pour l'affichage
 * « Réseaux », elle ne décide jamais d'une transition.
 */
const ACTION_REQUISE_STATES: ReadonlySet<J20State> = new Set([
  "ACTION_CLIENT",
  "BLOQUE",
  "INFORMATIONS_MANQUANTES",
  "MANDAT_A_SIGNER",
]);

const A_PREPARER_STATES: ReadonlySet<J20State> = new Set([
  "NOUVEAU",
  "QUALIFICATION",
  "DOSSIER_EN_PREPARATION",
]);

const TERMINE_STATES: ReadonlySet<J20State> = new Set(["TERMINE", "ARCHIVE_INACTIF"]);

function electriciteStatus(state: J20State | null): ReseauDisplayStatus {
  if (!state) return "A_PREPARER";
  if (TERMINE_STATES.has(state)) return "TERMINE";
  if (ACTION_REQUISE_STATES.has(state)) return "ACTION_REQUISE";
  if (A_PREPARER_STATES.has(state)) return "A_PREPARER";
  // DOSSIER_PRET, MANDAT_SIGNE, DEPOT, DEMANDE_TRANSMISE, EN_ATTENTE_ENEDIS,
  // REPRISE_CONSEILLER : le dossier avance, sans action requise ni blocage.
  return "EN_COURS";
}

/**
 * `hasDemande` : au moins une Demande existe déjà sur le dossier (donc un
 * raccordement électrique est réellement identifié — voir le commentaire
 * de tête de fichier). `state` : état J20 du dossier, déjà normalisé par
 * l'appelant (voir `normalizeJ20`, non modifié).
 */
export function deriveReseaux(hasDemande: boolean, state: J20State | null): ReseauDisplay[] {
  const electriciteDisplayStatus: ReseauDisplayStatus = hasDemande ? electriciteStatus(state) : "A_DETERMINER";
  const electricite: ReseauDisplay = {
    key: "ELECTRICITE",
    ...RESEAU_META.ELECTRICITE,
    status: electriciteDisplayStatus,
    statusLabel: STATUS_LABELS[electriciteDisplayStatus],
  };
  const autres: ReseauDisplay[] = (["EAU", "FIBRE", "GAZ"] as const).map((key) => ({
    key,
    ...RESEAU_META[key],
    status: "A_DETERMINER" as const,
    statusLabel: STATUS_LABELS.A_DETERMINER,
  }));
  return [electricite, ...autres];
}
