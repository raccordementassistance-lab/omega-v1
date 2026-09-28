import { prisma } from "@/lib/prisma";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { Errors } from "@/lib/errors";
import { transitionDossier } from "@/state-machine/state-machine-engine";
import type { DossierStatus, ActorType } from "@prisma/client";

export const dossierService = {
  async createForClient(clientId: string) {
    // Une transaction : le dossier ET l'entrée timeline "créé" naissent ensemble,
    // jamais l'un sans l'autre (traçabilité garantie dès la ligne 1).
    return prisma.$transaction(async (tx) => {
      const dossier = await tx.dossier.create({ data: { clientId } });
      await tx.timelineEvent.create({
        data: {
          dossierId: dossier.id,
          label: "Dossier créé",
          newStatus: dossier.status,
          authorType: "CLIENT",
          authorId: clientId,
        },
      });
      await tx.dossierStatusHistory.create({
        data: {
          dossierId: dossier.id,
          newStatus: dossier.status,
          authorType: "CLIENT",
          authorId: clientId,
        },
      });
      return dossier;
    });
  },

  async getDetail(id: string) {
    const dossier = await dossierRepository.findByIdWithDetails(id);
    if (!dossier) throw Errors.notFound("Dossier");

    const grouped = await dossierRepository.documentsSummary(id);
    const documentsResume = {
      recu: grouped.find((g) => g.status === "RECU")?._count ?? 0,
      manquant: grouped.find((g) => g.status === "MANQUANT")?._count ?? 0,
      aVerifier: grouped.find((g) => g.status === "A_VERIFIER")?._count ?? 0,
    };

    return { ...dossier, documentsResume };
  },

  /**
   * Change le statut d'un dossier de façon atomique : dossiers.status,
   * dossier_status_history ET timeline_events sont écrits dans la même
   * transaction — jamais l'un sans les autres (cf. docs/api-contracts.md §1).
   */
  async changeStatus(params: {
    dossierId: string;
    newStatus: DossierStatus;
    authorId: string;
    authorType: ActorType;
    comment?: string;
    expectedVersion?: number;
    // Requis par le guard J20 pour MANDAT_A_SIGNER → MANDAT_SIGNE (voir
    // state-machine-engine.ts) — jamais deviné, toujours transporté depuis
    // la requête (PATCH /api/dossiers/:id → updateDossierStatusSchema).
    demandeId?: string;
  }) {
    return transitionDossier({
      dossierId: params.dossierId,
      to: params.newStatus,
      actorId: params.authorId,
      actorType: params.authorType,
      comment: params.comment,
      expectedVersion: params.expectedVersion,
      demandeId: params.demandeId,
    });
  }

};
