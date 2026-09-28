import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Largeur maximale et marges horizontales cohérentes sur tout le site. */
export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...rest}>
      {children}
    </div>
  );
}
