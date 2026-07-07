import { api } from "@/lib/api";
import { ApiResponse, CreateInvitationPayload, Invitation } from "@/lib/types";

export async function fetchInvitations(): Promise<Invitation[]> {
  const { data } = await api.get<ApiResponse<Invitation[]>>("/invitations");
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch invitations");
  }
  return data.data;
}

export async function createInvitationRequest(
  payload: CreateInvitationPayload,
): Promise<Invitation> {
  const { data } = await api.post<ApiResponse<Invitation>>(
    "/invitations",
    payload,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to create invitation");
  }
  return data.data;
}

export async function revokeInvitationRequest(id: string): Promise<void> {
  await api.delete(`/invitations/${id}`);
}
