import { api } from "@/lib/api";
import { ApiResponse, PaginatedResult, User } from "@/lib/types";

export async function fetchUsers(): Promise<PaginatedResult<User>> {
  const { data } = await api.get<ApiResponse<PaginatedResult<User>>>("/users");
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch team members");
  }
  return data.data;
}
