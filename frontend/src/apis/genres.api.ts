import { api } from "@/lib/api";
import { ApiResponse, Genre } from "@/lib/types";

export async function fetchGenres(): Promise<Genre[]> {
  const { data } = await api.get<ApiResponse<Genre[]>>("/genres");
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch genres");
  }
  return data.data;
}
