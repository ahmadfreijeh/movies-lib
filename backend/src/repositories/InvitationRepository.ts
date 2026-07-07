import { prisma } from "../db/prisma";
import { Role } from "../types";

export class InvitationRepository {
  async create(data: {
    email: string;
    token: string;
    role: Role;
    organizationId: string;
    invitedById: string;
    expiresAt: Date;
  }) {
    return prisma.invitation.create({ data });
  }

  async findByToken(token: string) {
    return prisma.invitation.findUnique({ where: { token } });
  }

  async listForOrganization(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAccepted(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }
}
