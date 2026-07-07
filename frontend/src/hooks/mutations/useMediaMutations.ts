import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attachMediaRequest,
  deleteMediaRequest,
  uploadMediaRequest,
} from "@/apis/media.api";

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useAttachMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, movieId }: { id: string; movieId: string | null }) =>
      attachMediaRequest(id, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
