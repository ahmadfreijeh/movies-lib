import { api } from "@/lib/api";
import { ApiResponse, AuthResponse, LoginPayload, SignupPayload } from "@/lib/types";

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
  if (!data.data) {
    throw new Error(data.message ?? "Failed to log in");
  }
  return data.data;
}

export async function signupRequest(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/signup", payload);
  if (!data.data) {
    throw new Error(data.message ?? "Failed to sign up");
  }
  return data.data;
}
