import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const TEST_ORGANIZATION_NAME = "Test Org";

export async function findTestOrganization() {
  return prisma.organization.findFirst({
    where: { name: TEST_ORGANIZATION_NAME },
  });
}

export async function findOrganizationUser(organizationId: string) {
  return prisma.user.findFirst({
    where: { organizationId, role: "SUPER_ADMIN" },
  });
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
