"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { TestModePanel } from "./TestModePanel";

/**
 * Bouton discret « Mode Test », monté une seule fois dans le layout racine
 * (`src/app/layout.tsx`) pour être disponible sur tout le site, sans jamais
 * interférer avec le parcours réel : il n'ouvre qu'une fenêtre flottante
 * (`TestModePanel`), n'appelle aucune route, ne modifie aucune donnée.
 *
 * Volontairement discret (petit, faible opacité au repos) : ce n'est pas un
 * CTA client, c'est un outil interne pour Aristote/l'équipe.
 */
export function TestModeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le Mode Test"
        title="Mode Test — parcours officiel de validation du MVP"
        className="fixed bottom-4 right-4 z-[998] flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0a0f1e]/70 px-3 py-2 text-xs text-sky-200/50 opacity-40 shadow-lg backdrop-blur transition hover:opacity-100 hover:text-sky-200"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Mode Test</span>
      </button>
      {open ? <TestModePanel onClose={() => setOpen(false)} /> : null}
    </>
  );
}
