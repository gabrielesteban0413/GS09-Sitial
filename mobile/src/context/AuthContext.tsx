import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { ApiError, api, clearToken, getToken, saveToken, type User } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  sessionError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  updateUser: (data: {
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      try {
        const token = await getToken();
        if (token) {
          const currentUser = await api.auth.me();
          if (mounted) setUser(currentUser);
        }
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          await clearToken();
        } else if (mounted) {
          setSessionError(cause instanceof Error ? cause.message : "No se pudo recuperar la sesión.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const acceptSession = useCallback(async (response: { accessToken: string; user: User }) => {
    await saveToken(response.accessToken);
    setSessionError(null);
    setUser(response.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await acceptSession(await api.auth.login({ email, password }));
  }, [acceptSession]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    await acceptSession(await api.auth.register({ email, password, fullName }));
  }, [acceptSession]);

  const updateUser = useCallback(async (data: {
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    setUser(await api.auth.updateProfile(data));
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    setSessionError(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, sessionError, login, register, updateUser, logout }),
    [user, isLoading, sessionError, login, register, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return value;
}
