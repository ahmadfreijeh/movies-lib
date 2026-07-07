import { UserRepository } from "../repositories/UserRepository";
import { PermissionRepository } from "../repositories/PermissionRepository";
import { PaginationInput } from "../schemas/pagination.schema";
import {
  PermissionInput,
  UpdateProfileInput,
  UpdateRoleInput,
} from "../schemas/user.schema";
import { AuthenticatedUser, PaginatedResult, PublicUser } from "../types";
import { NotFoundError } from "../utils/errors";
import { toAuthenticatedUser, toPublicUser } from "../utils/userMapper";

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly permissionRepository: PermissionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.permissionRepository = new PermissionRepository();
  }

  async list(
    organizationId: string,
    params: Pick<PaginationInput, "page" | "pageSize">,
  ): Promise<PaginatedResult<PublicUser>> {
    const result = await this.userRepository.findAllInOrganization(
      organizationId,
      params,
    );
    return { ...result, items: result.items.map(toPublicUser) };
  }

  async me(userId: string): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const permissions = await this.permissionRepository.listForUser(userId);
    return toAuthenticatedUser(user, permissions);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const updated = await this.userRepository.updateName(userId, input.name);
    const permissions = await this.permissionRepository.listForUser(userId);
    return toAuthenticatedUser(updated, permissions);
  }

  private async getUserOrThrow(id: string, organizationId: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateRole(
    id: string,
    organizationId: string,
    input: UpdateRoleInput,
  ): Promise<PublicUser> {
    await this.getUserOrThrow(id, organizationId);
    const updated = await this.userRepository.updateRole(id, input.role);
    return toPublicUser(updated);
  }

  async listPermissions(id: string, organizationId: string) {
    await this.getUserOrThrow(id, organizationId);
    return this.permissionRepository.listForUser(id);
  }

  async grantPermission(
    id: string,
    organizationId: string,
    input: PermissionInput,
  ) {
    await this.getUserOrThrow(id, organizationId);
    return this.permissionRepository.grant(id, input.resource, input.action);
  }

  async revokePermission(
    id: string,
    organizationId: string,
    input: PermissionInput,
  ): Promise<void> {
    await this.getUserOrThrow(id, organizationId);
    await this.permissionRepository.revoke(id, input.resource, input.action);
  }
}
