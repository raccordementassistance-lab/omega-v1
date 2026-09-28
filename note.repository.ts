import { prisma } from "@/lib/prisma";

export const noteRepository = {
  create(dossierId: string, authorId: string, content: string) {
    return prisma.internalNote.create({ data: { dossierId, authorId, content } });
  },

  findMany(dossierId: string) {
    return prisma.internalNote.findMany({
      where: { dossierId },
      include: { author: { select: { nom: true, prenom: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.internalNote.findUnique({ where: { id } });
  },

  update(id: string, content: string) {
    return prisma.internalNote.update({ where: { id }, data: { content } });
  },

  remove(id: string) {
    return prisma.internalNote.delete({ where: { id } });
  },
};
