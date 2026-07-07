import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, signupRequest } from "@/apis/auth.api";
import { clearAuthTokens, setAuthTokens } from "@/lib/api";

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
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
