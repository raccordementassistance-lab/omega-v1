import Link from "next/link";
import { Zap, HelpCircle, User } from "lucide-react";

/**
 * Bandeau supérieur commun à l'écran d'entrée et à l'écran de conversation
 * Lydie (référence : les deux maquettes partagent le même en-tête
 * "Raccordement Assistance"). Remplace localement le Header clair global,
 * masqué sur cette route (voir Header.tsx) pour respecter l'ambiance sombre
 * des deux références sans changer le thème des autres pages du site.
 * Les liens utilisés (/espace-client, /faq) sont des routes réelles
 * existantes — aucune nouvelle page n'est créée.
 */
export function LydieTopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#050b1a]/95 px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
          <Zap className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>Raccordement Assistance</span>
      </Link>
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <Link
          href="/espace-client"
          className="hidden items-center gap-1.5 rounded-m px-3 py-2 text-sky-100/80 hover:text-white sm:flex"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Mon espace
        </Link>
        <Link
          href="/faq"
          className="flex items-center gap-1.5 rounded-m border border-white/15 px-3 py-2 text-sky-100/80 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
        </Link>
      </div>
    </header>
  );
}
