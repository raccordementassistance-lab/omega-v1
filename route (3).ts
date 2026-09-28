import { withErrorHandling, ok, okWithMeta } from "@/lib/errors";
import { requireUser, requireStaff } from "@/lib/auth/roles";
import { dossierService } from "@/lib/services/dossier.service";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { listDossiersQuerySchema } from "@/lib/validations/dossier";

/**
 * POST /api/dossiers — crée un dossier vide pour l'utilisateur connecté.
 * Voir docs/api-contracts.md §1.
 */
export const POST = withErrorHandling(async () => {
  const user = await requireUser();
  const dossier = await dossierService.createForClient(user.id);
  return ok(dossier, 201);
});

/**
 * GET /api/dossiers — liste réservée au staff (conseiller/admin).
 */
export const GET = withErrorHandling(async (request: Request) => {
  await requireStaff();

  const { searchParams } = new URL(request.url);
  const query = listDossiersQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  const { items, total } = await dossierRepository.findMany(query);
  return okWithMeta(items, { page: query.page, pageSize: query.pageSize, total });
});
