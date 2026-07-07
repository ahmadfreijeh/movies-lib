import { useQuery } from "@tanstack/react-query";
import { fetchMedia } from "@/apis/media.api";

export function useUnattachedMedia() {
  return useQuery({
    queryKey: ["media", "unattached"],
    queryFn: () => fetchMedia({ unattached: true }),
  });
}
