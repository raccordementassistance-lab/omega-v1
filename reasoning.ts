/**
 * Raisonnement déterministe — Lydie V2, Phase 2A.
 *
 * Dernière couche de la chaîne : ne fait QUE lire le `WorkingContext` déjà
 * fusionné (context.ts) pour produire une recommandation lisible. Ne
 * modifie jamais le contexte, ne classe aucune intention, ne fusionne
 * rien : purement déterministe, aucun effet de bord.
 *
 * Règles absolues rappelées par le cahier des charges Phase 2A (§10, §11) :
 *   - ne doit jamais inventer de nouvelle règle J20 ;
 *   - une précision manquante reste « il manque une précision », jamais
 *     transformée en « J20 BLOCKED » (ce concept n'existe nulle part dans
 *     ce fichier) ;
 *   - un document recommandé (via `getRecommendedDocuments`, réutilisé tel
 *     quel, jamais réimplémenté) reste une suggestion informative — jamais
 *     déduit comme un guard J20 (DOCUMENT À ANTICIPER ≠ DOCUMENT BLOQUANT
 *     J20, voir documentRecommendations.ts, non modifié).
 */

import { getRecommendedDocuments } from "./documentRecommendations";
import type { Ambiguity, Contradiction, Proposal, WorkingContext } from "./context";

export interface Reasoning {
  missingFields: Array<"projectType" | "address" | "email">;
  ambiguities: Ambiguity[];
  contradictions: Contradiction[];
  proposals: Proposal[];
  /**
   * Suggestion informative uniquement (voir documentRecommendations.ts) —
   * jamais un guard, jamais bloquant, jamais lu par assertGuards().
   */
  recommendedDocumentLabels: string[];
  recommendedNextQuestion: string | null;
}

function firstPendingProposalQuestion(proposal: Proposal): string {
  if (proposal.kind === "CLARIFICATION_NEEDED") {
    return `Pouvez-vous préciser votre projet concernant « ${proposal.field} » ? L'information fournie ne correspond à aucune catégorie existante ; je peux vous proposer une catégorie proche si vous le souhaitez, mais j'ai besoin de votre confirmation avant de l'utiliser.`;
  }
  return `Vous aviez déjà confirmé une valeur pour « ${proposal.field} » ; une nouvelle information (${proposal.proposedValue ?? "non précisée"}) semble la contredire. Confirmez-vous ce changement ?`;
}

/**
 * Raisonnement déterministe : n'exécute aucune règle J20, ne lit ni
 * n'écrit aucun état métier réel. Se contente d'observer le
 * `WorkingContext` déjà construit et de décrire ce qu'il constate.
 */
export function reason(context: WorkingContext): Reasoning {
  const missingFields: Reasoning["missingFields"] = [];
  if (!context.projectType.value) missingFields.push("projectType");
  if (!context.address.value) missingFields.push("address");
  if (!context.email.value) missingFields.push("email");

  const recommendation = getRecommendedDocuments(context.projectType.value);
  const recommendedDocumentLabels = recommendation.nonEtabli ? [] : recommendation.documents.map((d) => d.label);

  // Priorité déterministe et volontairement simple : une Proposal en
  // attente prime toujours (une donnée confirmée est en jeu, ou une
  // information descriptive attend une clarification) ; sinon, la première
  // information manquante, dans l'ordre projectType → address → email ;
  // sinon, aucune question à poser (le raisonnement ne conclut jamais à un
  // blocage : l'absence de question n'est PAS un « J20 BLOCKED »).
  let recommendedNextQuestion: string | null = null;
  if (context.proposals.length > 0) {
    recommendedNextQuestion = firstPendingProposalQuestion(context.proposals[0]);
  } else if (missingFields.includes("projectType")) {
    recommendedNextQuestion = "Quel est votre projet ? (maison neuve, local professionnel, modification de branchement, déplacement de compteur, raccordement provisoire, ou nouveau raccordement)";
  } else if (missingFields.includes("address")) {
    recommendedNextQuestion = "Quelle est l'adresse exacte du projet ? Numéro, rue, code postal et ville.";
  } else if (missingFields.includes("email")) {
    recommendedNextQuestion = "Quelle est votre adresse e-mail de contact ?";
  } else if (recommendedDocumentLabels.length > 0) {
    // Suggestion informative uniquement — jamais une condition bloquante.
    recommendedNextQuestion = `Avez-vous déjà un ${recommendedDocumentLabels.join(" ou un ")} sous la main ? Si non, aucun problème, nous pouvons continuer.`;
  }

  return {
    missingFields,
    ambiguities: context.ambiguities,
    contradictions: context.contradictions,
    proposals: context.proposals,
    recommendedDocumentLabels,
    recommendedNextQuestion,
  };
}
