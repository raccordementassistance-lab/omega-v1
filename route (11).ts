import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireStaff, roleToAuthorType } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { documentService } from "@/lib/services/document.service";
import { requestDocumentSchema } from "@/lib/validations/document";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/dossiers/:id/documents/request — un conseiller demande une pièce
 * complémentaire. Lydie (Module 5) appelle documentService.request()
 * directement, sans passer par HTTP, pour le même effet.
 */
export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  const staff = await requireStaff();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");

  const body = requestDocumentSchema.parse(await request.json());
  const document = await documentService.request({
    dossierId,
    demandeId: body.demandeId,
    type: body.type,
    name: body.name,
    comment: body.comment,
    authorId: staff.id,
    authorType: roleToAuthorType(staff.role),
  });

  return ok(document, 201);
});
