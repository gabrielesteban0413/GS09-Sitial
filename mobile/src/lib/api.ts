import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { BusinessType } from "../theme";

const TOKEN_KEY = "sitial.access-token";
const developmentHost = Constants.expoConfig?.hostUri?.split(":")[0];
const LOCAL_API_URL = developmentHost
  ? `http://${developmentHost}:8000/api/v1`
  : Platform.select({
      android: "http://10.0.2.2:8000/api/v1",
      default: "http://localhost:8000/api/v1",
    });
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? LOCAL_API_URL ?? "").replace(/\/$/, "");

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Competitor {
  placeId: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  distanceMeters: number;
  rating: number | null;
  reviewCount: number;
  threatLevel: "high" | "medium" | "low";
}

export interface MetricScore {
  name: string;
  value: number | null;
  description: string;
}

export interface AnalysisResult {
  id: string;
  label: string | null;
  coordinates: Coordinates;
  address: { formatted: string } | null;
  businessType: BusinessType;
  radiusMeters: number;
  overallScore: number | null;
  verdict: "optimal" | "review" | "discard" | null;
  metrics: MetricScore[];
  competitors: Competitor[];
  footTrafficPeak: number | null;
  footTrafficAverage: number | null;
  createdAt: string;
}

export interface AnalysisHistoryItem {
  id: string;
  label: string | null;
  latitude: number;
  longitude: number;
  businessType: BusinessType;
  overallScore: number | null;
  createdAt: string;
}

export type LayerCategory =
  | "restaurante"
  | "cafeteria"
  | "panaderia"
  | "bar"
  | "gimnasio"
  | "farmacia"
  | "supermercado"
  | "tienda"
  | "oficina"
  | "otro";

export interface LocationPin {
  id: string;
  layerId: string;
  name: string;
  address: string | null;
  category: LayerCategory;
  notes: string | null;
  latitude: number;
  longitude: number;
}

export interface LocationLayer {
  id: string;
  name: string;
  description: string | null;
  color: string;
  _count: { locations: number };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? ` (${cause.message})` : "";
    throw new Error(
      `No se pudo conectar con la API en ${API_URL}. Comprueba que el backend esté activo, que el celular y el computador estén en la misma red Wi-Fi y que el firewall permita el puerto 8000.${reason}`,
    );
  }
  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as { message?: unknown; error_code?: string } | null;
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : typeof error?.message === "string"
        ? error.message
        : `La solicitud falló (HTTP ${response.status}).`;
    throw new ApiError(response.status, error?.error_code ?? "unknown", message);
  }
  return payload as T;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; fullName: string }) =>
      request<TokenResponse>("/auth/register", { method: "POST", body: data, auth: false }),
    login: (data: { email: string; password: string }) =>
      request<TokenResponse>("/auth/login", { method: "POST", body: data, auth: false }),
    me: () => request<User>("/auth/me"),
    updateProfile: (data: {
      fullName?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => request<User>("/auth/me", { method: "PATCH", body: data }),
  },
  analysis: {
    create: (data: {
      coordinates: Coordinates;
      businessType: BusinessType;
      radiusMeters: number;
      weights: { footTraffic: number; competition: number; demographics: number; accessibility: number };
      label?: string;
    }) => request<AnalysisResult>("/analysis", { method: "POST", body: data }),
    list: () => request<AnalysisHistoryItem[]>("/analysis"),
  },
  layers: {
    list: () => request<LocationLayer[]>("/layers"),
    create: (data: { name: string; description?: string; color: string }) =>
      request<LocationLayer>("/layers", { method: "POST", body: data }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/layers/${id}`, { method: "DELETE" }),
    locations: (layerId: string) => request<LocationPin[]>(`/layers/${layerId}/locations`),
    addLocation: (layerId: string, data: {
      name: string;
      address?: string;
      category: LayerCategory;
      latitude: number;
      longitude: number;
    }) => request<LocationPin>(`/layers/${layerId}/locations`, { method: "POST", body: data }),
    removeLocation: (id: string) =>
      request<{ success: boolean }>(`/locations/${id}`, { method: "DELETE" }),
  },
  places: {
    geocode: (address: string) =>
      request<{ coordinates: Coordinates; formattedAddress: string }>(
        `/places/geocode?address=${encodeURIComponent(address)}`,
      ),
  },
};
