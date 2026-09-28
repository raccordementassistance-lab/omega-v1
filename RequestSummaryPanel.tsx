import { FileText, Home, Check, Circle } from "lucide-react";
import { getLydieDisplayProgress } from "./progress";
import { LYDIE_PROJECT_TYPE_LABELS } from "./presets";
import type { LydieContext } from "@/lib/lydie/engine";

interface RequestSummaryPanelProps {
  context: LydieContext;
}

/**
 * Colonne droite de l'écran de conversation (référence : capture 1) :
 * progression des étapes et récapitulatif du projet. N'affiche que des
 * champs réellement présents dans `LydieContext` (project, address, email)
 * — rien n'est inventé ni recalculé côté serveur.
 */
export function RequestSummaryPanel({ context }: RequestSummaryPanelProps) {
  const { steps } = getLydieDisplayProgress(context.step);
  const projectLabel = context.project ? LYDIE_PROJECT_TYPE_LABELS[context.project] : null;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-white">Votre demande</h2>
        </div>
        <p className="mb-4 text-xs text-sky-200/70">Suivez l&apos;avancement de votre dossier</p>

        <ol className="space-y-3.5">
          {steps.map((step, index) => (
            <li key={step.key} className="flex items-start gap-3">
              <span
                className={
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                  (step.status === "done"
                    ? "bg-sky-400 text-[#0b1f3a]"
                    : step.status === "active"
                      ? "bg-sky-500/25 text-sky-200 ring-2 ring-sky-400"
                      : "bg-white/10 text-sky-200/50")
                }
              >
                {step.status === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={
                  "text-sm " + (step.status === "upcoming" ? "text-sky-200/50" : "font-medium text-white")
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {context.project ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Home className="h-4 w-4 text-sky-300" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-white">Récapitulatif de votre projet</h3>
          </div>
          <dl className="space-y-2.5 text-xs">
            <div>
              <dt className="text-sky-200/60">Type de projet</dt>
              <dd className="mt-0.5 font-medium text-white">{projectLabel}</dd>
            </div>
            {context.address ? (
              <div>
                <dt className="text-sky-200/60">Adresse</dt>
                <dd className="mt-0.5 font-medium text-white">{context.address}</dd>
              </div>
            ) : null}
            {context.email ? (
              <div>
                <dt className="text-sky-200/60">E-mail</dt>
                <dd className="mt-0.5 font-medium text-white">{context.email}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-sky-200/60">
          <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Le récapitulatif apparaîtra ici une fois votre type de projet identifié.
        </div>
      )}

      <p className="mt-auto text-xs leading-relaxed text-sky-200/50">
        Raccordement Assistance est un service indépendant d&apos;Enedis. Nous préparons et
        effectuons votre demande de raccordement pour vous.
      </p>
    </div>
  );
}
