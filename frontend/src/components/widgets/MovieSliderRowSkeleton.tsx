import { Skeleton } from "@/components/ui/skeleton";
import { MovieCardSkeleton } from "@/components/widgets/MovieCardSkeleton";

export function MovieSliderRowSkeleton() {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-40 shrink-0 sm:w-48">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
