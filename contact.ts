import { z } from "zod";

/**
 * Identique au schéma déjà écrit côté Module 4 (ContactForm.tsx) — repris
 * tel quel côté serveur pour ne jamais faire confiance à la seule
 * validation client.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom complet."),
  email: z.string().trim().email("Indiquez une adresse e-mail valide."),
  subject: z.string().trim().min(3, "Indiquez un sujet."),
  message: z.string().trim().min(10, "Votre message doit contenir au moins 10 caractères."),
});
