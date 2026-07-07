import { api } from "@/lib/api";
import {
  ApiResponse,
  CreateMoviePayload,
  GenreMovies,
  GroupedMoviesQueryParams,
  Movie,
  MoviesQueryParams,
  PaginatedResult,
  UpdateMoviePayload,
} from "@/lib/types";

export async function fetchMovies(
  params: MoviesQueryParams,
): Promise<PaginatedResult<Movie>> {
  const { data } = await api.get<ApiResponse<PaginatedResult<Movie>>>(
    "/movies",
    { params },
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch movies");
  }
  return data.data;
}

export async function fetchGroupedMovies(
  params: GroupedMoviesQueryParams,
): Promise<GenreMovies[]> {
  const { data } = await api.get<ApiResponse<GenreMovies[]>>(
    "/movies/grouped-by-genre",
    { params },
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch movies");
  }
  return data.data;
}

export async function fetchMovie(id: string): Promise<Movie> {
  const { data } = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch movie");
  }
  return data.data;
}

function buildMovieFormData(
  payload: CreateMoviePayload | UpdateMoviePayload,
): FormData {
  const formData = new FormData();

  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.type !== undefined) formData.append("type", payload.type);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.releaseYear !== undefined) formData.append("releaseYear", String(payload.releaseYear));
  if (payload.director !== undefined) formData.append("director", payload.director);
  if (payload.rating !== undefined) formData.append("rating", String(payload.rating));
  if (payload.genres !== undefined) formData.append("genres", JSON.stringify(payload.genres));
  if (payload.existingMediaIds !== undefined) {
    formData.append("existingMediaIds", JSON.stringify(payload.existingMediaIds));
  }
  if ("removedMediaIds" in payload && payload.removedMediaIds !== undefined) {
    formData.append("removedMediaIds", JSON.stringify(payload.removedMediaIds));
  }
  if (payload.newMedia?.length) {
    formData.append(
      "mediaTypes",
      JSON.stringify(payload.newMedia.map((item) => item.type)),
    );
    payload.newMedia.forEach((item) => formData.append("media", item.file));
  }

  return formData;
}

export async function createMovieRequest(
  payload: CreateMoviePayload,
): Promise<Movie> {
  const { data } = await api.post<ApiResponse<Movie>>(
    "/movies",
    buildMovieFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to create movie");
  }
  return data.data;
}

export async function updateMovieRequest(
  id: string,
  payload: UpdateMoviePayload,
): Promise<Movie> {
  const { data } = await api.put<ApiResponse<Movie>>(
    `/movies/${id}`,
    buildMovieFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to update movie");
  }
  return data.data;
}

export async function archiveMovieRequest(id: string): Promise<Movie> {
  const { data } = await api.patch<ApiResponse<Movie>>(`/movies/${id}/archive`);
  if (!data.data) {
    throw new Error(data.message ?? "Failed to archive movie");
  }
  return data.data;
}

export async function reactivateMovieRequest(id: string): Promise<Movie> {
  const { data } = await api.patch<ApiResponse<Movie>>(
    `/movies/${id}/reactivate`,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to reactivate movie");
  }
  return data.data;
}

export async function deleteMovieRequest(id: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/movies/${id}`);
}
