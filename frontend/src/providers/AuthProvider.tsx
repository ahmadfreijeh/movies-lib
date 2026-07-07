"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useProfile } from "@/hooks/queries/useAuthQueries";
import { getAccessToken, getAuthUser, setAuthUser } from "@/lib/utils";
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
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const syncToken = () => setIsAuthed(Boolean(getAccessToken()));
    syncToken();
    window.addEventListener("storage", syncToken);
    window.addEventListener("auth-change", syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("auth-change", syncToken);
    };
  }, []);

  const { data: fetchedProfile } = useProfile(isAuthed);

  useEffect(() => {
    if (fetchedProfile) {
      setAuthUser(fetchedProfile);
    }
  }, [fetchedProfile]);

  const profile = isAuthed ? (fetchedProfile ?? getAuthUser()) : null;

  return (
    <AuthContext.Provider value={{ isAuthed, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
