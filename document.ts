import { z } from "zod";
import { DocumentType, DocumentStatus } from "@prisma/client";

export const requestDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  name: z.string().trim().min(1).max(200),
  demandeId: z.string().uuid().optional(),
  comment: z.string().trim().max(2000).optional(),
});

export const updateDocumentSchema = z.object({
  status: z.nativeEnum(DocumentStatus).optional(),
  comment: z.string().trim().max(2000).optional(),
});

export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo, cf. next.config.ts
