import bcrypt from "bcryptjs";
import { AuthRepository } from "../repositories/AuthRepository";
import { InvitationRepository } from "../repositories/InvitationRepository";
import { PermissionRepository } from "../repositories/PermissionRepository";
import { AcceptInvitationInput } from "../schemas/invitation.schema";
import { LoginInput, SignupInput } from "../schemas/auth.schema";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { parseDurationMs } from "../utils/helper";
import { env } from "../config/env";
import { Permission, PublicUser, Role } from "../types";

const SALT_ROUNDS = 10;

interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthenticatedUser = PublicUser & { permissions: Permission[] };

function toPublicUser(user: UserRecord, permissions: Permission[] = []): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    permissions,
  };
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly invitationRepository: InvitationRepository;
  private readonly permissionRepository: PermissionRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.invitationRepository = new InvitationRepository();
    this.permissionRepository = new PermissionRepository();
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: Role,
    organizationId: string,
  ): Promise<TokenPair> {
    const payload = { userId, email, role, organizationId };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(
      Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
    );
    await this.authRepository.storeRefreshToken({
      token: refreshToken,
      userId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async signup(input: SignupInput): Promise<{ user: AuthenticatedUser } & TokenPair> {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const pendingInvitation =
      await this.invitationRepository.findPendingByEmail(input.email);
    if (pendingInvitation) {
      throw new ConflictError(
        "This email has a pending team invitation. Please use your invite link to join instead of signing up.",
      );
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.authRepository.createWithOrganization({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "SUPER_ADMIN",
      organizationName: input.organizationName,
    });

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    return { user: toPublicUser(user), ...tokens };
  }

  async login(input: LoginInput): Promise<{ user: AuthenticatedUser } & TokenPair> {
    const user = await this.authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    const permissions = await this.permissionRepository.listForUser(user.id);
    return { user: toPublicUser(user, permissions), ...tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const stored = await this.authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.authRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.authRepository.revokeRefreshToken(refreshToken);
    return this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
  }

  async me(userId: string): Promise<AuthenticatedUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const permissions = await this.permissionRepository.listForUser(userId);
    return toPublicUser(user, permissions);
  }

  async acceptInvitation(
    token: string,
    input: AcceptInvitationInput,
  ): Promise<{ user: AuthenticatedUser } & TokenPair> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.revokedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new BadRequestError("Invalid or expired invitation");
    }

    const existing = await this.authRepository.findByEmail(invitation.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.authRepository.createInOrganization({
      name: input.name,
      email: invitation.email,
      passwordHash,
      role: invitation.role,
      organizationId: invitation.organizationId,
      permissions: invitation.permissions.map(({ resource, action }) => ({
        resource,
        action,
      })),
    });

    await this.invitationRepository.markAccepted(invitation.id);

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );
    const permissions = await this.permissionRepository.listForUser(user.id);
    return { user: toPublicUser(user, permissions), ...tokens };
  }
}
