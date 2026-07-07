import crypto from "crypto";
import { InvitationRepository } from "../repositories/InvitationRepository";
import { AuthRepository } from "../repositories/AuthRepository";
import { CreateInvitationInput } from "../schemas/invitation.schema";
import { parseDurationMs } from "../utils/helper";
import { env } from "../config/env";
import { ConflictError, NotFoundError } from "../utils/errors";
import { Invitation, InvitationStatus, InvitationWithStatus } from "../types";

function getInvitationStatus(invitation: Invitation): InvitationStatus {
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
  ): Promise<Invitation> {
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

  async getByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundError("Invalid or expired invitation");
    }
    return invitation;
  }
}
