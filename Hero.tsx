import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-primary text-primary-ink">
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-ink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
            Service indépendant — non affilié à Enedis
          </p>
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Votre demande de raccordement électrique, simplement.
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-ink/80 sm:text-lg">
            Préparez votre dossier en quelques minutes avec Lydie.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/chat" size="lg">
              Être accompagné par Lydie IA
            </Button>
            <Button href="/contact" variant="ghost" size="lg" className="border-primary-ink/25 text-primary-ink hover:bg-primary-ink/10">
              Remplir directement le formulaire
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/comprendre" variant="secondary" size="md" className="bg-primary-ink/10 text-primary-ink hover:bg-primary-ink/20">
              Voir le parcours
            </Button>
            <Button href="/faq" variant="ghost" size="md" className="border-primary-ink/25 text-primary-ink hover:bg-primary-ink/10">
              FAQ
            </Button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-primary-ink/70">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            Accompagnement actuellement gratuit.
          </p>
        </div>

        <div className="rounded-m border border-primary-ink/15 bg-primary-ink/5 p-6 sm:p-8">
          <h2 className="font-serif text-lg text-primary-ink">Ce que fait Raccordement Assistance</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-ink/80">
            <li>
              Nous vous aidons à préparer un dossier de raccordement complet, sans jargon
              technique.
            </li>
            <li>
              Nous transmettons votre demande à Enedis avec votre autorisation, une fois votre
              dossier prêt.
            </li>
            <li>
              Enedis reste seul décisionnaire sur la faisabilité, les délais et les tarifs de
              votre raccordement.
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}
