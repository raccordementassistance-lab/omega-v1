import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireStaff } from "@/lib/auth/roles";
import { documentRepository } from "@/lib/repositories/document.repository";
import { updateDocumentSchema } from "@/lib/validations/document";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/documents/:id — changement de statut, staff uniquement. */
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  await requireStaff();
  const { id } = await params;

  const existing = await documentRepository.findOwnership(id);
  if (!existing) throw Errors.notFound("Document");

  const body = updateDocumentSchema.parse(await request.json());
  const updated = await documentRepository.update(id, body);
  return ok(updated);
});
