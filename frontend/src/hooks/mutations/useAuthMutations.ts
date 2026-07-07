import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, signupRequest } from "@/apis/auth.api";
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

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearAuthTokens();
    queryClient.clear();
  };
}
