import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireUser, requireStaff, assertCanAccessDossier } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { messageRepository } from "@/lib/repositories/message.repository";
import { createAdvisorMessageSchema, listMessagesQuerySchema } from "@/lib/validations/message";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  const user = await requireUser();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");
  assertCanAccessDossier(user, ownership.clientId);

  const { searchParams } = new URL(request.url);
  const query = listMessagesQuerySchema.parse({
    after: searchParams.get("after") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  const messages = await messageRepository.findMany(dossierId, query);
  return ok(messages);
});

/**
 * POST /api/dossiers/:id/messages — réservé au conseiller qui reprend la
 * main dans la conversation. Le rôle du message (CONSEILLER) est déduit de
 * la session, jamais accepté depuis le body (anti-usurpation).
 * Les messages du client et de Lydie passent par /api/lydie/message
 * (Module 5), pas par cette route générique.
 */
export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id: dossierId } = await params;
  await requireStaff();

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");

  const body = createAdvisorMessageSchema.parse(await request.json());

  const dossier = await prisma.dossier.findUniqueOrThrow({
    where: { id: dossierId },
    select: { currentStep: true },
  });

  const message = await messageRepository.create({
    dossierId,
    demandeId: body.demandeId,
    role: "CONSEILLER",
    type: "TEXTE",
    step: dossier.currentStep,
    content: body.content,
  });

  return ok(message, 201);
});
