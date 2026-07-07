import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const prisma = new PrismaClient();

export const TEST_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

export async function ensureOrganization() {
  return prisma.organization.upsert({
    where: { id: TEST_ORGANIZATION_ID },
    update: {},
    create: {
      id: TEST_ORGANIZATION_ID,
      name: "Test Organization",
    },
  });
}

export async function ensureSeedUser(organizationId: string) {
  const passwordHash = await bcrypt.hash("password123", 10);
  return prisma.user.upsert({
    where: { email: "seeder@movie-library.local" },
    update: {},
    create: {
      name: "Seed User",
      email: "seeder@movie-library.local",
      passwordHash,
      role: "ADMIN",
      organizationId,
    },
  });
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
