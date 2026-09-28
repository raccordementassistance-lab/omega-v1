import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireUser, assertCanAccessDossier, roleToAuthorType } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { demandeService } from "@/lib/services/demande.service";
import { createDemandeSchema } from "@/lib/validations/demande";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  const user = await requireUser();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");
  assertCanAccessDossier(user, ownership.clientId);

  const body = createDemandeSchema.parse(await request.json());
  const demande = await demandeService.create({
    dossierId,
    type: body.type,
    description: body.description,
    adresse: body.adresse,
    authorId: user.id,
    authorType: roleToAuthorType(user.role),
  });

  return ok(demande, 201);
});

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  const user = await requireUser();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");
  assertCanAccessDossier(user, ownership.clientId);

  const demandes = await demandeService.findMany(dossierId);
  return ok(demandes);
});
