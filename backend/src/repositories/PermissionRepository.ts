import { prisma } from "../db/prisma";
import { PermissionAction, PermissionResource } from "../types";

export class PermissionRepository {
  async hasPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<boolean> {
    const count = await prisma.permission.count({
      where: {
        userId,
        resource: { in: [resource, PermissionResource.ALL] },
        action: { in: [action, PermissionAction.ALL] },
      },
    });
    return count > 0;
  }

  async listForUser(userId: string) {
    return prisma.permission.findMany({ where: { userId } });
  }

  async grant(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ) {
    return prisma.permission.upsert({
      where: { userId_resource_action: { userId, resource, action } },
      create: { userId, resource, action },
      update: {},
    });
  }

  async revoke(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ) {
    await prisma.permission.deleteMany({ where: { userId, resource, action } });
  }
}
