import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Rafraîchit la session Supabase à chaque requête (appelé depuis middleware.ts
 * à la racine). Nécessaire avec @supabase/ssr : sans ça, les tokens expirent
 * silencieusement et les Route Handlers voient des sessions invalides.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Important : ce call rafraîchit le token si besoin (ne pas retirer,
  // même si `user` n'est pas utilisé directement ici).
  await supabase.auth.getUser();

  return response;
}
