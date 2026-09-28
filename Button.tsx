import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink hover:brightness-95 active:brightness-90 shadow-sm",
  secondary:
    "bg-primary text-primary-ink hover:brightness-110 active:brightness-95",
  ghost:
    "bg-transparent text-ink border border-line hover:bg-primary-soft",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-m font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.ComponentProps<typeof Link>, keyof CommonProps | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Bouton unique du design system. Rend un <Link> si `href` est fourni,
 * sinon un <button>. Toujours utiliser ce composant plutôt qu'un
 * <button>/<a> stylé à la main.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href !== undefined) {
    const { href } = props;
    const linkProps = { ...props } as Partial<ButtonAsLink>;
    delete linkProps.href;
    delete linkProps.variant;
    delete linkProps.size;
    delete linkProps.className;
    delete linkProps.children;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = { ...props } as Partial<ButtonAsButton>;
  delete buttonProps.href;
  delete buttonProps.variant;
  delete buttonProps.size;
  delete buttonProps.className;
  delete buttonProps.children;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
