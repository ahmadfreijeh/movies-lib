import crypto from "crypto";
import { InvitationRepository } from "../repositories/InvitationRepository";
import { AuthRepository } from "../repositories/AuthRepository";
import { CreateInvitationInput } from "../schemas/invitation.schema";
import { parseDurationMs } from "../utils/helper";
import { env } from "../config/env";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors";
import {
  InvitationStatus,
  InvitationWithPermissions,
  InvitationWithStatus,
} from "../types";

function getInvitationStatus(
  invitation: InvitationWithPermissions,
): InvitationStatus {
  if (invitation.revokedAt) return "REVOKED";
  if (invitation.acceptedAt) return "ACCEPTED";
  if (invitation.expiresAt < new Date()) return "EXPIRED";
  return "PENDING";
}

export class InvitationService {
  private readonly invitationRepository: InvitationRepository;
  private readonly authRepository: AuthRepository;

  constructor() {
    this.invitationRepository = new InvitationRepository();
    this.authRepository = new AuthRepository();
  }

  async create(
    invitedById: string,
    organizationId: string,
    input: CreateInvitationInput,
  ): Promise<InvitationWithPermissions> {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + parseDurationMs(env.INVITATION_EXPIRES_IN),
    );

    return this.invitationRepository.create({
      email: input.email,
      role: input.role,
      token,
      organizationId,
      invitedById,
      expiresAt,
      permissions: input.permissions,
    });
  }

  async listForOrganization(
    organizationId: string,
  ): Promise<InvitationWithStatus[]> {
    const invitations =
      await this.invitationRepository.listForOrganization(organizationId);
    return invitations.map((invitation) => ({
      ...invitation,
      status: getInvitationStatus(invitation),
    }));
  }

  async getByToken(token: string): Promise<InvitationWithPermissions> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.revokedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundError("Invalid or expired invitation");
    }
    return invitation;
  }

  async revoke(id: string, organizationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(id);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundError("Invitation not found");
    }
    if (invitation.acceptedAt) {
      throw new ForbiddenError("Cannot revoke an already-accepted invitation");
    }
    if (invitation.revokedAt) {
      return;
    }
    await this.invitationRepository.revoke(id);
  }
}
