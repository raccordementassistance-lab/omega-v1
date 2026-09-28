import { prisma } from "@/lib/prisma";
import { demandeRepository } from "@/lib/repositories/demande.repository";
import { Errors } from "@/lib/errors";
import type { AdresseInput } from "@/lib/validations/adresse";
import type { ActorType, DemandeType } from "@prisma/client";

export const demandeService = {
  /**
   * Crée une demande et trace l'événement dans la timeline, dans la même
   * transaction — une demande ne peut jamais exister sans laisser de trace.
   */
  async create(params: {
    dossierId: string;
    type: DemandeType;
    description?: string;
    adresse?: AdresseInput;
    authorId: string;
    authorType: ActorType;
  }) {
    return prisma.$transaction(async (tx) => {
      const demande = await tx.demande.create({
        data: {
          dossier: { connect: { id: params.dossierId } },
          type: params.type,
          description: params.description,
          ...(params.adresse ? { adresse: { create: params.adresse } } : {}),
        },
        include: { adresse: true },
      });

      await tx.timelineEvent.create({
        data: {
          dossierId: params.dossierId,
          label: `Projet décrit : ${params.type}`,
          authorType: params.authorType,
          authorId: params.authorId,
        },
      });

      return demande;
    });
  },

  async update(id: string, data: { status?: string; description?: string; adresse?: AdresseInput }) {
    const existing = await demandeRepository.findOwnership(id);
    if (!existing) throw Errors.notFound("Demande");
    return demandeRepository.update(id, data);
  },

  findMany(dossierId: string) {
    return demandeRepository.findMany(dossierId);
  },
};
