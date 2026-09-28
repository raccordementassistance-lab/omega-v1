import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Erreur applicative typée — toute route qui échoue volontairement lève une
 * AppError, jamais un throw générique. C'est ce qui permet à withErrorHandling
 * de produire une réponse HTTP cohérente sans dupliquer de try/catch partout.
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  unauthenticated: () => new AppError("UNAUTHENTICATED", "Vous devez être connecté.", 401),
  forbidden: () =>
    new AppError("FORBIDDEN", "Vous n'avez pas les droits pour effectuer cette action.", 403),
  /**
   * Volontairement identique au 404 : ne jamais laisser deviner qu'un dossier
   * existe mais appartient à quelqu'un d'autre.
   */
  notFound: (resource = "Ressource") =>
    new AppError("NOT_FOUND", `${resource} introuvable.`, 404),
  conflict: (message: string) => new AppError("CONFLICT", message, 409),
  badRequest: (message: string) => new AppError("BAD_REQUEST", message, 400),
  upstream: (message: string) => new AppError("UPSTREAM_ERROR", message, 502),
  internal: () =>
    new AppError("INTERNAL_ERROR", "Une erreur inattendue est survenue.", 500),
};

/**
 * Enveloppe standard de toutes les routes API : { data } en succès,
 * { error: { code, message } } en échec. Voir docs/api-contracts.md.
 */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function okWithMeta<T>(data: T, meta: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

/**
 * Enveloppe tout Route Handler : convertit AppError, ZodError et erreurs
 * inattendues en réponse JSON cohérente. Chaque route s'écrit ainsi :
 *
 *   export const POST = withErrorHandling(async (req) => { ... return ok(...) })
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json(
          { error: { code: err.code, message: err.message } },
          { status: err.status }
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Certaines données envoyées sont invalides.",
              details: err.flatten(),
            },
          },
          { status: 400 }
        );
      }
      // Erreur non anticipée : loguée côté serveur, jamais exposée telle
      // quelle au client (pas de fuite de détail d'implémentation/stack).
      console.error("[unhandled_api_error]", err);
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Une erreur inattendue est survenue." } },
        { status: 500 }
      );
    }
  };
}
