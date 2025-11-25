// src/lib/subscription.ts
import { prisma } from "@/lib/prisma";

export async function getActiveSubscriptionForUser(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Por enquanto, se você só tem 1 empresa por banco,
 * podemos contar todos os clientes.
 * Depois, quando tiver Workspace, filtramos por workspaceId.
 */
export async function getTotalClientsForUser(userId: string) {
  // TODO: adaptar para multi-tenant no futuro.
  const count = await prisma.client.count();
  return count;
}
