"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useMovies } from "@/hooks/queries/useMovieQueries";
import { useGenres } from "@/hooks/queries/useGenreQueries";
import {
  useArchiveMovie,
  useDeleteMovie,
  useReactivateMovie,
} from "@/hooks/mutations/useMovieMutations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DataTable } from "@/components/widgets/DataTable";
import { ConfirmDialog } from "@/components/widgets/ConfirmDialog";
import { GenreMultiSelect } from "@/components/widgets/GenreMultiSelect";
import { RowActionsMenu } from "@/components/widgets/RowActionsMenu";
import { Movie } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const columns: ColumnDef<Movie>[] = [
  {
    id: "cover",
    header: "Cover",
    cell: ({ row }) => {
      const cover = row.original.media.find((m) => m.type === "COVER");
      return cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={row.original.title}
          className="h-16 w-11 rounded object-cover"
        />
      ) : (
        <div className="h-16 w-11 rounded bg-muted" />
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (row.original.type === "SERIES" ? "Series" : "Movie"),
  },
  {
    id: "genres",
    header: "Genres",
    cell: ({ row }) =>
      row.original.genres.length
        ? row.original.genres.map((g) => g.name).join(", ")
        : "—",
  },
  {
    accessorKey: "releaseYear",
    header: "Year",
    cell: ({ row }) => row.original.releaseYear ?? "—",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) =>
      row.original.rating !== null ? (
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current" />
          {row.original.rating.toFixed(1)}
        </span>
      ) : (
        "—"
      ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.archivedAt ? (
        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Archived
        </span>
      ) : (
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Active
        </span>
      ),
  },
];

const STATUS_OPTIONS: { value: "active" | "archived" | "all"; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

export default function MoviesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived" | "all">("active");
  const [page, setPage] = useState(1);
  const [pendingMovie, setPendingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  const debouncedSearch = useDebouncedValue(search, 1000);

  const { data: genresData } = useGenres();
  const genreOptions = genresData?.map((g) => g.name) ?? [];

  const { data, isLoading } = useMovies({
    search: debouncedSearch || undefined,
    genres: genres.length ? genres : undefined,
    status,
    page,
  });

  const archiveMovie = useArchiveMovie();
  const reactivateMovie = useReactivateMovie();
  const deleteMovie = useDeleteMovie();

  const isArchiving = pendingMovie ? !pendingMovie.archivedAt : false;
  const isPending = archiveMovie.isPending || reactivateMovie.isPending;

  const handleConfirm = async () => {
    if (!pendingMovie) return;
    try {
      if (isArchiving) {
        await archiveMovie.mutateAsync(pendingMovie.id);
        toast.success("Movie archived");
      } else {
        await reactivateMovie.mutateAsync(pendingMovie.id);
        toast.success("Movie reactivated");
      }
      setPendingMovie(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isArchiving ? "Failed to archive movie" : "Failed to reactivate movie",
        ),
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;
    try {
      await deleteMovie.mutateAsync(movieToDelete.id);
      toast.success("Movie deleted");
      setMovieToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete movie"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Movies</h1>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage="No movies found."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search movies..."
        createHref="/movies/create"
        createLabel="Create Movie"
        filters={
          <>
            <GenreMultiSelect
              options={genreOptions}
              selected={genres}
              onChange={(value) => {
                setGenres(value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as "active" | "archived" | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        page={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        getRowHref={(movie) => `/movies/${movie.id}`}
        renderRowActions={(movie) => (
          <RowActionsMenu
            archiveLabel={movie.archivedAt ? "Reactivate" : "Archive"}
            onEdit={() => router.push(`/movies/${movie.id}/edit`)}
            onArchive={() => setPendingMovie(movie)}
            onDelete={() => setMovieToDelete(movie)}
          />
        )}
      />

      <ConfirmDialog
        open={pendingMovie !== null}
        onOpenChange={(open) => !open && setPendingMovie(null)}
        title={isArchiving ? "Archive movie?" : "Reactivate movie?"}
        description={
          pendingMovie &&
          (isArchiving
            ? `"${pendingMovie.title}" will be archived and hidden from the active list. You can reactivate it later.`
            : `"${pendingMovie.title}" will be restored to the active list.`)
        }
        confirmLabel={isArchiving ? "Archive" : "Reactivate"}
        confirmVariant={isArchiving ? "destructive" : "default"}
        isLoading={isPending}
        onConfirm={handleConfirm}
      />

      <ConfirmDialog
        open={movieToDelete !== null}
        onOpenChange={(open) => !open && setMovieToDelete(null)}
        title="Delete movie?"
        description={
          movieToDelete &&
          `"${movieToDelete.title}" will be permanently deleted. This cannot be undone.`
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        isLoading={deleteMovie.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
