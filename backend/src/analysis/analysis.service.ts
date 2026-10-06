import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleMapsService } from "../google-maps/google-maps.service";
import { CompetitorsService } from "../competitors/competitors.service";
import { ScoringService } from "./services/scoring.service";
import { DemographicService } from "./services/demographic.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private maps: GoogleMapsService,
    private competitors: CompetitorsService,
    private scoring: ScoringService,
    private demographic: DemographicService,
  ) {}

  async create(dto: CreateAnalysisDto, userId: string) {
    const weights = dto.weights ?? {
      footTraffic: 35,
      competition: 25,
      demographics: 25,
      accessibility: 15,
    };

    const compResult = await this.competitors.search({
      coordinates: dto.coordinates,
      radiusMeters: dto.radiusMeters,
      businessType: dto.businessType,
    });
    const competitors = compResult.competitors;

    const demo = this.demographic.profile(dto.coordinates.lat, dto.coordinates.lng);

    const areaKm2 = Math.PI * Math.pow(dto.radiusMeters / 1000, 2);
    const footPeak = Math.max(
      500,
      Math.round(demo.populationDensity * areaKm2 * 0.15 * (1 + Math.min(0.5, competitors.length * 0.05))),
    );
    const footAvg = Math.round(footPeak * 0.78);

    const transit = Math.max(
      2,
      Math.abs(this.hashCode(`${dto.coordinates.lat.toFixed(3)},${dto.coordinates.lng.toFixed(3)}`)) % 10,
    );

    const { overall, verdict, metrics } = this.scoring.calculate({
      businessType: dto.businessType,
      weights,
      competitors,
      populationDensity: demo.populationDensity,
      medianAge: demo.medianAge,
      medianIncome: demo.medianIncomeUsd,
      transitStations: transit,
      footTrafficPeak: footPeak,
    });

    let addressData: any = null;
    try {
      const geo = await this.maps.reverseGeocode(dto.coordinates.lat, dto.coordinates.lng);
      const r = geo.results?.[0];
      if (r) {
        addressData = {
          formatted: r.formatted_address,
          city: this.component(r.address_components, "locality"),
          country: this.component(r.address_components, "country"),
        };
      }
    } catch {}

    const saved = await this.prisma.analysis.create({
      data: {
        userId,
        label: dto.label ?? null,
        latitude: dto.coordinates.lat,
        longitude: dto.coordinates.lng,
        businessType: dto.businessType,
        radiusMeters: dto.radiusMeters,
        overallScore: overall,
        verdict,
        weights: weights as any,
        metrics: metrics as any,
        competitors: competitors as any,
        address: addressData as any,
      },
    });

    return {
      id: saved.id,
      label: saved.label,
      coordinates: dto.coordinates,
      address: addressData,
      businessType: dto.businessType,
      radiusMeters: dto.radiusMeters,
      weights,
      overallScore: overall,
      verdict,
      metrics,
      competitors,
      footTrafficPeak: footPeak,
      footTrafficAverage: footAvg,
      createdAt: saved.createdAt,
    };
  }

  async list(userId: string, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      this.prisma.analysis.count({ where: { userId } }),
    ]);

    return {
      items: items.map((i) => ({
        id: i.id,
        label: i.label,
        coordinates: { lat: i.latitude, lng: i.longitude },
        businessType: i.businessType,
        overallScore: i.overallScore,
        verdict: i.verdict,
        createdAt: i.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  async remove(id: string, userId: string) {
    await this.prisma.analysis.deleteMany({ where: { id, userId } });
    return;
  }

  private component(components: any[], type: string): string | null {
    const c = components?.find((x) => x.types?.includes(type));
    return c?.long_name ?? null;
  }

  private hashCode(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }
}
