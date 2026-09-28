import { z } from "zod";

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, "La note ne peut pas être vide.").max(4000),
});

export const updateNoteSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});
