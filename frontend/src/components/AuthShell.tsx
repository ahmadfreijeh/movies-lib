import { Film } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-xl border shadow-sm md:grid-cols-2">
      <div className="flex flex-col justify-center p-8 md:p-10">{children}</div>
      <div className="hidden flex-col items-center justify-center gap-4 bg-primary p-10 text-primary-foreground md:flex">
        <Film className="h-12 w-12" />
        <div className="text-center">
          <p className="text-xl font-semibold">Movie Library</p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Catalog and manage your favorite movies.
          </p>
        </div>
      </div>
    </div>
  );
}
