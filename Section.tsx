import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Désactive le <Container> interne si le contenu gère déjà sa largeur. */
  bare?: boolean;
}

/** Rythme vertical cohérent entre toutes les sections des pages du Module 4. */
export function Section({ children, className, bare = false, ...rest }: SectionProps) {
  return (
    <section className={cn("py-14 sm:py-20", className)} {...rest}>
      {bare ? children : <Container>{children}</Container>}
    </section>
  );
}
