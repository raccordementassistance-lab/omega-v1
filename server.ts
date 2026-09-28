import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur (Route Handlers, Server Components).
 * Lit/écrit la session via les cookies Next.js — c'est ce client qui porte
 * le JWT de l'utilisateur, donc RLS s'applique normalement à toutes ses
 * requêtes (ce n'est PAS un client service_role).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component (lecture seule) : la session
            // sera rafraîchie par le middleware sur la prochaine requête.
          }
        },
      },
    }
  );
}

/**
 * Client "service_role" — bypass RLS. Réservé aux opérations système
 * documentées dans supabase/policies/README.md (messages de Lydie, timeline
 * système, e-mails). Ne JAMAIS l'utiliser pour répondre à une requête
 * initiée par un client sans avoir vérifié ses droits en amont.
 */
export function createSupabaseServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
