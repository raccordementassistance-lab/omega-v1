import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

/**
 * Un item de FAQ accessible, basé sur <details>/<summary> natif :
 * fonctionne sans JavaScript, navigable au clavier, compatible lecteurs
 * d'écran, sans dépendance supplémentaire.
 */
export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  return (
    <details
      className="group rounded-m border border-line bg-bg-raised open:shadow-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-ink marker:content-none">
        <span>{question}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ink-soft transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:text-base">
        {answer}
      </div>
    </details>
  );
}
