import { prisma } from "@/lib/prisma";
import type { ActorType, DossierStatus } from "@prisma/client";

export const timelineRepository = {
  addEvent(data: {
    dossierId: string;
    label: string;
    oldStatus?: DossierStatus;
    newStatus?: DossierStatus;
    authorType: ActorType;
    authorId?: string;
  }) {
    return prisma.timelineEvent.create({ data });
  },

  findMany(dossierId: string) {
    return prisma.timelineEvent.findMany({
      where: { dossierId },
      orderBy: { createdAt: "asc" },
    });
  },
};

export const statusHistoryRepository = {
  addEntry(data: {
    dossierId: string;
    oldStatus?: DossierStatus;
    newStatus: DossierStatus;
    authorType: ActorType;
    authorId?: string;
    comment?: string;
  }) {
    return prisma.dossierStatusHistory.create({ data });
  },

  findMany(dossierId: string) {
    return prisma.dossierStatusHistory.findMany({
      where: { dossierId },
      orderBy: { createdAt: "asc" },
    });
  },
};
