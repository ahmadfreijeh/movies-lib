import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/apis/users.api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
