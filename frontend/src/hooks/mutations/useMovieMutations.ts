import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveMovieRequest,
  createMovieRequest,
  deleteMovieRequest,
  reactivateMovieRequest,
  updateMovieRequest,
} from "@/apis/movies.api";
import { UpdateMoviePayload } from "@/lib/types";

export function useCreateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMovieRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useUpdateMovie(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMoviePayload) =>
      updateMovieRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["movies", id] });
    },
  });
}

export function useArchiveMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveMovieRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useReactivateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateMovieRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMovieRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
