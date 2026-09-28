"use client";

import { Home, Wrench, Zap, Cable, MessageCircleQuestion, Clock, ChevronRight } from "lucide-react";
import { LYDIE_PROJECT_CARDS, LYDIE_DONT_KNOW_MESSAGE, type LydieProjectCard } from "./presets";
import { LYDIE_DISPLAY_STEPS } from "./progress";
import { LydieTopBar } from "./LydieTopBar";

const CARD_ICONS: Record<LydieProjectCard["id"], typeof Home> = {
  MAISON_NEUVE: Home,
  RACCORDEMENT_PROVISOIRE: Cable,
  BORNE_RECHARGE: Zap,
  MODIFICATION_OU_DEPLACEMENT: Wrench,
};

interface EntryScreenProps {
  onSend: (message: string) => void;
  sending: boolean;
}

/**
 * Écran d'entrée / orientation du parcours Lydie (référence : capture 2).
 *
 * Purement front-end : chaque carte se contente d'appeler `onSend()` avec
 * une phrase en langage naturel, exactement comme si le client l'avait
 * tapée — c'est le moteur réel (`/api/lydie` → engine.ts, non modifiés) qui
 * interprète le texte, comme pour n'importe quel message. Aucune donnée
 * n'est créée ni transmise ici : cet écran ne fait qu'envoyer le tout
 * premier message de la conversation.
 */
export function EntryScreen({ onSend, sending }: EntryScreenProps) {
  return (
    <div className="min-h-screen bg-[#03060f]">
      <LydieTopBar />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-14 lg:py-16">
      <div className="flex-1">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-300">
          Service indépendant — non affilié à Enedis
        </p>

        <div className="mb-2 flex items-center gap-2 text-sky-200">
          <span className="font-serif text-lg italic">Lydie</span>
          <span className="text-sky-400">♥</span>
          <span className="text-xs text-sky-300/80">Votre conseillère Raccordement Assistance</span>
        </div>

        <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
          Votre demande de raccordement électrique,{" "}
          <span className="text-sky-300">simplement.</span>
        </h1>

        <p className="mt-4 flex items-center gap-2 text-sm text-sky-100/80">
          <Clock className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          La préparation de votre demande prend environ <strong className="text-white">5 minutes</strong>.
        </p>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-sky-100/70 sm:text-base">
          Je suis Lydie, votre conseillère Raccordement Assistance. Je vais vous aider à
          comprendre votre projet, répondre à vos questions et préparer votre demande de
          raccordement.
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sky-100/70 sm:text-base">
          Vous pouvez me poser vos questions librement. Si vous changez de sujet pendant la
          conversation, aucun problème : nous reprendrons ensuite votre demande là où nous
          nous sommes arrêtés.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="mb-3 text-sm font-semibold text-white">Que souhaitez-vous faire ?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {LYDIE_PROJECT_CARDS.map((card) => {
              const Icon = CARD_ICONS[card.id];
              return (
                <button
                  key={card.id}
                  type="button"
                  disabled={sending}
                  onClick={() => onSend(card.message)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1f3a]/60 px-4 py-3.5 text-left text-sm font-medium text-white transition hover:border-sky-400/60 hover:bg-[#0b1f3a] disabled:opacity-50"
                >
                  <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
                  {card.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={() => onSend(LYDIE_DONT_KNOW_MESSAGE)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
          >
            <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />
            Je ne sais pas — Expliquez-moi mon projet
          </button>
        </div>
      </div>

      <aside className="w-full max-w-sm shrink-0 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:self-start">
        <h2 className="text-sm font-semibold text-white">Le parcours, étape par étape</h2>
        <ol className="mt-4 space-y-4">
          {LYDIE_DISPLAY_STEPS.map((step, index) => (
            <li key={step.key} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{step.label}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-sky-100/60">
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden="true" />
          Raccordement Assistance est un service indépendant d&apos;Enedis. Nous préparons et
          effectuons votre demande pour vous.
        </p>
      </aside>
      </div>
    </div>
  );
}
