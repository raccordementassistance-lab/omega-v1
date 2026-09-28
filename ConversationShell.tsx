"use client";

import * as React from "react";
import { Trash2, X, PanelLeft, PanelRight } from "lucide-react";
import type { LydieContext } from "@/lib/lydie/engine";
import { LydieProfilePanel } from "./LydieProfilePanel";
import { RequestSummaryPanel } from "./RequestSummaryPanel";
import { LydieTopBar } from "./LydieTopBar";

interface ConversationShellProps {
  context: LydieContext;
  onClearConversation: () => void;
  children: React.ReactNode;
}

/**
 * Coquille visuelle de l'écran de conversation (référence : capture 1) :
 * layout desktop 3 colonnes (Lydie / discussion / votre demande), et
 * repli mobile en tiroirs (section 7 de la demande). Le contenu réel de la
 * conversation (messages, réponses rapides, saisie) reste entièrement porté
 * par le composant appelant via `children` — cette coquille ne touche à
 * aucune logique de conversation, seulement à la présentation.
 *
 * Le bandeau supérieur du site (Header global, thème clair) est masqué sur
 * cette route (voir Header.tsx / Footer.tsx) au profit d'un bandeau sombre
 * local qui reprend l'identité "Raccordement Assistance" — pour respecter
 * la fidélité visuelle demandée sans changer le thème des autres pages.
 */
export function ConversationShell({ context, onClearConversation, children }: ConversationShellProps) {
  const [mobilePanel, setMobilePanel] = React.useState<"none" | "lydie" | "demande">("none");

  return (
    <div className="flex min-h-screen flex-col bg-[#03060f]">
      <LydieTopBar />

      {/* Barre d'onglets mobile pour accéder aux deux panneaux repliés (section 7) */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#050b1a] px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel("lydie")}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-sky-100/80"
        >
          <PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Lydie
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("demande")}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-sky-100/80"
        >
          <PanelRight className="h-3.5 w-3.5" aria-hidden="true" />
          Votre demande
        </button>
        <button
          type="button"
          onClick={onClearConversation}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-sky-100/60 hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Effacer
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 lg:gap-4 lg:p-4">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] lg:block">
          <LydieProfilePanel step={context.step} />
        </aside>

        <section className="flex min-h-0 flex-1 flex-col border-x border-white/10 bg-[#050b1a] lg:rounded-2xl lg:border">
          <div className="hidden shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5 lg:flex">
            <div>
              <p className="text-sm font-semibold text-white">Discussion avec Lydie</p>
              <p className="flex items-center gap-1.5 text-xs text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                En ligne
              </p>
            </div>
            <button
              type="button"
              onClick={onClearConversation}
              className="flex items-center gap-1.5 rounded-m border border-white/15 px-3 py-1.5 text-xs font-medium text-sky-100/70 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Tout effacer
            </button>
          </div>
          {children}
        </section>

        <aside className="hidden w-80 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] lg:block">
          <RequestSummaryPanel context={context} />
        </aside>
      </div>

      {mobilePanel !== "none" ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/60" onClick={() => setMobilePanel("none")} />
          <div className="h-full w-[85%] max-w-sm overflow-y-auto bg-[#050b1a] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                {mobilePanel === "lydie" ? "Votre conseillère" : "Votre demande"}
              </p>
              <button type="button" onClick={() => setMobilePanel("none")} aria-label="Fermer" className="text-sky-100/70">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {mobilePanel === "lydie" ? (
              <LydieProfilePanel step={context.step} />
            ) : (
              <RequestSummaryPanel context={context} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
