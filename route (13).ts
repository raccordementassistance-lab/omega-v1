import { withErrorHandling, ok, Errors } from "@/lib/errors";
import { requireStaff, requireAdmin } from "@/lib/auth/roles";
import { noteRepository } from "@/lib/repositories/note.repository";
import { updateNoteSchema } from "@/lib/validations/note";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/notes/:id — auteur de la note, ou admin. */
export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const staff = await requireStaff();
  const { id } = await params;

  const note = await noteRepository.findById(id);
  if (!note) throw Errors.notFound("Note");
  if (note.authorId !== staff.id && staff.role !== "ADMIN") throw Errors.forbidden();

  const body = updateNoteSchema.parse(await request.json());
  const updated = await noteRepository.update(id, body.content);
  return ok(updated);
});

/** DELETE /api/notes/:id — admin uniquement. */
export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  await requireAdmin();
  const { id } = await params;

  const note = await noteRepository.findById(id);
  if (!note) throw Errors.notFound("Note");

  await noteRepository.remove(id);
  return ok({ deleted: true });
});
