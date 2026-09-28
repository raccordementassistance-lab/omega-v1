import { z } from "zod";
import { DossierStatus } from "@prisma/client";

export const createDossierSchema = z.object({}).strict();

export const updateDossierStatusSchema = z.object({
  status: z.nativeEnum(DossierStatus),
  comment: z.string().trim().max(2000).optional(),
  expectedVersion: z.number().int().positive().optional(),
  // Requis par le guard J20 pour la transition MANDAT_A_SIGNER → MANDAT_SIGNE
  // (voir src/state-machine/state-machine-engine.ts#assertGuards) : identifie
  // explicitement la Demande dont les 3 consentements du mandat doivent être
  // vérifiés, plutôt que de deviner "la plus récente" du dossier. Optionnel
  // ici (le schéma reste valable pour toutes les autres transitions), mais
  // le guard refuse la transition MANDAT_SIGNE si ce champ est absent.
  demandeId: z.string().uuid().optional(),
});

export const listDossiersQuerySchema = z.object({
  status: z.nativeEnum(DossierStatus).optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
