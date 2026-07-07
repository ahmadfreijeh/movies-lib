"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAccessToken, getAuthUser } from "@/lib/utils";
import { User } from "@/lib/types";

interface AuthContextValue {
  isAuthed: boolean;
  profile: User | null;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthed: false,
  profile: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthContextValue>({
    isAuthed: false,
    profile: null,
  });

  useEffect(() => {
    const sync = () =>
      setValue({
        isAuthed: Boolean(getAccessToken()),
        profile: getAuthUser(),
      });
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
