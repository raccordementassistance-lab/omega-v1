import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AccordionItem } from "@/components/ui/Accordion";
import { faqCategories } from "@/lib/content/faq";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Toutes les réponses sur le raccordement électrique, le rôle de Raccordement Assistance et d'Enedis, les documents, délais, prix, suivi et la confidentialité.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Questions fréquentes"
        title="FAQ"
        description="Les réponses aux questions les plus courantes sur votre demande de raccordement électrique."
      />

      <Section>
        <div className="space-y-12">
          {faqCategories.map((category) => (
            <div key={category.id} id={category.id}>
              <h2 className="mb-4 font-serif text-xl text-ink sm:text-2xl">{category.title}</h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <AccordionItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-m border border-line bg-bg-raised p-8 text-center">
          <h2 className="font-serif text-xl text-ink sm:text-2xl">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="mt-2 text-ink-soft">
            Contactez-nous ou démarrez directement l&apos;échange avec Lydie.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/chat" size="lg">
              Démarrer avec Lydie
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Nous contacter
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
