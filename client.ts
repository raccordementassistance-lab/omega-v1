"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur — utilisé par les Client Components pour
 * signUp/signInWithPassword/signOut. Ne contient que la clé publique (anon).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
