"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { mainNav, legalNav } from "@/lib/content/nav";

/**
 * Masqué sur /chat (mise à jour du 27/09/2026), pour la même raison que
 * Header.tsx : cette route a son propre bandeau et sa propre ambiance
 * visuelle sombre (voir src/components/lydie/), fidèle aux deux maquettes
 * de référence. Passage en composant client uniquement pour lire le
 * chemin courant (`usePathname`) — aucun autre changement de comportement.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/chat") return null;

  return (
    <footer className="border-t border-line bg-primary text-primary-ink">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-serif text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink">
                <Zap className="h-4 w-4" aria-hidden="true" />
              </span>
              Raccordement Assistance
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-ink/75">
              Service indépendant d&apos;accompagnement aux demandes de raccordement
              électrique. Raccordement Assistance n&apos;est ni Enedis, ni un de ses
              représentants officiels.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-ink/60">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2">
              {mainNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-ink/85 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-ink/60">
              Informations légales
            </h2>
            <ul className="mt-4 space-y-2">
              {legalNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-ink/85 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-primary-ink/15 pt-6 text-xs text-primary-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Raccordement Assistance. Tous droits réservés.</p>
          <p>Service indépendant — non affilié à Enedis.</p>
        </div>
      </Container>
    </footer>
  );
}
