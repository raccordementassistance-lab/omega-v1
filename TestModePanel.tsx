"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronRight, ChevronLeft, Download, CheckCircle2 } from "lucide-react";
import {
  TEST_SCENARIO_STEPS,
  MISSION_CONTROL_STEP_ID,
  TARGET_ACCUEIL_TO_MISSION_CONTROL_SECONDS,
  createInitialChecklist,
  isStepValidated,
  isFullJourneyValidated,
  formatElapsed,
  isWithinMissionControlTarget,
  buildValidationReportMarkdown,
  type TestModeChecklistState,
} from "@/lib/testmode/scenario";

interface TestModePanelProps {
  onClose: () => void;
}

/**
 * Panneau du Mode Test officiel.
 *
 * Ce composant ne crée AUCUNE fausse donnée et n'appelle AUCUNE route de
 * l'application : il se contente de guider un testeur humain à travers le
 * parcours officiel (`src/lib/testmode/scenario.ts`), de chronométrer, et de
 * générer un rapport Markdown téléchargeable. Le testeur exécute lui-même
 * chaque étape dans l'application réelle (chat Lydie, page dossier, etc.) ;
 * ce panneau reste une fenêtre flottante par-dessus, jamais un remplacement
 * du parcours réel.
 *
 * Aucune dépendance Prisma, aucune State Machine : État purement local
 * (React state), perdu à la fermeture — c'est voulu, chaque session de test
 * repart de zéro comme un vrai client.
 */
export function TestModePanel({ onClose }: TestModePanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [checklist, setChecklist] = useState<TestModeChecklistState>(() => createInitialChecklist());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [missionControlElapsedSeconds, setMissionControlElapsedSeconds] = useState<number | null>(null);
  const [bugsText, setBugsText] = useState("");
  const [notes, setNotes] = useState("");
  const [finished, setFinished] = useState(false);

  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const step = TEST_SCENARIO_STEPS[stepIndex];
  const isLastStep = stepIndex === TEST_SCENARIO_STEPS.length - 1;
  const withinTarget = isWithinMissionControlTarget(missionControlElapsedSeconds);

  function toggleCheck(checkIndex: number) {
    setChecklist((prev) => {
      const next = { ...prev, [step.id]: prev[step.id].slice() };
      next[step.id][checkIndex] = !next[step.id][checkIndex];
      return next;
    });
  }

  function goNext() {
    // Dès qu'on quitte l'accueil pour la première fois vers Mission Control,
    // on capture le chrono « accueil → Mission Control » (objectif : 3 min).
    if (
      TEST_SCENARIO_STEPS[stepIndex + 1]?.id === MISSION_CONTROL_STEP_ID &&
      missionControlElapsedSeconds === null
    ) {
      setMissionControlElapsedSeconds(elapsedSeconds);
    }
    if (isLastStep) {
      setFinished(true);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, TEST_SCENARIO_STEPS.length - 1));
  }

  function goPrevious() {
    setFinished(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const bugsDetected = useMemo(
    () =>
      bugsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [bugsText],
  );

  function downloadReport() {
    const today = new Date().toISOString().slice(0, 10);
    const markdown = buildValidationReportMarkdown({
      date: today,
      checklist,
      totalElapsedSeconds: elapsedSeconds,
      timeToMissionControlSeconds: missionControlElapsedSeconds,
      bugsDetected,
      notes: notes.trim() || undefined,
    });
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `P3.4-MVP-VALIDATION-${today}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-end bg-black/40 p-4 sm:items-center sm:justify-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Mode Test</p>
            <p className="text-sm text-sky-100/70">Parcours officiel de validation du MVP</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-sm text-sky-200" aria-live="polite">
              {formatElapsed(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le Mode Test"
              className="rounded-full p-1.5 text-sky-200/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!finished ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-xs text-sky-200/60">
                Étape {stepIndex + 1} / {TEST_SCENARIO_STEPS.length}
              </div>
              <h2 className="font-serif text-xl text-white">{step.title}</h2>
              {step.testMessage ? (
                <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-sky-100/80">
                  Message de test à saisir : « {step.testMessage} »
                </p>
              ) : null}
              <ul className="mt-4 space-y-2">
                {step.checks.map((check, i) => (
                  <li key={check}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm text-sky-100/90">
                      <input
                        type="checkbox"
                        checked={checklist[step.id][i]}
                        onChange={() => toggleCheck(i)}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5"
                      />
                      <span>{check}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs italic text-sky-200/50">Résultat attendu : {step.expectedResult}</p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-xl text-white">Tableau de validation</h2>
              <table className="mt-4 w-full text-sm text-sky-100/90">
                <tbody>
                  {TEST_SCENARIO_STEPS.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="py-1.5">{s.title}</td>
                      <td className="py-1.5 text-right">
                        {isStepValidated(checklist, s.id) ? (
                          <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                        ) : (
                          "☐"
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-2 font-semibold text-white">Parcours complet</td>
                    <td className="pt-2 text-right font-semibold text-white">
                      {isFullJourneyValidated(checklist) ? "☑" : "☐"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-sky-100/80">
                Accueil → Mission Control :{" "}
                <span className="font-mono">
                  {missionControlElapsedSeconds !== null ? formatElapsed(missionControlElapsedSeconds) : "—"}
                </span>{" "}
                (objectif : moins de {formatElapsed(TARGET_ACCUEIL_TO_MISSION_CONTROL_SECONDS)})
                {withinTarget !== null ? (withinTarget ? " — objectif tenu ✅" : " — objectif dépassé ⚠️") : ""}
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-sky-300">
                Bugs détectés (un par ligne)
              </label>
              <textarea
                value={bugsText}
                onChange={(e) => setBugsText(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white"
                placeholder="Aucun si tout est passé."
              />

              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-sky-300">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white"
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={goPrevious}
            disabled={stepIndex === 0 && !finished}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-sky-200/70 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          {!finished ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
            >
              {isLastStep ? "Terminer" : "Suivant"} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              <Download className="h-4 w-4" /> Télécharger le rapport (.md)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
