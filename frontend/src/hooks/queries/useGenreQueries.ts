import { useQuery } from "@tanstack/react-query";
import { fetchGenres } from "@/apis/genres.api";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
    staleTime: 5 * 60 * 1000,
  });
}
