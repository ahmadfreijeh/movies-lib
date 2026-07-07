"use client";

import { Film, Star } from "lucide-react";
import { useMovie } from "@/hooks/queries/useMovieQueries";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieDetailsDrawerProps {
  movieId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsDrawer({ movieId, onOpenChange }: MovieDetailsDrawerProps) {
  const { data: movie, isLoading } = useMovie(movieId ?? "");
  const cover = movie?.media.find((m) => m.type === "COVER");

  return (
    <Sheet open={movieId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="sr-only">Movie details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-[2/3] w-full max-w-[220px]" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : movie ? (
          <div className="flex flex-col gap-4">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt={movie.title}
                className="aspect-[2/3] w-full max-w-[220px] rounded object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full max-w-[220px] items-center justify-center rounded bg-muted">
                <Film className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            <div>
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {movie.type === "SERIES" ? "Series" : "Movie"}
              </span>
              <h2 className="text-2xl font-bold">{movie.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {movie.releaseYear ?? "Unknown year"}
                {movie.genres.length
                  ? ` · ${movie.genres.map((g) => g.name).join(", ")}`
                  : ""}
              </p>
            </div>

            <p className="text-sm">{movie.description ?? "No description available."}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {movie.director && <span>Director: {movie.director}</span>}
              {movie.rating !== null && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-destructive">Movie not found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
