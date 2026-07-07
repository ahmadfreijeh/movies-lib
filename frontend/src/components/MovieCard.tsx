import Link from "next/link";
import { Film, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const cover = movie.media.find((m) => m.type === "COVER");

  const content = (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={movie.title}
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted">
          <Film className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <CardHeader>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {movie.type === "SERIES" ? "Series" : "Movie"}
        </span>
        <CardTitle className="line-clamp-1 text-lg">{movie.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {movie.description ?? "No description available."}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{movie.releaseYear ?? "Unknown year"}</span>
        {movie.rating !== null && (
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            {movie.rating.toFixed(1)}
          </span>
        )}
      </CardFooter>
    </Card>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(movie)}
        className="block h-full w-full text-left"
      >
        {content}
      </button>
    );
  }

  return <Link href={`/movies/${movie.id}`}>{content}</Link>;
}
