export const J20_STATES = [
  "NOUVEAU","QUALIFICATION","INFORMATIONS_MANQUANTES","DOSSIER_EN_PREPARATION","DOSSIER_PRET",
  "MANDAT_A_SIGNER","MANDAT_SIGNE","DEPOT","DEMANDE_TRANSMISE","EN_ATTENTE_ENEDIS","ACTION_CLIENT",
  "BLOQUE","REPRISE_CONSEILLER","TERMINE","ARCHIVE_INACTIF",
] as const;

export type J20State = (typeof J20_STATES)[number];

export const J20_LABELS: Record<J20State,string> = {
  NOUVEAU:"Nouveau", QUALIFICATION:"Qualification", INFORMATIONS_MANQUANTES:"Informations manquantes",
  DOSSIER_EN_PREPARATION:"Dossier en préparation", DOSSIER_PRET:"Dossier prêt", MANDAT_A_SIGNER:"Mandat à signer",
  MANDAT_SIGNE:"Mandat signé", DEPOT:"Dépôt", DEMANDE_TRANSMISE:"Demande transmise", EN_ATTENTE_ENEDIS:"En attente Enedis",
  ACTION_CLIENT:"Action requise", BLOQUE:"Dossier bloqué", REPRISE_CONSEILLER:"Reprise conseiller", TERMINE:"Terminé", ARCHIVE_INACTIF:"Archivé",
};

export const J20_MESSAGES: Record<J20State,string> = {
  NOUVEAU:"Votre demande a bien été reçue. Nous allons démarrer sa qualification.",
  QUALIFICATION:"Nous vérifions les informations nécessaires à votre projet.",
  INFORMATIONS_MANQUANTES:"Une ou plusieurs informations sont nécessaires pour poursuivre votre dossier.",
  DOSSIER_EN_PREPARATION:"Votre dossier est en cours de préparation.",
  DOSSIER_PRET:"Votre dossier est prêt pour la suite du parcours.",
  MANDAT_A_SIGNER:"Une signature est attendue pour poursuivre le traitement.",
  MANDAT_SIGNE:"Le mandat signé a été pris en compte.",
  DEPOT:"Votre dossier est en cours de dépôt.",
  DEMANDE_TRANSMISE:"Votre demande a été transmise à Enedis.",
  EN_ATTENTE_ENEDIS:"Nous suivons maintenant le traitement de votre demande par Enedis.",
  ACTION_CLIENT:"Une action de votre part est nécessaire pour poursuivre.",
  BLOQUE:"Le dossier est momentanément bloqué. Un traitement est nécessaire avant de poursuivre.",
  REPRISE_CONSEILLER:"Un conseiller reprend votre dossier pour poursuivre le traitement.",
  TERMINE:"Votre dossier est terminé.",
  ARCHIVE_INACTIF:"Ce dossier est archivé et n'est plus actif.",
};

export function normalizeJ20(value: string | null | undefined): J20State | null {
  if (!value) return null;
  const key = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ -]/g, "_").toUpperCase();
  return (J20_STATES as readonly string[]).includes(key) ? key as J20State : null;
}

export function progressForJ20(state: J20State): number {
  const values: Record<J20State,number> = {
    NOUVEAU:5, QUALIFICATION:12, INFORMATIONS_MANQUANTES:20, DOSSIER_EN_PREPARATION:30, DOSSIER_PRET:42,
    MANDAT_A_SIGNER:50, MANDAT_SIGNE:58, DEPOT:65, DEMANDE_TRANSMISE:72, EN_ATTENTE_ENEDIS:82,
    ACTION_CLIENT:76, BLOQUE:55, REPRISE_CONSEILLER:62, TERMINE:100, ARCHIVE_INACTIF:100,
  };
  return values[state];
}
