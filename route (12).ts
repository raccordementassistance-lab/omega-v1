import { withErrorHandling, ok } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
export const GET = withErrorHandling(async () => { const user = await requireUser(); const dossiers = await prisma.dossier.findMany({ where: { clientId: user.id }, orderBy: { createdAt: "desc" }, include: { demandes: { include: { adresse: true }, orderBy: { createdAt: "asc" } }, documents: true } }); return ok(dossiers); });
