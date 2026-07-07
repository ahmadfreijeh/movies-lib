"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MovieStatusFilter = "active" | "archived" | "all";
export type MovieSortBy = "title" | "releaseYear" | "rating" | "createdAt";
export type MovieSortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: MovieSortBy; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "releaseYear", label: "Release year" },
  { value: "rating", label: "Rating" },
  { value: "createdAt", label: "Date added" },
];

const STATUS_OPTIONS: { value: MovieStatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 1900;
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - EARLIEST_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
);

interface MovieFilterPanelProps {
  genreOptions: string[];
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;

  sortBy?: MovieSortBy;
  sortOrder?: MovieSortOrder;
  onSortChange?: (sortBy: MovieSortBy, sortOrder: MovieSortOrder) => void;

  status?: MovieStatusFilter;
  onStatusChange?: (status: MovieStatusFilter) => void;

  releaseYearFrom?: number;
  releaseYearTo?: number;
  onReleaseYearChange?: (from: number | undefined, to: number | undefined) => void;

  onReset?: () => void;
  className?: string;
}

export function MovieFilterPanel({
  genreOptions,
  selectedGenres,
  onGenresChange,
  sortBy,
  sortOrder,
  onSortChange,
  status,
  onStatusChange,
  releaseYearFrom,
  releaseYearTo,
  onReleaseYearChange,
  onReset,
  className,
}: MovieFilterPanelProps) {
  const toggleGenre = (genre: string) => {
    onGenresChange(
      selectedGenres.includes(genre)
        ? selectedGenres.filter((g) => g !== genre)
        : [...selectedGenres, genre],
    );
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    (status !== undefined && status !== "active") ||
    releaseYearFrom !== undefined ||
    releaseYearTo !== undefined;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={onReset}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {onStatusChange && status !== undefined && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Status
            </span>
            <Select
              value={status}
              onValueChange={(value) => onStatusChange(value as MovieStatusFilter)}
            >
              <SelectTrigger>
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
          </div>
        </>
      )}

      {onSortChange && sortBy && sortOrder && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Sort by
            </span>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => onSortChange(value as MovieSortBy, sortOrder)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortOrder}
                onValueChange={(value) => onSortChange(sortBy, value as MovieSortOrder)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {onReleaseYearChange && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Release year
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={releaseYearFrom ? String(releaseYearFrom) : "any"}
                onValueChange={(value) =>
                  onReleaseYearChange(
                    value === "any" ? undefined : Number(value),
                    releaseYearTo,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="any">From</SelectItem>
                  {YEAR_OPTIONS.filter(
                    (year) => !releaseYearTo || year <= releaseYearTo,
                  ).map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">–</span>
              <Select
                value={releaseYearTo ? String(releaseYearTo) : "any"}
                onValueChange={(value) =>
                  onReleaseYearChange(
                    releaseYearFrom,
                    value === "any" ? undefined : Number(value),
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="any">To</SelectItem>
                  {YEAR_OPTIONS.filter(
                    (year) => !releaseYearFrom || year >= releaseYearFrom,
                  ).map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <Separator className="my-4" />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Genres
        </span>
        <div className="flex flex-col gap-1.5">
          {genreOptions.map((genre) => (
            <label
              key={genre}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              {genre}
            </label>
          ))}
          {genreOptions.length === 0 && (
            <span className="text-sm text-muted-foreground">No genres yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
