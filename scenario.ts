/**
 * Mode Test — protocole officiel de validation du MVP (sprint P3.4bis).
 *
 * Ce module est PUREMENT DE DONNÉES + FONCTIONS PURES (aucun accès réseau,
 * aucune dépendance React/Next.js, aucune écriture Prisma) afin de rester
 * testable réellement dans tous les environnements, y compris ceux où
 * Next.js/React ne peuvent pas être compilés.
 *
 * Il encode le parcours officiel décrit dans l'« ORDRE DE MISSION — P3.4
 * (MODE TEST OFFICIEL) » : un scénario fixe de 6 étapes, avec pour chacune
 * un budget de temps indicatif et une liste de vérifications à cocher par
 * le testeur humain. Le Mode Test ne crée AUCUNE fausse donnée : il ne fait
 * que guider et chronométrer un parcours que le testeur exécute lui-même,
 * exactement comme un vrai client (mêmes écrans, mêmes routes, même moteur
 * Lydie — voir `src/lib/lydie/engine.ts`, non modifié par ce module).
 */

export type TestScenarioStepId =
  | "accueil"
  | "projet"
  | "adresse"
  | "dossier-vivant"
  | "mission-control"
  | "fin";

export interface TestScenarioStep {
  id: TestScenarioStepId;
  title: string;
  /** Budget de temps indicatif pour cette étape, en secondes. */
  budgetSeconds: number;
  /** Message exact à saisir par le testeur, quand le protocole en impose un. */
  testMessage?: string;
  /** Vérifications à cocher une à une par le testeur pour cette étape. */
  checks: string[];
  /** Résultat attendu si toutes les vérifications passent. */
  expectedResult: string;
}

/**
 * Le parcours officiel, dans l'ordre exact du protocole envoyé par Aristote.
 * Somme des budgets : 30 + 120 + 60 + 120 + 120 + 120 = 570 s (~9,5 min,
 * arrondi à « 10 minutes » dans le protocole d'origine).
 */
export const TEST_SCENARIO_STEPS: TestScenarioStep[] = [
  {
    id: "accueil",
    title: "Accueil",
    budgetSeconds: 30,
    checks: [
      "Lydie est visible immédiatement.",
      "Pluri Raccordé® est compris immédiatement.",
      "Le CTA est évident.",
    ],
    expectedResult: "Aucune confusion sur le service.",
  },
  {
    id: "projet",
    title: "Projet",
    budgetSeconds: 120,
    testMessage: "Bonjour, je construis une maison à Bordeaux.",
    checks: [
      "Le projet est détecté.",
      "« Bordeaux » est reconnu comme contexte géographique.",
      "« Bordeaux » n'est jamais enregistré comme adresse valide.",
      "La reformulation de Lydie est naturelle.",
    ],
    expectedResult: "Le projet est confirmé sans que Bordeaux soit traité comme une adresse.",
  },
  {
    id: "adresse",
    title: "Adresse",
    budgetSeconds: 60,
    checks: [
      "Les suggestions BAN s'affichent à la saisie.",
      "Une suggestion peut être sélectionnée.",
      "La validation de l'adresse est inchangée (hasCompleteAddress()).",
    ],
    expectedResult: "L'adresse réelle saisie est acceptée sans modification des règles de validation.",
  },
  {
    id: "dossier-vivant",
    title: "Dossier Vivant",
    budgetSeconds: 120,
    checks: [
      "Après un retour sur le parcours, le projet est retrouvé.",
      "Aucune information déjà donnée n'est redemandée.",
      "La reprise est formulée naturellement (pas de rupture de ton).",
    ],
    expectedResult: "Le testeur retrouve son dossier sans avoir à tout ressaisir.",
  },
  {
    id: "mission-control",
    title: "Mission Control",
    budgetSeconds: 120,
    checks: [
      "Le projet est affiché.",
      "Les documents sont affichés.",
      "La progression est affichée.",
      "L'historique est affiché.",
      "Les réseaux sont affichés (vue dérivée — voir src/lib/j20/reseaux.ts).",
    ],
    expectedResult: "Mission Control présente une vue complète et cohérente du dossier.",
  },
  {
    id: "fin",
    title: "Fin",
    budgetSeconds: 120,
    checks: ["Le testeur termine le parcours complet sans blocage."],
    expectedResult: "Aucun point d'arrêt du début à la fin du parcours.",
  },
];

/** Somme des budgets indicatifs de toutes les étapes, en secondes. */
export const TEST_SCENARIO_TOTAL_BUDGET_SECONDS = TEST_SCENARIO_STEPS.reduce(
  (total, step) => total + step.budgetSeconds,
  0,
);

/**
 * Objectif officiel : de l'ouverture de l'accueil jusqu'à l'affichage de
 * Mission Control, moins de 3 minutes. Si une nouvelle version fait monter
 * ce temps, l'expérience utilisateur s'est dégradée — même si tous les
 * tests techniques restent verts.
 */
export const TARGET_ACCUEIL_TO_MISSION_CONTROL_SECONDS = 3 * 60;

export const MISSION_CONTROL_STEP_ID: TestScenarioStepId = "mission-control";

/** État de validation d'une étape : une case cochée par vérification. */
export type StepChecklistState = boolean[];

export type TestModeChecklistState = Record<TestScenarioStepId, StepChecklistState>;

/** Construit un état initial, toutes les cases décochées. */
export function createInitialChecklist(): TestModeChecklistState {
  const state = {} as TestModeChecklistState;
  for (const step of TEST_SCENARIO_STEPS) {
    state[step.id] = step.checks.map(() => false);
  }
  return state;
}

/** Une étape est validée quand toutes ses vérifications sont cochées. */
export function isStepValidated(state: TestModeChecklistState, stepId: TestScenarioStepId): boolean {
  const checks = state[stepId];
  return checks.length > 0 && checks.every(Boolean);
}

/** Le parcours complet est validé quand toutes les étapes le sont. */
export function isFullJourneyValidated(state: TestModeChecklistState): boolean {
  return TEST_SCENARIO_STEPS.every((step) => isStepValidated(state, step.id));
}

/** Formate un nombre de secondes en `MM:SS`, jamais négatif. */
export function formatElapsed(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * L'objectif des 3 minutes (accueil → Mission Control) est-il tenu ?
 * `elapsedSeconds` est `null` tant que Mission Control n'a pas été atteint.
 */
export function isWithinMissionControlTarget(elapsedSeconds: number | null): boolean | null {
  if (elapsedSeconds === null) return null;
  return elapsedSeconds <= TARGET_ACCUEIL_TO_MISSION_CONTROL_SECONDS;
}

export interface ValidationReportInput {
  /** Date ISO (YYYY-MM-DD) du test, fournie par l'appelant (pas d'horloge ici). */
  date: string;
  checklist: TestModeChecklistState;
  /** Temps total écoulé sur l'ensemble du parcours, en secondes. */
  totalElapsedSeconds: number;
  /** Temps écoulé entre l'accueil et l'affichage de Mission Control, en secondes (ou null si non atteint). */
  timeToMissionControlSeconds: number | null;
  /** Bugs détectés pendant ce test, en langage libre. */
  bugsDetected: string[];
  /** Notes libres additionnelles du testeur. */
  notes?: string;
}

/**
 * Génère le contenu Markdown du rapport `P3.4-MVP-VALIDATION.md` (ou de
 * toute exécution ultérieure du Mode Test) à partir d'une session de test
 * réellement effectuée. Fonction pure : aucune écriture disque ici — c'est
 * à l'appelant (UI ou script) de sauvegarder la chaîne retournée.
 */
export function buildValidationReportMarkdown(input: ValidationReportInput): string {
  const lines: string[] = [];
  lines.push(`# Rapport Mode Test — ${input.date}`);
  lines.push("");
  lines.push(
    "Généré par le Mode Test officiel (`src/lib/testmode/scenario.ts`). Parcours identique à chaque version, exécuté par un testeur humain — ce rapport ne remplace pas les preuves techniques (`tsc`, tests unitaires), il les complète du point de vue de l'expérience réelle.",
  );
  lines.push("");
  lines.push("## Tableau de validation");
  lines.push("");
  lines.push("| Vérification | État |");
  lines.push("|---|---|");
  for (const step of TEST_SCENARIO_STEPS) {
    const ok = isStepValidated(input.checklist, step.id);
    lines.push(`| ${step.title} | ${ok ? "☑" : "☐"} |`);
  }
  const complet = isFullJourneyValidated(input.checklist);
  lines.push(`| Parcours complet | ${complet ? "☑" : "☐"} |`);
  lines.push("");
  lines.push("## Chronométrage");
  lines.push("");
  lines.push(`- Temps total du parcours : **${formatElapsed(input.totalElapsedSeconds)}**`);
  if (input.timeToMissionControlSeconds !== null) {
    const withinTarget = isWithinMissionControlTarget(input.timeToMissionControlSeconds);
    lines.push(
      `- Accueil → Mission Control : **${formatElapsed(input.timeToMissionControlSeconds)}** (objectif : moins de ${formatElapsed(TARGET_ACCUEIL_TO_MISSION_CONTROL_SECONDS)}) — ${withinTarget ? "objectif tenu ✅" : "objectif dépassé ⚠️"}`,
    );
  } else {
    lines.push("- Accueil → Mission Control : non atteint pendant ce test.");
  }
  lines.push("");
  lines.push("## Bugs détectés");
  lines.push("");
  if (input.bugsDetected.length === 0) {
    lines.push("Aucun bug détecté pendant ce test.");
  } else {
    for (const bug of input.bugsDetected) lines.push(`- ${bug}`);
  }
  if (input.notes) {
    lines.push("");
    lines.push("## Notes");
    lines.push("");
    lines.push(input.notes);
  }
  lines.push("");
  lines.push("## Verdict final");
  lines.push("");
  lines.push(
    complet
      ? "**MVP prêt** — toutes les vérifications du parcours officiel sont validées."
      : "**MVP non prêt** — au moins une vérification du parcours officiel n'est pas validée (voir tableau ci-dessus).",
  );
  return lines.join("\n");
}
