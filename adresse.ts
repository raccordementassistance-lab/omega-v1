import { z } from "zod";

/**
 * Schéma d'adresse unique, réutilisé partout où une adresse de chantier est
 * saisie (création de demande, mise à jour, futur formulaire direct).
 */
export const adresseSchema = z.object({
  numero: z.string().trim().max(20).optional().nullable(),
  rue: z.string().trim().min(2, "La rue est requise."),
  complement: z.string().trim().max(200).optional().nullable(),
  codePostal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres."),
  ville: z.string().trim().min(1, "La ville est requise."),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  banId: z.string().trim().max(100).optional().nullable(),
});

export type AdresseInput = z.infer<typeof adresseSchema>;
