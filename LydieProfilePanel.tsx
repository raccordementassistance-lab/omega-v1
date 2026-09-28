import { Heart, Clock, Lightbulb } from "lucide-react";
import { getLydieDisplayProgress } from "./progress";
import type { LydieStep } from "@/lib/lydie/engine";

interface LydieProfilePanelProps {
  step: LydieStep;
}

/**
 * Colonne gauche de l'écran de conversation (référence : capture 1) :
 * identité de Lydie, présentation, temps estimé, conseils, progression
 * globale. Purement présentationnel — `step` est le vrai `context.step`,
 * rien n'est recalculé ni décidé ici.
 *
 * Aucune photo de personne réelle n'est disponible dans le projet ; cet
 * avatar est une illustration abstraite plutôt qu'un visage généré, pour ne
 * pas fabriquer une fausse photo de personne.
 */
export function LydieProfilePanel({ step }: LydieProfilePanelProps) {
  const { steps, percent } = getLydieDisplayProgress(step);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-[#0b1f3a] text-xl font-serif italic text-white ring-2 ring-sky-400/40">
          L
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-lg italic text-white">Lydie</span>
            <Heart className="h-4 w-4 fill-sky-400 text-sky-400" aria-hidden="true" />
          </div>
          <p className="text-xs text-sky-200/80">Votre conseillère</p>
          <p className="text-xs text-sky-200/60">Raccordement Assistance</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-sky-100/75">
        Je suis Lydie, votre conseillère Raccordement Assistance. Je vais vous aider à
        comprendre votre projet, répondre à vos questions et préparer votre demande de
        raccordement.
      </p>

      <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-sky-100/80">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        <p>
          La préparation prend environ <strong className="text-white">5 minutes</strong>.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Lightbulb className="h-4 w-4 text-sky-300" aria-hidden="true" />
          Vous pouvez aussi poser vos questions à tout moment.
        </p>
        <p className="text-xs leading-relaxed text-sky-100/70">
          Si vous changez de sujet pendant la conversation, aucun problème : nous
          reprendrons ensuite votre demande là où nous nous sommes arrêtés.
        </p>
      </div>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Votre demande</span>
          <span className="text-sky-300">{step === "DONE" ? "Terminé" : "En cours"}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-sky-200/70">
          {steps.filter((s) => s.status === "done").length} / {steps.length} étapes complétées
        </p>
      </div>
    </div>
  );
}
