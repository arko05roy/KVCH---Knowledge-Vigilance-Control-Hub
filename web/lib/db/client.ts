import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

let client = globalForPrisma.prisma;
if (!client || !("zkProofJob" in client)) {
  client = new PrismaClient();
}

export const prisma = client;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
