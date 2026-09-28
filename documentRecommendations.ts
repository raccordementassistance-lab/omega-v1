/**
 * Suggestions documentaires INFORMATIVES, pour anticiper et accélérer le
 * traitement Enedis d'un dossier — jamais des documents obligatoires ni
 * bloquants.
 *
 * Distinction obligatoire (voir state-machine-engine.ts et engine.ts) :
 *
 *   DOCUMENT À ANTICIPER  ≠  DOCUMENT BLOQUANT J20
 *
 * Ce fichier ne fait QUE suggérer ce que Lydie peut proposer de collecter à
 * l'avance, pour un type de projet donné. Il n'a et ne doit jamais avoir
 * aucun effet sur les transitions J20 : la state machine (assertGuards) ne
 * lit plus aucun type de document pour la transition DOSSIER_PRET, quel que
 * soit le contenu de ce fichier — voir state-machine-engine.ts.
 *
 * Important (retour d'audit métier) : le mapping ci-dessous n'établit PAS
 * une règle du type « ce type de projet exige ce document ». Chaque entrée
 * porte explicitement `isBlocking: false` — pas comme une simple note dans
 * un commentaire, mais comme une donnée que le code (et les tests) peuvent
 * vérifier structurellement. Aucune règle métier n'a été validée disant
 * qu'un document est réellement requis pour un type de projet donné ; ce
 * qui suit est une liste de documents qui PEUVENT être utiles selon la
 * situation du client et PEUVENT être demandés par Enedis — jamais une
 * obligation. Le texte que Lydie adresse au client doit rester dans ce
 * registre (voir engine.ts, étape DETAILS : « avez-vous déjà... si non,
 * aucun problème... »), jamais « ce document est requis pour ce type de
 * projet ».
 *
 * Portée volontairement limitée, honnête sur ses limites :
 *
 *  - La seule donnée structurée disponible aujourd'hui pour distinguer une
 *    suggestion documentaire est le type de projet (LydieProjectType côté
 *    Lydie, DemandeType en base — les deux sont alignés 1:1). Il n'existe
 *    encore aucun champ structuré de "caractéristiques" du projet
 *    (puissance souhaitée, etc. restent du texte libre dans
 *    Demande.description, packé par resume.ts) : on ne peut donc pas
 *    aujourd'hui affiner la suggestion en dessous du grain "type de
 *    projet" sans inventer un champ Prisma, ce qui n'est pas demandé ici.
 *  - Chaque document suggéré DOIT correspondre à une valeur réelle de
 *    l'enum Prisma `DocumentType` (voir schema.prisma), pour pouvoir
 *    effectivement être suivi comme une ligne `Document` avec un
 *    `DocumentStatus` réel (DEMANDE / RECU / MANQUANT / A_VERIFIER /
 *    VALIDE / NON_NECESSAIRE — tous déjà présents dans le schéma, aucune
 *    migration nécessaire pour distinguer "à anticiper / disponible /
 *    manquant / à transmettre plus tard").
 *  - Pour tout type de projet, ou toute nuance métier Enedis, qui n'est
 *    pas couvert ci-dessous, le référentiel n'est PAS ÉTABLI dans ce
 *    projet : on ne devine jamais une règle métier non confirmée
 *    (`nonEtabli: true`, liste vide — jamais une supposition présentée
 *    comme une certitude).
 */

import type { DocumentType } from "@prisma/client";
import type { LydieProjectType } from "./engine";

export type RecommendedDocument = {
  type: DocumentType;
  /** Libellé au singulier, utilisable directement dans une phrase suggestive ("un plan de masse"). */
  label: string;
  /**
   * Toujours `false` ici, littéralement : cette entrée est une suggestion
   * informative, jamais un guard J20. `assertGuards()` (state-machine-engine.ts)
   * ne lit d'ailleurs jamais ce module — ce champ n'a donc aucun effet sur
   * les transitions ; il existe pour que ce soit vérifiable structurellement
   * (voir les tests), pas seulement affirmé dans un commentaire.
   */
  isBlocking: false;
};

export type DocumentRecommendation = {
  documents: RecommendedDocument[];
  /**
   * true si le référentiel métier actuel ne permet pas de suggérer un
   * document précis pour ce type de projet — jamais transformé en
   * blocage, seulement en absence de suggestion ciblée de la part de
   * Lydie (elle pose alors la question générique).
   */
  nonEtabli: boolean;
};

/**
 * Suggestions ancrées sur ce que le parcours Lydie proposait déjà avant
 * cette évolution (voir l'ancien texte de l'étape DETAILS dans engine.ts) —
 * pas une nouvelle hypothèse métier, seulement sa mise en commun dans un
 * seul endroit. Aucune de ces entrées ne signifie « obligatoire pour ce
 * type de projet » : c'est une liste de documents qu'il PEUT être utile de
 * demander à l'avance, jamais une règle d'éligibilité ou de complétude.
 *
 * NON ÉTABLI pour MODIFICATION_BRANCHEMENT, DEPLACEMENT_COMPTEUR,
 * RACCORDEMENT_PROVISOIRE, NOUVEAU_RACCORDEMENT : aucune suggestion précise
 * n'a été confirmée par un référentiel métier pour ces types dans ce
 * projet à ce jour.
 *
 * Note sur LOCAL_PROFESSIONNEL : l'ancien texte de Lydie mentionnait aussi
 * un "plan de situation", qui n'a pas de valeur `DocumentType` dédiée dans
 * le schéma actuel. Plutôt que d'inventer une valeur d'enum ou de suggérer
 * un document qu'aucune ligne `Document` ne peut réellement représenter,
 * cette nuance est volontairement NON ÉTABLI et retirée de la suggestion
 * active (seul `PLAN_DE_MASSE`, qui existe réellement dans le schéma, est
 * conservé).
 */
const SUGGESTIONS: Partial<Record<LydieProjectType, RecommendedDocument[]>> = {
  MAISON_NEUVE: [
    { type: "PERMIS_CONSTRUIRE", label: "permis de construire", isBlocking: false },
    { type: "PLAN_DE_MASSE", label: "plan de masse", isBlocking: false },
  ],
  LOCAL_PROFESSIONNEL: [{ type: "PLAN_DE_MASSE", label: "plan de masse du local", isBlocking: false }],
};

export function getRecommendedDocuments(project: LydieProjectType | null): DocumentRecommendation {
  if (!project) return { documents: [], nonEtabli: true };
  const documents = SUGGESTIONS[project];
  if (!documents || documents.length === 0) {
    return { documents: [], nonEtabli: true };
  }
  return { documents, nonEtabli: false };
}
