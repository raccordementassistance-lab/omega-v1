import { z } from "zod";
import { DemandeType, DemandeStatus } from "@prisma/client";
import { adresseSchema } from "@/lib/validations/adresse";

export const createDemandeSchema = z.object({
  type: z.nativeEnum(DemandeType),
  description: z.string().trim().max(4000).optional(),
  adresse: adresseSchema.optional(),
});

export const updateDemandeSchema = z.object({
  status: z.nativeEnum(DemandeStatus).optional(),
  description: z.string().trim().max(4000).optional(),
  adresse: adresseSchema.optional(),
});
