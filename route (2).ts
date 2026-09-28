import { withErrorHandling, ok } from "@/lib/errors";
import { requireUser } from "@/lib/auth/roles";

/**
 * GET /api/auth/me — résout le profil applicatif (public.users) de
 * l'utilisateur connecté, rôle inclus. Utilisé par le frontend pour savoir
 * s'il doit proposer le lien "Espace conseiller".
 */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return ok(user);
});
