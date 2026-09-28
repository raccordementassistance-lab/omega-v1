import { prisma } from "@/lib/prisma";
import { Errors } from "@/lib/errors";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/lib/validations/document";
import type { ActorType, DocumentType } from "@prisma/client";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "dossiers-documents";

export const documentService = {
  async request(params: {
    dossierId: string;
    demandeId?: string;
    type: DocumentType;
    name: string;
    comment?: string;
    authorId: string;
    authorType: ActorType;
  }) {
    return prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          dossierId: params.dossierId,
          demandeId: params.demandeId,
          type: params.type,
          name: params.name,
          comment: params.comment,
          status: "DEMANDE",
          requestedAt: new Date(),
        },
      });
      await tx.timelineEvent.create({
        data: {
          dossierId: params.dossierId,
          label: `Document demandé : ${params.name}`,
          authorType: params.authorType,
          authorId: params.authorId,
        },
      });
      return doc;
    });
  },

  /**
   * Upload réel vers Supabase Storage puis mise à jour du document.
   * Si l'upload échoue, on ne touche pas à la ligne `documents` : le
   * frontend doit proposer l'envoi par e-mail (cf. docs/api-contracts.md §6),
   * ce n'est pas ce service qui décide du fallback UI.
   */
  async uploadAndMarkReceived(params: {
    documentId: string;
    dossierId: string;
    file: File;
  }) {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(params.file.type)) {
      throw Errors.badRequest("Format de fichier non autorisé (PDF, JPG ou PNG uniquement).");
    }
    if (params.file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw Errors.badRequest("Fichier trop volumineux (10 Mo maximum).");
    }

    const storage = createSupabaseServiceRoleClient();
    const extension = params.file.name.split(".").pop() ?? "bin";
    const storagePath = `${params.dossierId}/${params.documentId}.${extension}`;

    const arrayBuffer = await params.file.arrayBuffer();
    const { error: uploadError } = await storage.storage
      .from(BUCKET)
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: params.file.type,
        upsert: true,
      });

    if (uploadError) {
      throw Errors.upstream(`Échec de l'envoi du document : ${uploadError.message}`);
    }

    return prisma.$transaction(async (tx) => {
      const doc = await tx.document.update({
        where: { id: params.documentId },
        data: {
          storagePath,
          mimeType: params.file.type,
          sizeBytes: params.file.size,
          status: "RECU",
          receivedAt: new Date(),
        },
      });
      await tx.timelineEvent.create({
        data: {
          dossierId: params.dossierId,
          label: `Document reçu : ${doc.name}`,
          authorType: "SYSTEME",
        },
      });
      return doc;
    });
  },
};
