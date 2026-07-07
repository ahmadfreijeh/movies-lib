import type {
  Genre,
  Invitation,
  Media,
  MediaType,
  Movie,
  MovieType,
  Organization,
  Permission,
  PermissionAction,
  PermissionResource,
  Role,
  User,
} from "@prisma/client";

export type {
  Genre,
  Invitation,
  Media,
  MediaType,
  Movie,
  MovieType,
  Organization,
  Permission,
  PermissionAction,
  PermissionResource,
  Role,
  User,
};

export type PublicUser = Omit<User, "passwordHash">;

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
