import { useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY } from "@/lib/api";

export function useAuthStatus(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sync = () =>
      setIsAuthenticated(Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
  }, []);

  return isAuthenticated;
}
