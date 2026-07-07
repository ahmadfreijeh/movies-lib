import type { Metadata } from "next";
import { Providers } from "@/providers/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Movie Library",
  description: "Browse, add, and manage your favorite movies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
