import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Erreur 404</p>
      <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Page introuvable</h1>
      <p className="mt-4 max-w-md text-ink-soft">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" size="lg">
          Retour à l&apos;accueil
        </Button>
        <Button href="/contact" variant="ghost" size="lg">
          Nous contacter
        </Button>
      </div>
      <p className="mt-6 text-xs text-ink-soft">
        <Link href="/faq" className="underline underline-offset-2">
          Consulter la FAQ
        </Link>
      </p>
    </Container>
  );
}
