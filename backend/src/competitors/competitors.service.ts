import { Injectable } from "@nestjs/common";
import { GoogleMapsService } from "../google-maps/google-maps.service";
import { SearchCompetitorsDto } from "./dto/search-competitors.dto";

type ThreatLevel = "high" | "medium" | "low";

@Injectable()
export class CompetitorsService {
  constructor(private maps: GoogleMapsService) {}

  async search(dto: SearchCompetitorsDto) {
    const data = await this.maps.nearbySearch(
      dto.coordinates.lat,
      dto.coordinates.lng,
      dto.radiusMeters,
      dto.businessType,
    );

    const results = data.places ?? [];
    const competitors = results.map((item: any) => this.build(item, dto));
    competitors.sort((a: any, b: any) => a.distanceMeters - b.distanceMeters);

    return {
      center: dto.coordinates,
      radiusMeters: dto.radiusMeters,
      total: competitors.length,
      competitors,
    };
  }

  private build(item: any, dto: SearchCompetitorsDto) {
    const loc = item.location;
    const distance = Math.round(
      this.haversine(dto.coordinates.lat, dto.coordinates.lng, loc.latitude, loc.longitude),
    );
    const rating = item.rating ?? null;
    const reviews = item.userRatingCount ?? 0;
    const name = item.displayName?.text ?? "Sin nombre";

    return {
      placeId: item.id,
      name,
      category: item.types?.[0] ?? "unknown",
      coordinates: { lat: loc.latitude, lng: loc.longitude },
      distanceMeters: distance,
      rating,
      reviewCount: reviews,
      threatLevel: this.threat(rating, reviews, distance),
    };
  }

  private threat(rating: number | null, reviews: number, distance: number): ThreatLevel {
    if (rating === null) return "low";
    const prox = Math.max(0, 1 - distance / 1000);
    const rat = Math.max(0, (rating - 3) / 2);
    const rev = Math.min(1, Math.log1p(reviews) / Math.log1p(5000));
    const score = 0.45 * prox + 0.3 * rat + 0.25 * rev;
    if (score >= 0.6) return "high";
    if (score >= 0.35) return "medium";
    return "low";
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}