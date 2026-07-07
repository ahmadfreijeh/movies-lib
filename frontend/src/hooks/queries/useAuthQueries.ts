import { useQuery } from "@tanstack/react-query";
import { fetchInvitationByToken, fetchMe } from "@/apis/auth.api";

export function useInvitationPreview(token: string | null) {
  return useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => fetchInvitationByToken(token as string),
    enabled: token !== null,
    retry: false,
  });
}

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled,
    staleTime: 0,
    retry: false,
  });
}
