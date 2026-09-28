import { z } from "zod";

/** Message écrit par un conseiller qui reprend la main (role déduit de la session). */
export const createAdvisorMessageSchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide.").max(8000),
  demandeId: z.string().uuid().optional(),
});

export const listMessagesQuerySchema = z.object({
  after: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
