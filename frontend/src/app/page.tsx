"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import {
  useGroupedMovies,
  useInfiniteMovies,
} from "@/hooks/queries/useMovieQueries";
import { useGenres } from "@/hooks/queries/useGenreQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { MovieCard } from "@/components/MovieCard";
import { MovieSliderRow } from "@/components/widgets/MovieSliderRow";
import { MovieSliderRowSkeleton } from "@/components/widgets/MovieSliderRowSkeleton";
import { MovieCardSkeleton } from "@/components/widgets/MovieCardSkeleton";
import { MovieDetailsDrawer } from "@/components/widgets/MovieDetailsDrawer";
import {
  MovieFilterPanel,
  MovieSortBy,
  MovieSortOrder,
} from "@/components/widgets/MovieFilterPanel";
import { ACCESS_TOKEN_KEY } from "@/lib/utils";
import { Movie } from "@/lib/types";

export default function PublicHomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<MovieSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<MovieSortOrder>("desc");
  const [releaseYearFrom, setReleaseYearFrom] = useState<number | undefined>(
    undefined,
  );
  const [releaseYearTo, setReleaseYearTo] = useState<number | undefined>(
    undefined,
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)));
  }, []);

  const debouncedSearch = useDebouncedValue(search, 500);
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    genres.length > 0 ||
    releaseYearFrom !== undefined ||
    releaseYearTo !== undefined;

  const { data: genresData } = useGenres();
  const genreOptions = useMemo(
    () => genresData?.map((g) => g.name) ?? [],
    [genresData],
  );

  const { data: groupedData, isLoading: isGroupedLoading } = useGroupedMovies({
    status: "active",
    pageSize: 10,
  });
  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMovies({
    status: "active",
    search: debouncedSearch || undefined,
    genres: genres.length ? genres : undefined,
    sortBy,
    sortOrder,
    releaseYearFrom,
    releaseYearTo,
    pageSize: 24,
  });

  const filteredMovies = useMemo(
    () => filteredData?.pages.flatMap((page) => page.items) ?? [],
    [filteredData],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const resetFilters = () => {
    setGenres([]);
    setReleaseYearFrom(undefined);
    setReleaseYearTo(undefined);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Film className="h-5 w-5" />
            Movie Library
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {isAuthenticated ? (
              <Link href="/dashboard" className="hover:text-primary/80">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary/80">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-primary/80">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6">
            <MovieFilterPanel
              genreOptions={genreOptions}
              selectedGenres={genres}
              onGenresChange={(value) => setGenres(value)}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(nextSortBy, nextSortOrder) => {
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
              }}
              releaseYearFrom={releaseYearFrom}
              releaseYearTo={releaseYearTo}
              onReleaseYearChange={(from, to) => {
                setReleaseYearFrom(from);
                setReleaseYearTo(to);
              }}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Input
            placeholder="Search movies and series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          {hasActiveFilters ? (
            <div className="flex flex-col gap-4">
              {isFilteredLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredMovies.length ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredMovies.map((movie: Movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={(m) => setSelectedMovieId(m.id)}
                      />
                    ))}
                    {isFetchingNextPage &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <MovieCardSkeleton key={`skeleton-${i}`} />
                      ))}
                  </div>
                  <div ref={loadMoreRef} className="h-1" />
                </>
              ) : (
                <p className="text-muted-foreground">No movies found.</p>
              )}
            </div>
          ) : isGroupedLoading ? (
            <div className="flex flex-col gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <MovieSliderRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {groupedData?.map((genreMovies) => (
                <MovieSliderRow
                  key={genreMovies.genre.id}
                  data={genreMovies}
                  onMovieClick={(m) => setSelectedMovieId(m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <MovieDetailsDrawer
        movieId={selectedMovieId}
        onOpenChange={(open) => !open && setSelectedMovieId(null)}
      />
    </div>
  );
}
