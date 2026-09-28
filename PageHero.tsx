import { Container } from "@/components/ui/Container";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

/** Bandeau de titre réutilisé en haut de chaque page interne (hors accueil). */
export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <div className="bg-primary text-primary-ink">
      <Container className="py-12 sm:py-16">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base text-primary-ink/80 sm:text-lg">
            {description}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
