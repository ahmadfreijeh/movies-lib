import { api } from "@/lib/api";
import { ApiResponse, Media, MediaType } from "@/lib/types";

export async function fetchMedia(params: {
  movieId?: string;
  unattached?: boolean;
}): Promise<Media[]> {
  const { data } = await api.get<ApiResponse<Media[]>>("/media", { params });
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch media");
  }
  return data.data;
}

export async function uploadMediaRequest(payload: {
  file: File;
  type: MediaType;
  movieId?: string;
}): Promise<Media> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("type", payload.type);
  if (payload.movieId) {
    formData.append("movieId", payload.movieId);
  }
  const { data } = await api.post<ApiResponse<Media>>("/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data.data) {
    throw new Error(data.message ?? "Failed to upload media");
  }
  return data.data;
}

export async function attachMediaRequest(
  id: string,
  movieId: string | null,
): Promise<Media> {
  const { data } = await api.patch<ApiResponse<Media>>(`/media/${id}`, {
    movieId,
  });
  if (!data.data) {
    throw new Error(data.message ?? "Failed to attach media");
  }
  return data.data;
}

export async function deleteMediaRequest(id: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/media/${id}`);
}
