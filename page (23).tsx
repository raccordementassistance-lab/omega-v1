import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Steps } from "@/components/landing/Steps";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Découvrez les 5 étapes de votre demande de raccordement électrique avec Raccordement Assistance, de la préparation du dossier au relais pris par Enedis.",
};

export default function ComprendrePage() {
  return (
    <>
      <PageHero
        eyebrow="Le parcours"
        title="Comment ça marche"
        description="Cinq étapes claires, de votre premier échange avec Lydie jusqu'à la prise en charge de votre dossier par Enedis."
      />

      <Section>
        <Steps variant="full" />
      </Section>

      <Section className="bg-bg-raised">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">
            Une question avant de démarrer ?
          </h2>
          <p className="mt-3 text-ink-soft">
            Consultez notre FAQ ou lancez directement l&apos;échange avec Lydie : elle répond à
            vos questions tout en préparant votre dossier.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/chat" size="lg">
              Démarrer avec Lydie
            </Button>
            <Button href="/faq" variant="ghost" size="lg">
              Consulter la FAQ
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
