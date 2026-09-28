import { prisma } from "@/lib/prisma";
import type { DossierStatus, Prisma } from "@prisma/client";

export const dossierRepository = {
  create(clientId: string) {
    return prisma.dossier.create({ data: { client: { connect: { id: clientId } } } });
  },

  findByIdWithDetails(id: string) {
    return prisma.dossier.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        demandes: { include: { adresse: true }, orderBy: { createdAt: "asc" } },
        documents: { orderBy: { requestedAt: "asc" } },
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
        timelineEvents: { orderBy: { createdAt: "asc" }, take: 100 },
      },
    });
  },

  /** Version minimale, pour les contrôles de droits (évite de charger les relations). */
  findOwnership(id: string) {
    return prisma.dossier.findUnique({ where: { id }, select: { id: true, clientId: true } });
  },

  /**
   * Mission P3.3 (Dossier Vivant) : retrouve le dossier le plus récent d'un
   * client, pour que Lydie puisse le reprendre sans que le client ait
   * besoin de connaître son identifiant (nouvel appareil, stockage local
   * vidé...) — voir `deriveLydieContextFromDossier` (resume.ts, inchangé)
   * pour ce qui est fait de ce résultat. Lecture seule, aucune nouvelle
   * table, aucune migration.
   */
  findLatestForClient(clientId: string) {
    return prisma.dossier.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: { demandes: { include: { adresse: true }, orderBy: { createdAt: "asc" } } },
    });
  },

  async findMany(params: {
    status?: DossierStatus;
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.DossierWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { numero: { contains: params.q, mode: "insensitive" } },
              { client: { nom: { contains: params.q, mode: "insensitive" } } },
              { client: { prenom: { contains: params.q, mode: "insensitive" } } },
              { client: { email: { contains: params.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.dossier.findMany({
        where,
        include: { client: { select: { nom: true, prenom: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.dossier.count({ where }),
    ]);

    return { items, total };
  },

  documentsSummary(dossierId: string) {
    return prisma.document.groupBy({
      by: ["status"],
      where: { dossierId },
      _count: true,
    });
  },


  updateCurrentStep(id: string, currentStep: Prisma.DossierUpdateInput["currentStep"]) {
    return prisma.dossier.update({ where: { id }, data: { currentStep } });
  },
};
