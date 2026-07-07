import { AuthenticatedUser, Permission, PublicUser, User } from "../types";

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toAuthenticatedUser(
  user: User,
  permissions: Permission[] = [],
): AuthenticatedUser {
  return { ...toPublicUser(user), permissions };
}
