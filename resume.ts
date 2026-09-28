import type { LydieContext, LydieProjectType } from "./engine";
import { INITIAL_LYDIE_CONTEXT } from "./engine";

/**
 * Le modèle Demande n'a pas de colonne dédiée pour les documents mentionnés
 * par le client (seul `description` existe). On combine donc détails et
 * documents dans ce même champ, avec un séparateur stable, pour pouvoir les
 * re-séparer plus tard sans perdre d'information à la reprise.
 *
 * Limite assumée : si un conseiller réécrit `description` à la main sans
 * respecter ce format, la reprise retombera simplement sur "détails = tout
 * le texte, documents = rien" (dégradation silencieuse, jamais une erreur).
 */
const DOCUMENTS_MARKER = "\n---documents---\n";

export function buildDemandeDescription(details: string | null, documents: string | null): string | undefined {
  const cleanDetails = details?.trim() ?? "";
  const cleanDocuments = documents?.trim() ?? "";
  if (!cleanDetails && !cleanDocuments) return undefined;
  return `${cleanDetails}${DOCUMENTS_MARKER}${cleanDocuments}`;
}

export function splitDemandeDescription(description: string | null | undefined): {
  details: string | null;
  documents: string | null;
} {
  if (!description) return { details: null, documents: null };
  const idx = description.indexOf(DOCUMENTS_MARKER);
  if (idx === -1) return { details: description, documents: null };
  const details = description.slice(0, idx);
  const documents = description.slice(idx + DOCUMENTS_MARKER.length);
  return { details: details.length ? details : null, documents: documents.length ? documents : null };
}

export type DossierDemandeForResume = {
  type: string;
  description: string | null;
  email: string | null;
  mandatRepresentation: boolean;
  mandatTransmission: boolean;
  mandatConfirmation: boolean;
  adresse: { numero: string | null; rue: string; codePostal: string; ville: string } | null;
} | null | undefined;

/**
 * Reconstruit un contexte Lydie exploitable à partir de ce qui est
 * réellement en base pour un dossier — utilisé quand le client revient sans
 * contexte local (autre appareil, cache vidé, ou widget de la page dossier
 * qui n'a jamais porté de contexte côté client).
 *
 * Ne rejoue PAS l'historique des messages : s'appuie uniquement sur la
 * Demande/Adresse, qui sont la donnée structurée fiable. Si aucune Demande
 * n'existe encore pour ce dossier (créé autrement que via Lydie, ex. bouton
 * "+ Nouveau dossier"), on reprend proprement à l'étape PROJECT plutôt que
 * de tout redemander depuis MODE.
 */
/**
 * Données du document qui MATÉRIALISE les 3 consentements du mandat déjà
 * enregistrés sur une Demande — jamais un document que le client doit
 * fournir. Fonction pure et testable seule : `finalizeLydieQualification()`
 * (src/app/api/lydie/route.ts) se limite à créer ce document (via
 * `tx.document.create`) quand cette fonction ne renvoie pas `null`, dans la
 * même transaction que la Demande, ce qui lui donne la même idempotence
 * (au plus une fois par confirmation réelle, voir la garantie sur `won`
 * dans route.ts — aucune contrainte Prisma supplémentaire nécessaire).
 *
 * Renvoie `null` si les 3 conditions ne sont pas toutes vraies : c'est une
 * vérification défensive, redondante avec la revalidation déjà faite avant
 * d'appeler `finalizeLydieQualification()`, mais qui garde cette fonction
 * correcte même appelée isolément.
 */
export function buildMandatDocumentData(params: {
  dossierId: string;
  demandeId: string;
  mandatRepresentation: boolean;
  mandatTransmission: boolean;
  mandatConfirmation: boolean;
}): {
  dossierId: string;
  demandeId: string;
  type: "MANDAT_SIGNE";
  status: "VALIDE";
  name: string;
  comment: string;
  receivedAt: Date;
} | null {
  if (!params.mandatRepresentation || !params.mandatTransmission || !params.mandatConfirmation) {
    return null;
  }
  return {
    dossierId: params.dossierId,
    demandeId: params.demandeId,
    type: "MANDAT_SIGNE",
    status: "VALIDE",
    name: "Mandat (représentation, transmission, confirmation) — généré automatiquement",
    comment:
      "Document généré automatiquement lors de la finalisation Lydie : matérialise les 3 consentements du mandat déjà enregistrés sur la Demande. Aucun fichier n'est fourni par le client.",
    receivedAt: new Date(),
  };
}

export function deriveLydieContextFromDossier(dossierId: string, demande: DossierDemandeForResume): LydieContext {
  if (!demande) {
    return { ...INITIAL_LYDIE_CONTEXT, step: "PROJECT", mode: "TEXT", dossierId };
  }

  const { details, documents } = splitDemandeDescription(demande.description);
  const address = demande.adresse
    ? [demande.adresse.numero, demande.adresse.rue].filter(Boolean).join(" ") +
      `, ${demande.adresse.codePostal} ${demande.adresse.ville}`.trim()
    : null;

  return {
    step: "DONE",
    mode: "TEXT",
    project: demande.type as LydieProjectType,
    address,
    // Un dossier repris depuis la base n'a jamais de fragment d'adresse en
    // attente (cette notion n'existe que côté conversation en cours) :
    // toujours null ici, jamais reconstruit.
    addressDraft: null,
    details,
    documents,
    email: demande.email,
    mandatRepresentation: demande.mandatRepresentation,
    mandatTransmission: demande.mandatTransmission,
    mandatConfirmation: demande.mandatConfirmation,
    confirmed: true,
    dossierId,
    // Sans effet ici : readyToFinalize ne peut plus redevenir vrai une fois
    // à l'étape DONE, donc aucune nouvelle confirmation ne sera tentée pour
    // ce dossier via ce contexte reconstruit.
    confirmationKey: null,
  };
}
