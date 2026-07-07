import { useQuery } from "@tanstack/react-query";
import { fetchInvitations } from "@/apis/invitations.api";

export function useInvitations() {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: fetchInvitations,
  });
}
