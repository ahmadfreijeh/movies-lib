import { useQuery } from "@tanstack/react-query";
import { fetchMovie, fetchMovies } from "@/apis/movies.api";
import { MoviesQueryParams } from "@/lib/types";

export function useMovies(params: MoviesQueryParams = {}) {
  return useQuery({
    queryKey: ["movies", params],
    queryFn: () => fetchMovies(params),
  });
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: ["movies", id],
    queryFn: () => fetchMovie(id),
    enabled: Boolean(id),
  });
}
