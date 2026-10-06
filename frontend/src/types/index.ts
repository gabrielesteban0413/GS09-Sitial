export interface Coordinates { lat: number; lng: number; }
export interface Address { formatted: string; city?: string | null; country?: string | null; }
export type BusinessType = "cafe" | "restaurant" | "bakery" | "pharmacy" | "gym" | "supermarket";
export type ThreatLevel = "high" | "medium" | "low";
export type Verdict = "optimal" | "review" | "discard";
export interface Competitor {
  placeId: string; name: string; category: string;
  coordinates: Coordinates; distanceMeters: number;
  rating: number | null; reviewCount: number; threatLevel: ThreatLevel;
}
export interface ScoreWeights {
  footTraffic: number; competition: number; demographics: number; accessibility: number;
}
export interface MetricScore { name: string; value: number; description: string; }
export interface AnalysisResult {
  id: string; label: string | null; coordinates: Coordinates;
  address: Address | null; businessType: BusinessType; radiusMeters: number;
  weights: ScoreWeights; overallScore: number; verdict: Verdict;
  metrics: MetricScore[]; competitors: Competitor[];
  footTrafficPeak: number; footTrafficAverage: number; createdAt: string;
}
export interface AnalysisSummary {
  id: string; label: string | null; coordinates: Coordinates;
  businessType: BusinessType; overallScore: number;
  verdict: Verdict; createdAt: string;
}
export interface User {
  id: string; email: string; fullName: string;
  isActive: boolean; createdAt: string;
}
export interface TokenResponse {
  accessToken: string; tokenType: string; expiresIn: number; user: User;
}
