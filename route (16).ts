import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAddressSuggestions } from "@/lib/lydie/addressSuggestions";

/**
 * Point d'entrée BAN côté API — Bloc A de la mission P2B.0.
 *
 * Rôle STRICTEMENT limité à exposer `fetchAddressSuggestions()` (déjà écrit
 * et testé en P2A.1, voir BAN-INTEGRATION-PLAN.md) au client, sans jamais
 * l'appeler depuis `stepLydie()` (engine.ts, protégé, reste une fonction
 * pure — voir addressSuggestions.ts pour la justification complète).
 *
 * « Le front ne contacte jamais directement la BAN hors du flux prévu »
 * (MASTER-RUNBOOK-V1 §3) : c'est exactement le rôle de cette route — le
 * client (chat/page.tsx) appelle CETTE route, jamais
 * `api-adresse.data.gouv.fr` directement.
 *
 * Aucune authentification requise : la requête ne transmet qu'un texte de
 * recherche d'adresse déjà tapé par le client dans le chat, sans identifiant
 * de dossier ni donnée personnelle au-delà de ce texte (voir
 * BAN-INTEGRATION-PLAN.md §8, Sécurité). Aucun accès Prisma, aucune écriture,
 * aucune transition J20 dans ce fichier.
 *
 * NON VÉRIFIÉ dans cet environnement de développement : comme pour
 * `src/app/api/lydie/route.ts`, ce fichier dépend de Next.js/Zod, non
 * installables ici (`npm ci` → 403 sur le registre npm) — relu (👁️)
 * attentivement, jamais compilé/exécuté en conditions Next réelles. La
 * fonction qu'il délègue (`fetchAddressSuggestions`) est en revanche
 * réellement testée (voir lydie-address-suggestions.test.ts, 7 tests).
 */

const querySchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { q } = querySchema.parse({ q: url.searchParams.get("q") ?? "" });
    const result = await fetchAddressSuggestions(q);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof z.ZodError ? "Requête invalide." : "Suggestions indisponibles.";
    // Toujours un repli propre côté API elle-même : un texte de recherche
    // invalide ou une erreur inattendue ne doit jamais faire échouer le
    // parcours ADDRESS côté client — voir fetchAddressSuggestions(), qui
    // applique déjà cette même règle un niveau plus bas.
    return NextResponse.json(
      { suggestions: [], source: "UNAVAILABLE", error: { message } },
      { status: error instanceof z.ZodError ? 400 : 200 }
    );
  }
}
