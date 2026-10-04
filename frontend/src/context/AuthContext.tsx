import {
  createContext, useCallback, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { api, storage } from "@/lib/api";
import type { User } from "@/types";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) { setLoading(false); return; }
    api.auth.me()
      .then(setUser)
      .catch(() => storage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.auth.login({ email, password });
    storage.setToken(r.access_token);
    setUser(r.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const r = await api.auth.register({ email, password, full_name: name });
      storage.setToken(r.access_token);
      setUser(r.user);
    }, []);

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
