import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitationRequest,
  loginRequest,
  signupRequest,
  updateProfileRequest,
} from "@/apis/auth.api";
import { AcceptInvitationPayload } from "@/lib/types";
import { clearAuthTokens, setAuthTokens, setAuthUser } from "@/lib/utils";

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setAuthUser(data.user);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setAuthUser(data.user);
    },
  });
}

export function useAcceptInvitation(token: string) {
  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) => acceptInvitationRequest(token, payload),
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setAuthUser(data.user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (user) => {
      setAuthUser(user);
      queryClient.setQueryData(["me"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearAuthTokens();
    queryClient.clear();
  };
}
