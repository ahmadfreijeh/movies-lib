export type Role = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type MovieType = "MOVIE" | "SERIES";

export type MediaType = "VIDEO" | "COVER" | "TRAILER" | "SUBTITLE";

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  movieId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: MovieType;
  releaseYear: number | null;
  genres: Genre[];
  director: string | null;
  rating: number | null;
  media: Media[];
  archivedAt: string | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: FieldError[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface StagedMediaFile {
  file: File;
  type: MediaType;
}

export interface CreateMoviePayload {
  title: string;
  type: MovieType;
  description: string;
  releaseYear?: number;
  genres: string[];
  director: string;
  rating?: number;
  newMedia?: StagedMediaFile[];
  existingMediaIds?: string[];
}

export type UpdateMoviePayload = Partial<CreateMoviePayload> & {
  removedMediaIds?: string[];
};

export interface MoviesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genres?: string[];
  sortBy?: "title" | "releaseYear" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
  status?: "active" | "archived" | "all";
}
