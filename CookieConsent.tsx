"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "ra-cookie-consent";

type Consent = "accepted" | "essential-only";

/**
 * Bandeau de gestion des cookies. Fonctionne entièrement côté client via
 * localStorage : aucun appel backend n'existe pour la gestion du
 * consentement à ce stade, donc rien n'est simulé côté serveur.
 * Le site n'utilise actuellement que des cookies/stockage strictement
 * nécessaires ; ce bandeau prépare l'interface pour l'ajout futur de
 * mesures d'audience ou de préférences, sans en activer aujourd'hui.
 */
export function CookieConsent() {
  const [consent, setConsent] = React.useState<Consent | null | undefined>(undefined);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setConsent(stored === "accepted" || stored === "essential-only" ? stored : null);
    } catch {
      setConsent(null);
    }
  }, []);

  const choose = (value: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Le stockage peut être indisponible (navigation privée) : on ne bloque pas l'usage du site.
    }
    setConsent(value);
  };

  if (consent === undefined || consent !== null) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg-raised p-4 shadow-[0_-4px_16px_rgba(11,31,58,0.08)] sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-soft">
          Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du
          site. Aucun cookie de mesure d&apos;audience ou publicitaire n&apos;est déposé
          aujourd&apos;hui.{" "}
          <Link href="/cookies" className="font-medium text-ink underline underline-offset-2">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="ghost" size="md" onClick={() => choose("essential-only")}>
            Continuer sans accepter
          </Button>
          <Button variant="primary" size="md" onClick={() => choose("accepted")}>
            J&apos;ai compris
          </Button>
        </div>
      </div>
    </div>
  );
}
