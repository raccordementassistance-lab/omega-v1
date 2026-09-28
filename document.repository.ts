import { prisma } from "@/lib/prisma";
import type { DocumentStatus, DocumentType } from "@prisma/client";

export const documentRepository = {
  request(data: {
    dossierId: string;
    demandeId?: string;
    type: DocumentType;
    name: string;
    comment?: string;
  }) {
    return prisma.document.create({
      data: { ...data, status: "DEMANDE", requestedAt: new Date() },
    });
  },

  findMany(dossierId: string) {
    return prisma.document.findMany({ where: { dossierId }, orderBy: { requestedAt: "asc" } });
  },

  findOwnership(id: string) {
    return prisma.document.findUnique({
      where: { id },
      select: { id: true, dossier: { select: { id: true, clientId: true } } },
    });
  },

  markReceived(id: string, data: { storagePath: string; mimeType: string; sizeBytes: number }) {
    return prisma.document.update({
      where: { id },
      data: { ...data, status: "RECU", receivedAt: new Date() },
    });
  },

  update(id: string, data: { status?: DocumentStatus; comment?: string }) {
    return prisma.document.update({ where: { id }, data });
  },
};
