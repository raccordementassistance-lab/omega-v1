import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireUser, assertCanAccessDossier } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { timelineRepository } from "@/lib/repositories/timeline.repository";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  const user = await requireUser();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");
  assertCanAccessDossier(user, ownership.clientId);

  const events = await timelineRepository.findMany(dossierId);
  return ok(events);
});
