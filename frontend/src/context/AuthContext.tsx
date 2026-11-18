import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, storage } from "@/lib/api";
import type { User } from "@/types";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: { fullName?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) { setLoading(false); return; }
    api.auth.me().then(setUser).catch(() => storage.clear()).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.auth.login({ email, password });
    storage.setToken(r.accessToken);
    setUser(r.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const r = await api.auth.register({ email, password, fullName: name });
    storage.setToken(r.accessToken);
    setUser(r.user);
  }, []);

  const updateProfile = useCallback(async (data: {
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const updatedUser = await api.auth.updateProfile(data);
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => { storage.clear(); setUser(null); }, []);

  const value = useMemo(() => ({ user, loading, login, register, updateProfile, logout }),
    [user, loading, login, register, updateProfile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
