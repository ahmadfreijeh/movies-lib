import { prisma } from "../db/prisma";
import { PaginationInput } from "../schemas/pagination.schema";
import { Role } from "../types";

export class UserRepository {
  async findAllInOrganization(
    organizationId: string,
    params: Pick<PaginationInput, "page" | "pageSize">,
  ) {
    const { page, pageSize } = params;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { organizationId } }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  }

  async updateName(id: string, name: string) {
    return prisma.user.update({ where: { id }, data: { name } });
  }
}
