import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireUser, requireStaff, assertCanAccessDossier, roleToAuthorType } from "@/lib/auth/roles";
import { dossierService } from "@/lib/services/dossier.service";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { updateDossierStatusSchema } from "@/lib/validations/dossier";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/dossiers/:id — propriétaire ou staff.
 * 404 (jamais 403) si le dossier existe mais appartient à quelqu'un d'autre.
 */
export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id } = await params;
  const user = await requireUser();

  const ownership = await dossierRepository.findOwnership(id);
  if (!ownership) throw Errors.notFound("Dossier");
  assertCanAccessDossier(user, ownership.clientId);

  const dossier = await dossierService.getDetail(id);
  return ok(dossier);
});

/**
 * PATCH /api/dossiers/:id — changement de statut, staff uniquement.
 * Écrit dossiers.status + dossier_status_history + timeline_events en une
 * seule transaction (voir dossier.service.ts#changeStatus).
 */
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id } = await params;
  const staff = await requireStaff();
  const body = updateDossierStatusSchema.parse(await request.json());

  const updated = await dossierService.changeStatus({
    dossierId: id,
    newStatus: body.status,
    comment: body.comment,
    expectedVersion: body.expectedVersion,
    demandeId: body.demandeId,
    authorId: staff.id,
    authorType: roleToAuthorType(staff.role),
  });

  return ok(updated);
});
