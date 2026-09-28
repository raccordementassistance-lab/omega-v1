import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en résolvant les conflits (ex: "p-2" vs "p-4").
 * Utilisé par tous les composants UI du Module 4.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
