"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film } from "lucide-react";
import { ACCESS_TOKEN_KEY } from "@/lib/api";
import { Footer } from "@/components/Footer";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Film className="h-5 w-5" />
            Movie Library
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-primary/80">
              Login
            </Link>
            <Link href="/signup" className="hover:text-primary/80">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>
      <main className="container flex-1 py-4">{children}</main>
      <Footer />
    </div>
  );
}
