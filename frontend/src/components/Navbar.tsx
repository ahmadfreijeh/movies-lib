"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLogout } from "@/hooks/mutations/useAuthMutations";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const isAuthenticated = useAuthStatus();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Film className="h-5 w-5" />
          Movie Library
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/movies" className="hover:text-primary/80">
            Movies
          </Link>
          {isAuthenticated && (
            <Link href="/movies/create" className="hover:text-primary/80">
              Add Movie
            </Link>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
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
  );
}
