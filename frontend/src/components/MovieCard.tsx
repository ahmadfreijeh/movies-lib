import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Movie } from "@/lib/types";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
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
    </Link>
  );
}
