import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Errors } from "@/lib/errors";
import type { Role } from "@prisma/client";

export type CurrentUser = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
};

/**
 * Résout l'utilisateur courant à partir de la session Supabase, puis va
 * chercher son profil applicatif (rôle inclus) dans public.users.
 * Retourne null si personne n'est connecté — ne lève jamais d'erreur ici,
 * c'est aux guards (requireAuth/requireStaff) de décider si c'est bloquant.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile) return null; // profil pas encore synchronisé par le trigger — cas rarissime

  return {
    id: profile.id,
    email: profile.email,
    nom: profile.nom,
    prenom: profile.prenom,
    role: profile.role,
  };
}

/** Lève UNAUTHENTICATED si personne n'est connecté. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw Errors.unauthenticated();
  return user;
}

/** Lève FORBIDDEN si l'utilisateur connecté n'est pas conseiller/admin. */
export async function requireStaff(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "CONSEILLER" && user.role !== "ADMIN") throw Errors.forbidden();
  return user;
}

/** Lève FORBIDDEN si l'utilisateur connecté n'est pas admin. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw Errors.forbidden();
  return user;
}

export function isStaff(user: CurrentUser): boolean {
  return user.role === "CONSEILLER" || user.role === "ADMIN";
}
