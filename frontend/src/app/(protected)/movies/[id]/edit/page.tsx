"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMovie } from "@/hooks/queries/useMovieQueries";
import { useUpdateMovie } from "@/hooks/mutations/useMovieMutations";
import { useGenres } from "@/hooks/queries/useGenreQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenreMultiSelect } from "@/components/widgets/GenreMultiSelect";
import { MediaManager, MediaManagerValue } from "@/components/widgets/MediaManager";
import { YearPicker } from "@/components/widgets/YearPicker";
import { FieldError } from "@/components/ui/field-error";
import { MovieType } from "@/lib/types";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

export default function EditMoviePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: movie, isLoading, isError } = useMovie(params.id);
  const updateMovie = useUpdateMovie(params.id);
  const { data: genresData } = useGenres();
  const genreOptions = genresData?.map((g) => g.name) ?? [];

  const [title, setTitle] = useState("");
  const [type, setType] = useState<MovieType>("MOVIE");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [director, setDirector] = useState("");
  const [rating, setRating] = useState("");
  const [media, setMedia] = useState<MediaManagerValue>({
    existingMedia: [],
    newMedia: [],
    removedMediaIds: [],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!movie) return;
    setTitle(movie.title);
    setType(movie.type);
    setDescription(movie.description ?? "");
    setReleaseYear(movie.releaseYear?.toString() ?? "");
    setGenres(movie.genres.map((g) => g.name));
    setDirector(movie.director ?? "");
    setRating(movie.rating?.toString() ?? "");
    setMedia({ existingMedia: movie.media, newMedia: [], removedMediaIds: [] });
  }, [movie]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await updateMovie.mutateAsync({
        title,
        type,
        description,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        genres,
        director,
        rating: rating ? Number(rating) : undefined,
        newMedia: media.newMedia.length ? media.newMedia : undefined,
        existingMediaIds: media.existingMedia.map((m) => m.id),
        removedMediaIds: media.removedMediaIds.length
          ? media.removedMediaIds
          : undefined,
      });
      toast.success("Movie updated");
      router.push(`/movies/${params.id}`);
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to update movie"));
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading movie...</p>;
  }

  if (isError || !movie) {
    return <p className="text-destructive">Movie not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-bold">Edit Movie</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FieldError message={fieldErrors.title} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as MovieType)}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="MOVIE">Movie</option>
            <option value="SERIES">Series</option>
          </select>
          <FieldError message={fieldErrors.type} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <FieldError message={fieldErrors.description} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="releaseYear">Release Year</Label>
          <YearPicker id="releaseYear" value={releaseYear} onChange={setReleaseYear} />
          <FieldError message={fieldErrors.releaseYear} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Genres</Label>
          <GenreMultiSelect options={genreOptions} selected={genres} onChange={setGenres} />
          <FieldError message={fieldErrors.genres} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="director">Director</Label>
          <Input id="director" value={director} onChange={(e) => setDirector(e.target.value)} />
          <FieldError message={fieldErrors.director} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rating">Rating</Label>
          <Input id="rating" type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
          <FieldError message={fieldErrors.rating} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Media</Label>
          <MediaManager value={media} onChange={setMedia} />
          <FieldError message={fieldErrors.media} />
        </div>
        <Button type="submit" disabled={updateMovie.isPending}>
          {updateMovie.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
