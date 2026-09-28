import { Errors } from "@/lib/errors";
import type { CurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/session";
import type { ActorType } from "@prisma/client";

export { requireUser, requireStaff, requireAdmin, isStaff } from "@/lib/auth/session";

export function roleToActorType(role: CurrentUser["role"]): ActorType {
  if (role === "CLIENT") return "CLIENT";
  if (role === "CONSEILLER") return "CONSEILLER";
  return "ADMIN";
}

/** Alias conservé pour les routes existantes. */
export const roleToAuthorType = roleToActorType;

export function assertCanAccessDossier(user: CurrentUser, dossierClientId: string): void {
  if (isStaff(user)) return;
  if (dossierClientId !== user.id) throw Errors.notFound("Dossier");
}
