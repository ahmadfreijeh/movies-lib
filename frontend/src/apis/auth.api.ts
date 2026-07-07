import { api } from "@/lib/api";
import {
  AcceptInvitationPayload,
  ApiResponse,
  AuthResponse,
  InvitationPreview,
  LoginPayload,
  SignupPayload,
  User,
} from "@/lib/types";

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    payload,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to log in");
  }
  return data.data;
}

export async function signupRequest(
  payload: SignupPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    "/auth/signup",
    payload,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to sign up");
  }
  return data.data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  if (!data.data) {
    throw new Error(data.message ?? "Failed to fetch profile");
  }
  return data.data;
}

export async function updateProfileRequest(payload: {
  name: string;
}): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>("/auth/me", payload);
  if (!data.data) {
    throw new Error(data.message ?? "Failed to update profile");
  }
  return data.data;
}

export async function fetchInvitationByToken(
  token: string,
): Promise<InvitationPreview> {
  const { data } = await api.get<ApiResponse<InvitationPreview>>(
    `/auth/invitations/${token}`,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Invitation not found");
  }
  return data.data;
}

export async function acceptInvitationRequest(
  token: string,
  payload: AcceptInvitationPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    `/auth/invitations/${token}/accept`,
    payload,
  );
  if (!data.data) {
    throw new Error(data.message ?? "Failed to accept invitation");
  }
  return data.data;
}
