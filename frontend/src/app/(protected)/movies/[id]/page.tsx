"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useMovie } from "@/hooks/queries/useMovieQueries";
import {
  useArchiveMovie,
  useReactivateMovie,
} from "@/hooks/mutations/useMovieMutations";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/widgets/ConfirmDialog";
import { getErrorMessage } from "@/lib/utils";

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: movie, isLoading, isError } = useMovie(params.id);
  const archiveMovie = useArchiveMovie();
  const reactivateMovie = useReactivateMovie();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading movie...</p>;
  }

  if (isError || !movie) {
    return <p className="text-destructive">Movie not found.</p>;
  }

  const isArchived = Boolean(movie.archivedAt);
  const cover = movie.media.find((m) => m.type === "COVER");

  const handleConfirm = async () => {
    try {
      if (isArchived) {
        await reactivateMovie.mutateAsync(movie.id);
        toast.success("Movie reactivated");
      } else {
        await archiveMovie.mutateAsync(movie.id);
        toast.success("Movie archived");
      }
      setConfirmOpen(false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isArchived ? "Failed to reactivate movie" : "Failed to archive movie",
        ),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex gap-6">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={movie.title}
            className="h-48 w-32 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-48 w-32 shrink-0 rounded bg-muted" />
        )}
        <div>
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {movie.type === "SERIES" ? "Series" : "Movie"}
          </span>
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {movie.releaseYear ?? "Unknown year"} &middot;{" "}
            {movie.genres.length ? movie.genres.map((g) => g.name).join(", ") : "Unknown genre"}
          </p>
        </div>
      </div>
      <p>{movie.description ?? "No description available."}</p>
      <div className="flex gap-4 text-sm text-muted-foreground">
        {movie.director && <span>Director: {movie.director}</span>}
        {movie.rating !== null && <span>Rating: {movie.rating.toFixed(1)}</span>}
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href={`/movies/${movie.id}/edit`}>Edit Movie</Link>
        </Button>
        <Button
          variant={isArchived ? "default" : "destructive"}
          onClick={() => setConfirmOpen(true)}
        >
          {isArchived ? "Reactivate Movie" : "Archive Movie"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isArchived ? "Reactivate movie?" : "Archive movie?"}
        description={
          isArchived
            ? `"${movie.title}" will be restored to the active list.`
            : `"${movie.title}" will be archived and hidden from the active list. You can reactivate it later.`
        }
        confirmLabel={isArchived ? "Reactivate" : "Archive"}
        confirmVariant={isArchived ? "default" : "destructive"}
        isLoading={archiveMovie.isPending || reactivateMovie.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
