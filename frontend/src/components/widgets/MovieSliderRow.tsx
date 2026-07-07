"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "@/apis/movies.api";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MovieCard } from "@/components/MovieCard";
import { MovieCardSkeleton } from "@/components/widgets/MovieCardSkeleton";
import { GenreMovies, Movie } from "@/lib/types";

interface MovieSliderRowProps {
  data: GenreMovies;
  onMovieClick?: (movie: Movie) => void;
}

export function MovieSliderRow({ data, onMovieClick }: MovieSliderRowProps) {
  const { genre, movies: initialMovies } = data;

  const [items, setItems] = useState<Movie[]>(initialMovies.items);
  const [page, setPage] = useState(initialMovies.page);
  const [totalPages, setTotalPages] = useState(initialMovies.totalPages);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  const nextPage = page + 1;
  const canLoadMore = nextPage <= totalPages;

  const { data: nextPageData, isFetching } = useQuery({
    queryKey: ["movies", "by-genre", genre.name, nextPage],
    queryFn: () =>
      fetchMovies({
        genres: [genre.name],
        page: nextPage,
        pageSize: initialMovies.pageSize,
        status: "active",
      }),
    enabled: shouldLoadMore && canLoadMore,
  });

  useEffect(() => {
    if (!nextPageData) return;
    setItems((prev) => [...prev, ...nextPageData.items]);
    setPage(nextPageData.page);
    setTotalPages(nextPageData.totalPages);
    setShouldLoadMore(false);
  }, [nextPageData]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      if (
        canLoadMore &&
        !isFetching &&
        !shouldLoadMore &&
        !api.canScrollNext()
      ) {
        setShouldLoadMore(true);
      }
    };

    api.on("select", handleSelect);
    api.on("settle", handleSelect);
    return () => {
      api.off("select", handleSelect);
      api.off("settle", handleSelect);
    };
  }, [api, canLoadMore, isFetching, shouldLoadMore]);

  if (items.length === 0) return null;

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-lg font-semibold">{genre.name}</h2>
      <Carousel
        opts={{ align: "start", dragFree: true }}
        setApi={setApi}
        className="group min-w-0"
      >
        <CarouselContent>
          {items.map((movie) => (
            <CarouselItem key={movie.id} className="basis-40 sm:basis-48">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </CarouselItem>
          ))}
          {isFetching && shouldLoadMore && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <CarouselItem key={`skeleton-${i}`} className="basis-40 sm:basis-48">
                  <MovieCardSkeleton />
                </CarouselItem>
              ))}
            </>
          )}
        </CarouselContent>
        {items.length > 4 && (
          <>
            <CarouselPrevious className="opacity-0 transition-opacity group-hover:opacity-100" />
            <CarouselNext className="opacity-0 transition-opacity group-hover:opacity-100" />
          </>
        )}
      </Carousel>
    </section>
  );
}
