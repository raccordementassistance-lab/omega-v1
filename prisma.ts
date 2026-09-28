import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma — à importer partout via `@/lib/prisma`, jamais
 * `new PrismaClient()` ailleurs (règle ESLint dédiée, voir .eslintrc.json).
 * En développement, Next.js recharge les modules à chaud : sans ce pattern,
 * chaque rechargement ouvrirait une nouvelle connexion à Postgres.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
