import type {
  AnalysisResult, AnalysisSummary, PaginatedResponse,
  TokenResponse, User, Coordinates, BusinessType, ScoreWeights,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1";
const TOKEN_KEY = "sitial.token";

export class ApiError extends Error {
  constructor(public status: number, public code: string,
              message: string, public details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
  }
}

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = storage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      storage.clear();
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    throw new ApiError(
      response.status,
      payload?.error_code ?? "unknown",
      payload?.message ?? `HTTP ${response.status}`,
      payload?.details ?? {},
    );
  }

  return payload as T;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string }) =>
      request<TokenResponse>("/auth/register", { method: "POST", body: data, auth: false }),
    login: (data: { email: string; password: string }) =>
      request<TokenResponse>("/auth/login", { method: "POST", body: data, auth: false }),
    me: () => request<User>("/auth/me"),
  },
  analysis: {
    create: (data: {
      coordinates: Coordinates;
      business_type: BusinessType;
      radius_meters: number;
      weights: ScoreWeights;
      label?: string | null;
    }) => request<AnalysisResult>("/analysis", { method: "POST", body: data }),
    list: (page = 1, pageSize = 20) =>
      request<PaginatedResponse<AnalysisSummary>>(
        `/analysis?page=${page}&page_size=${pageSize}`,
      ),
    remove: (id: string) =>
      request<void>(`/analysis/${id}`, { method: "DELETE" }),
  },
};
