import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to Movie Library</h1>
      <p className="max-w-xl text-muted-foreground">
        Discover, catalog, and manage your favorite movies all in one place.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/movies">Browse Movies</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/movies/create">Add a Movie</Link>
        </Button>
      </div>
    </div>
  );
}
