import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Mentions légales",
};

/**
 * Les valeurs entre crochets [ ] sont des emplacements à compléter avec les
 * informations légales réelles de la société avant mise en production.
 * Aucune information n'a été inventée.
 */
export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero eyebrow="Informations légales" title="Mentions légales" />

      <Section bare>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose-legal">
            <h2>Éditeur du site</h2>
            <p>
              Le site Raccordement Assistance est édité par [Raison sociale à compléter],
              [forme juridique à compléter] au capital de [montant à compléter], immatriculée au
              Registre du Commerce et des Sociétés de [ville à compléter] sous le numéro
              [SIREN/SIRET à compléter].
            </p>
            <p>
              Siège social : [adresse complète à compléter]
              <br />
              Numéro de TVA intracommunautaire : [numéro à compléter]
              <br />
              Directeur de la publication : [nom à compléter]
              <br />
              Contact : [adresse e-mail de contact à compléter]
            </p>

            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par [nom de l&apos;hébergeur à compléter], [adresse de
              l&apos;hébergeur à compléter].
            </p>

            <h2>Indépendance vis-à-vis d&apos;Enedis</h2>
            <p>
              Raccordement Assistance est un service indépendant d&apos;accompagnement aux
              démarches de raccordement électrique. Raccordement Assistance n&apos;est ni Enedis,
              ni une filiale, ni un représentant officiel d&apos;Enedis. Enedis est le
              gestionnaire du réseau public de distribution d&apos;électricité, seul compétent
              pour instruire, programmer et réaliser les raccordements.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, graphismes, logos,
              icônes) est la propriété de [Raison sociale à compléter], sauf mention contraire,
              et est protégé par les dispositions du Code de la propriété intellectuelle.
            </p>

            <h2>Responsabilité</h2>
            <p>
              Raccordement Assistance s&apos;efforce de fournir des informations aussi précises
              que possible. Les délais, tarifs et décisions relatifs au raccordement lui-même
              relèvent exclusivement d&apos;Enedis et sont communiqués officiellement par
              Enedis, non par Raccordement Assistance.
            </p>

            <h2>Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français.</p>

            <h2>Contact</h2>
            <p>
              Pour toute question relative à ces mentions légales, vous pouvez nous contacter
              via notre <Link href="/contact">page de contact</Link>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
