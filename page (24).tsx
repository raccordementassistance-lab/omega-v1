import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/landing/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Raccordement Assistance pour toute question sur votre dossier.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Une question ? Écrivez-nous"
        description="Notre équipe vous répond dans les meilleurs délais. Pour un suivi de dossier, préférez l'échange avec Lydie qui a accès au contexte de votre demande."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-m border border-line bg-bg-raised p-5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">Par e-mail</p>
                <a
                  href="mailto:contact@raccordement-assistance.fr"
                  className="text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
                >
                  contact@raccordement-assistance.fr
                </a>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Raccordement Assistance est un service indépendant. Pour toute question relative à
              une intervention technique, à un branchement en cours ou à une coupure, contactez
              directement Enedis via ses propres canaux officiels.
            </p>
          </div>

          <div className="rounded-m border border-line bg-bg-raised p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
