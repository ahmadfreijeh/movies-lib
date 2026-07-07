import { prisma } from "../db/prisma";
import {
  InvitationStatus,
  PermissionAction,
  PermissionResource,
  Role,
} from "../types";

export class InvitationRepository {
  async create(data: {
    email: string;
    token: string;
    role: Role;
    organizationId: string;
    invitedById: string;
    expiresAt: Date;
    permissions: { resource: PermissionResource; action: PermissionAction }[];
  }) {
    const { permissions, ...rest } = data;
    return prisma.invitation.create({
      data: { ...rest, permissions: { create: permissions } },
      include: { permissions: true },
    });
  }

  async findByToken(token: string) {
    await prisma.invitation.updateMany({
      where: {
        token,
        status: InvitationStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: { status: InvitationStatus.EXPIRED },
    });
    return prisma.invitation.findUnique({
      where: { token },
      include: { permissions: true },
    });
  }

  async findPendingByEmail(email: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
    });
  }

  async listForOrganization(organizationId: string) {
    await prisma.invitation.updateMany({
      where: {
        organizationId,
        status: InvitationStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: { status: InvitationStatus.EXPIRED },
    });
    return prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { permissions: true },
    });
  }

  async markAccepted(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date(), status: InvitationStatus.ACCEPTED },
    });
  }

  async findById(id: string) {
    return prisma.invitation.findUnique({ where: { id } });
  }

  async revoke(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { revokedAt: new Date(), status: InvitationStatus.REVOKED },
    });
  }
}
