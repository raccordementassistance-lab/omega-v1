import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Gestion des cookies",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero eyebrow="Vos préférences" title="Gestion des cookies" />

      <Section bare>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose-legal">
            <p>
              Un cookie (ou une technologie de stockage similaire) est un petit fichier déposé
              sur votre appareil lors de votre navigation. Cette page explique quels cookies
              Raccordement Assistance utilise aujourd&apos;hui.
            </p>

            <h2>Cookies strictement nécessaires</h2>
            <p>
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être
              désactivés. Ils permettent notamment :
            </p>
            <ul>
              <li>de maintenir votre session connectée dans votre espace personnel ;</li>
              <li>de mémoriser votre choix concernant ce bandeau de cookies ;</li>
              <li>d&apos;assurer la sécurité du site (protection contre certaines attaques).</li>
            </ul>

            <h2>Cookies de mesure d&apos;audience ou publicitaires</h2>
            <p>
              Raccordement Assistance n&apos;utilise actuellement aucun cookie de mesure
              d&apos;audience ni aucun cookie publicitaire. Si cela évoluait, cette page serait
              mise à jour et votre consentement vous serait demandé avant tout dépôt.
            </p>

            <h2>Comment gérer vos préférences</h2>
            <p>
              Le bandeau affiché lors de votre première visite vous permet d&apos;indiquer votre
              choix. Vous pouvez également configurer votre navigateur pour bloquer ou supprimer
              les cookies à tout moment ; certaines fonctionnalités du site (comme la connexion à
              votre espace) nécessitent toutefois les cookies strictement nécessaires pour
              fonctionner.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
