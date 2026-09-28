import { prisma } from "@/lib/prisma";
import type { MessageRole, MessageType, ConversationStep, Prisma } from "@prisma/client";

export const messageRepository = {
  create(data: {
    dossierId: string;
    demandeId?: string;
    role: MessageRole;
    type?: MessageType;
    step: ConversationStep;
    content: string;
    intent?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.message.create({ data });
  },

  findMany(dossierId: string, params: { after?: string; limit: number }) {
    return prisma.message.findMany({
      where: {
        dossierId,
        ...(params.after ? { createdAt: { gt: new Date(params.after) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: params.limit,
    });
  },

  findAllForContext(dossierId: string) {
    return prisma.message.findMany({ where: { dossierId }, orderBy: { createdAt: "asc" } });
  },
};
