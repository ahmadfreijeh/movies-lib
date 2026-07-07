import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchGroupedMovies, fetchMovie, fetchMovies } from "@/apis/movies.api";
import { GroupedMoviesQueryParams, MoviesQueryParams } from "@/lib/types";

export function useMovies(params: MoviesQueryParams = {}) {
  return useQuery({
    queryKey: ["movies", params],
    queryFn: () => fetchMovies(params),
  });
}

export function useInfiniteMovies(
  params: Omit<MoviesQueryParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: ["movies", "infinite", params],
    queryFn: ({ pageParam }) => fetchMovies({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

export function useGroupedMovies(params: GroupedMoviesQueryParams = {}) {
  return useQuery({
    queryKey: ["movies", "grouped-by-genre", params],
    queryFn: () => fetchGroupedMovies(params),
  });
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: ["movies", id],
    queryFn: () => fetchMovie(id),
    enabled: Boolean(id),
  });
}
