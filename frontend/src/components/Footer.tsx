export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Movie Library. All rights reserved.
      </div>
    </footer>
  );
}
