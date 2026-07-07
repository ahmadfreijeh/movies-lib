import { UserRepository } from "../repositories/UserRepository";
import { PermissionRepository } from "../repositories/PermissionRepository";
import { PaginationInput } from "../schemas/pagination.schema";
import { PermissionInput, UpdateRoleInput } from "../schemas/user.schema";
import { PaginatedResult, PublicUser } from "../types";
import { NotFoundError } from "../utils/errors";

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: PublicUser["role"];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

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
    const result = await this.userRepository.findAllInOrganization(organizationId, params);
    return { ...result, items: result.items.map(toPublicUser) };
  }

  private async getUserOrThrow(id: string, organizationId: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateRole(id: string, organizationId: string, input: UpdateRoleInput): Promise<PublicUser> {
    await this.getUserOrThrow(id, organizationId);
    const updated = await this.userRepository.updateRole(id, input.role);
    return toPublicUser(updated);
  }

  async listPermissions(id: string, organizationId: string) {
    await this.getUserOrThrow(id, organizationId);
    return this.permissionRepository.listForUser(id);
  }

  async grantPermission(id: string, organizationId: string, input: PermissionInput) {
    await this.getUserOrThrow(id, organizationId);
    return this.permissionRepository.grant(id, input.resource, input.action);
  }

  async revokePermission(id: string, organizationId: string, input: PermissionInput): Promise<void> {
    await this.getUserOrThrow(id, organizationId);
    await this.permissionRepository.revoke(id, input.resource, input.action);
  }
}
