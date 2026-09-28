import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exécuté sur toutes les routes sauf les assets statiques, pour que
     * chaque Route Handler / Server Component voie une session à jour.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
