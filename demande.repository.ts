import { prisma } from "@/lib/prisma";
import type { AdresseInput } from "@/lib/validations/adresse";
import type { Prisma } from "@prisma/client";

export const demandeRepository = {
  async create(
    dossierId: string,
    data: { type: string; description?: string; adresse?: AdresseInput }
  ) {
    return prisma.demande.create({
      data: {
        dossier: { connect: { id: dossierId } },
        type: data.type as Prisma.DemandeCreateInput["type"],
        description: data.description,
        ...(data.adresse ? { adresse: { create: data.adresse } } : {}),
      },
      include: { adresse: true },
    });
  },

  findMany(dossierId: string) {
    return prisma.demande.findMany({
      where: { dossierId },
      include: { adresse: true },
      orderBy: { createdAt: "asc" },
    });
  },

  findOwnership(id: string) {
    return prisma.demande.findUnique({
      where: { id },
      select: { id: true, dossier: { select: { id: true, clientId: true } } },
    });
  },

  async update(
    id: string,
    data: { status?: string; description?: string; adresse?: AdresseInput }
  ) {
    const existing = await prisma.demande.findUniqueOrThrow({
      where: { id },
      select: { adresseId: true },
    });

    return prisma.demande.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status as Prisma.DemandeUpdateInput["status"] } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.adresse
          ? existing.adresseId
            ? { adresse: { update: data.adresse } }
            : { adresse: { create: data.adresse } }
          : {}),
      },
      include: { adresse: true },
    });
  },
};
