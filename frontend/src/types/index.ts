export interface Coordinates { lat: number; lng: number; }

export interface Address {
  formatted: string;
  street?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

export type BusinessType =
  | "cafe" | "restaurant" | "bakery"
  | "pharmacy" | "gym" | "supermarket";

export type ThreatLevel = "high" | "medium" | "low";
export type Verdict = "optimal" | "review" | "discard";

export interface Competitor {
  place_id: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  distance_meters: number;
  rating: number | null;
  review_count: number;
  threat_level: ThreatLevel;
}

export interface ScoreWeights {
  foot_traffic: number;
  competition: number;
  demographics: number;
  accessibility: number;
}

export interface MetricScore { name: string; value: number; description: string; }

export interface AnalysisResult {
  id: string;
  label: string | null;
  coordinates: Coordinates;
  address: Address | null;
  business_type: BusinessType;
  radius_meters: number;
  weights: ScoreWeights;
  overall_score: number;
  verdict: Verdict;
  metrics: MetricScore[];
  competitors: Competitor[];
  foot_traffic_peak: number;
  foot_traffic_average: number;
  created_at: string;
}

export interface AnalysisSummary {
  id: string;
  label: string | null;
  coordinates: Coordinates;
  business_type: BusinessType;
  overall_score: number;
  verdict: Verdict;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
