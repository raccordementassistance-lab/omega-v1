import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireStaff } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { noteRepository } from "@/lib/repositories/note.repository";
import { createNoteSchema } from "@/lib/validations/note";

type Params = { params: Promise<{ id: string }> };

/**
 * GET/POST /api/dossiers/:id/notes — staff uniquement, sans exception.
 * Un client authentifié, même propriétaire du dossier, reçoit 403 ici :
 * requireStaff() lève avant même de vérifier la propriété du dossier.
 * Deuxième verrou indépendant : la policy RLS "internal_notes_select_staff_only".
 */
export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  await requireStaff();
  const { id: dossierId } = await params;

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");

  const notes = await noteRepository.findMany(dossierId);
  return ok(notes);
});

export const POST = withErrorHandling(async (request: Request, { params }: Params) => {
  const staff = await requireStaff();
  const { id: dossierId } = await params;

  const ownership = await dossierRepository.findOwnership(dossierId);
  if (!ownership) throw Errors.notFound("Dossier");

  const body = createNoteSchema.parse(await request.json());
  const note = await noteRepository.create(dossierId, staff.id, body.content);
  return ok(note, 201);
});
