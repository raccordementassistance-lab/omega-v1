import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireStaff } from "@/lib/auth/roles";
import { demandeService } from "@/lib/services/demande.service";
import { demandeRepository } from "@/lib/repositories/demande.repository";
import { updateDemandeSchema } from "@/lib/validations/demande";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/demandes/:id — staff uniquement (voir docs/api-contracts.md §2 :
 * le client ne modifie pas une demande après création, il le dit à Lydie).
 */
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  await requireStaff();
  const { id } = await params;

  const existing = await demandeRepository.findOwnership(id);
  if (!existing) throw Errors.notFound("Demande");

  const body = updateDemandeSchema.parse(await request.json());
  const updated = await demandeService.update(id, body);
  return ok(updated);
});
