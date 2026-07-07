import { prisma } from "../db/prisma";
import { Role } from "../types";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async createWithOrganization(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    organizationName: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        organization: { create: { name: data.organizationName } },
      },
    });
  }

  async createInOrganization(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    organizationId: string;
  }) {
    return prisma.user.create({ data });
  }

  async storeRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revokeRefreshToken(token: string) {
    await prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }
}
