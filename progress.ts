import type { LydieStep } from "@/lib/lydie/engine";

/**
 * Regroupement PUREMENT PRÉSENTATIEL des 9 étapes réelles du moteur Lydie
 * (MODE, PROJECT, ADDRESS, DETAILS, DOCUMENTS, EMAIL, SUMMARY, MANDAT, DONE —
 * voir src/lib/lydie/engine.ts, non modifié) en 6 repères visuels, pour
 * l'affichage "Le parcours, étape par étape" des deux maquettes de
 * référence. Ceci n'introduit aucun nouvel état ni aucune règle métier :
 * `context.step` (la seule source de vérité) est simplement projeté sur ces
 * 6 libellés d'affichage.
 */
export interface LydieDisplayStep {
  key: string;
  label: string;
}

export const LYDIE_DISPLAY_STEPS: LydieDisplayStep[] = [
  { key: "projet", label: "Votre projet" },
  { key: "adresse", label: "Adresse du projet" },
  { key: "details", label: "Détails & documents" },
  { key: "email", label: "Vos coordonnées" },
  { key: "recapitulatif", label: "Récapitulatif" },
  { key: "mandat", label: "Mandat & transmission" },
];

const STEP_TO_DISPLAY_INDEX: Record<LydieStep, number> = {
  MODE: 0,
  PROJECT: 0,
  ADDRESS: 1,
  DETAILS: 2,
  DOCUMENTS: 2,
  EMAIL: 3,
  SUMMARY: 4,
  MANDAT: 5,
  DONE: 5,
};

export type LydieDisplayStepStatus = "done" | "active" | "upcoming";

/**
 * Retourne, pour chaque repère d'affichage, son statut par rapport à
 * `currentStep` (le vrai `context.step`), ainsi qu'un pourcentage global
 * pour une éventuelle barre de progression. `currentStep === "DONE"` marque
 * tous les repères comme terminés.
 */
export function getLydieDisplayProgress(currentStep: LydieStep): {
  steps: Array<LydieDisplayStep & { status: LydieDisplayStepStatus }>;
  percent: number;
} {
  const currentIndex = STEP_TO_DISPLAY_INDEX[currentStep];
  const isDone = currentStep === "DONE";

  const steps = LYDIE_DISPLAY_STEPS.map((step, index) => {
    let status: LydieDisplayStepStatus = "upcoming";
    if (isDone || index < currentIndex) status = "done";
    else if (index === currentIndex) status = "active";
    return { ...step, status };
  });

  const completed = steps.filter((s) => s.status === "done").length;
  const percent = isDone ? 100 : Math.round(((completed + 0.5) / LYDIE_DISPLAY_STEPS.length) * 100);

  return { steps, percent: Math.min(100, percent) };
}
