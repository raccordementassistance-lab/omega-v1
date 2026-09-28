import { processSteps } from "@/lib/content/steps";
import { cn } from "@/lib/utils";

interface StepsProps {
  /** "compact" pour l'aperçu de l'accueil, "full" pour /comprendre. */
  variant?: "compact" | "full";
}

export function Steps({ variant = "full" }: StepsProps) {
  return (
    <ol className={cn("grid gap-6", variant === "full" ? "sm:gap-8" : "sm:grid-cols-5 sm:gap-4")}>
      {processSteps.map((step) => (
        <li
          key={step.number}
          className="flex gap-4 rounded-m border border-line bg-bg-raised p-5 sm:flex-col sm:gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-primary-ink">
            {step.number}
          </span>
          <div>
            <h3 className="font-semibold text-ink">{step.title}</h3>
            {variant === "full" ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                {step.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
