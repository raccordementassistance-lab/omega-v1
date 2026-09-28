"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/content/nav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Header global : logo, navigation desktop, CTA "Démarrer avec Lydie",
 * et menu mobile en plein écran. Composant client car il gère l'ouverture
 * du menu mobile (useState) et ferme automatiquement au changement de route.
 *
 * Masqué sur /chat (mise à jour du 27/09/2026) : cette route porte
 * désormais son propre bandeau sombre (voir src/components/lydie/LydieTopBar.tsx),
 * fidèle aux deux maquettes de référence de l'écran Lydie — pour ne pas
 * superposer deux en-têtes ni changer le thème clair du reste du site.
 * Décision purement présentationnelle, aucune route n'est supprimée.
 */
export function Header() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll du body quand le menu plein écran est ouvert.
  React.useEffect(() => {
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [open]);

  // Doit rester APRÈS tous les hooks ci-dessus (règle des hooks React : un
  // retour anticipé avant un hook le rendrait conditionnel).
  if (pathname === "/chat") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-lg font-semibold text-ink sm:text-xl"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-ink">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          Raccordement Assistance
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                pathname === link.href && "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/chat" size="md">
            Démarrer avec Lydie
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-m text-ink lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </Container>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-bg px-4 pb-10 pt-6 sm:top-20 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-m px-4 py-3 text-base font-medium text-ink-soft hover:bg-primary-soft hover:text-ink",
                  pathname === link.href && "bg-primary-soft text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6">
            <Button href="/chat" size="lg" className="w-full">
              Démarrer avec Lydie
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
