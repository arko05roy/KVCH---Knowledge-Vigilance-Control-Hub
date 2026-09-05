import "server-only";
import { prisma } from "../db/client";

export async function assertDatabaseHealthy(): Promise<void> {
  await prisma.$queryRawUnsafe("SELECT 1");
}
