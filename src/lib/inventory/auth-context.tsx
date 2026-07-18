"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { InventoryUser } from "@/types/inventory";
import { apiFetch, clearToken, setToken } from "./api";

interface AuthContextValue {
  user: InventoryUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function InventoryAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InventoryUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: InventoryUser }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: InventoryUser }>(
      "/api/auth/login",
      { method: "POST", body: { email, password }, auth: false }
    );
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useInventoryAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useInventoryAuth harus dipakai di dalam InventoryAuthProvider");
  }
  return ctx;
}
