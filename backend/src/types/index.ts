import {
  InvitationStatus,
  MediaType,
  MovieType,
  PermissionAction,
  PermissionResource,
  Role,
} from "@prisma/client";
import type {
  Genre,
  Invitation,
  InvitationPermission,
  Media,
  Movie,
  Organization,
  Permission,
  User,
} from "@prisma/client";

export {
  InvitationStatus,
  MediaType,
  MovieType,
  PermissionAction,
  PermissionResource,
  Role,
};

export type {
  Genre,
  Invitation,
  InvitationPermission,
  Media,
  Movie,
  Organization,
  Permission,
  User,
};

export type PublicUser = Omit<User, "passwordHash">;

export type AuthenticatedUser = PublicUser & { permissions: Permission[] };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export type InvitationWithPermissions = Invitation & {
  permissions: InvitationPermission[];
};

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface AuthenticatedRequestUser {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
