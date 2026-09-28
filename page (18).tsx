import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Steps } from "@/components/landing/Steps";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck, FileText, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Accueil",
};

const trustPoints = [
  {
    icon: MessageCircle,
    title: "Un accompagnement humain, guidé par Lydie",
    text: "Lydie vous pose les bonnes questions et prépare votre dossier avec vous, sans jargon technique.",
  },
  {
    icon: FileText,
    title: "Un dossier clair, à votre rythme",
    text: "Vous transmettez vos documents quand vous êtes prêt, et vous suivez l'avancement à tout moment.",
  },
  {
    icon: ShieldCheck,
    title: "Vous gardez le contrôle",
    text: "Rien n'est déposé auprès d'Enedis sans que vous ayez vérifié et autorisé l'envoi de votre dossier.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section>
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Comment ça marche
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
            Cinq étapes, du premier échange au relais pris par Enedis
          </h2>
        </div>
        <Steps variant="compact" />
        <div className="mt-8">
          <Link
            href="/comprendre"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent"
          >
            Voir le détail de chaque étape
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      <Section className="bg-bg-raised">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Pourquoi Raccordement Assistance
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
            Un accompagnement pensé pour vous simplifier la démarche
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-m border border-line bg-bg p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start justify-between gap-6 rounded-m bg-primary p-8 text-primary-ink sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">Prêt à démarrer votre dossier ?</h2>
            <p className="mt-2 max-w-md text-primary-ink/80">
              Lydie vous guide en quelques minutes. Accompagnement actuellement gratuit.
            </p>
          </div>
          <Button href="/chat" size="lg" className="shrink-0">
            Démarrer avec Lydie
          </Button>
        </div>
      </Section>
    </>
  );
}
