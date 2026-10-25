import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompetitorsService } from '../competitors/competitors.service';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { ScoringService } from './services/scoring.service';

const DEFAULT_WEIGHTS = {
  footTraffic: 35,
  competition: 25,
  demographics: 25,
  accessibility: 15,
};

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly competitorsService: CompetitorsService,
    private readonly googleMaps: GoogleMapsService,
    private readonly scoringService: ScoringService,
  ) {}

  async create(userId: string, dto: CreateAnalysisDto) {
    const location = await this.googleMaps.validateLandCoordinates(
      dto.coordinates.lat,
      dto.coordinates.lng,
    );
    const competitorSearch = await this.competitorsService.search({
      coordinates: dto.coordinates,
      radiusMeters: dto.radiusMeters,
      businessType: dto.businessType,
    });
    const scoring = this.scoringService.calculate(competitorSearch.competitors);

    const saved = await this.prisma.analysis.create({
      data: {
        userId,
        label: dto.label,
        latitude: dto.coordinates.lat,
        longitude: dto.coordinates.lng,
        businessType: dto.businessType,
        radiusMeters: dto.radiusMeters,
        overallScore: null,
        verdict: null,
        weights: { ...(dto.weights ?? DEFAULT_WEIGHTS) },
        metrics: scoring.metrics,
        footTrafficPeak: null,
        footTrafficAvg: null,
        competitors: {
          create: competitorSearch.competitors.map((competitor) => ({
            placeId: competitor.placeId,
            name: competitor.name,
            category: competitor.category,
            latitude: competitor.coordinates.lat,
            longitude: competitor.coordinates.lng,
            distanceMeters: competitor.distanceMeters,
            rating: competitor.rating,
            reviewCount: competitor.reviewCount,
            threatLevel: competitor.threatLevel,
          })),
        },
      },
      include: { competitors: true },
    });

    return {
      id: saved.id,
      label: saved.label,
      coordinates: { lat: saved.latitude, lng: saved.longitude },
      address: { formatted: location.formatted_address },
      businessType: saved.businessType,
      radiusMeters: saved.radiusMeters,
      weights: saved.weights,
      overallScore: saved.overallScore,
      verdict: saved.verdict,
      metrics: saved.metrics,
      competitors: competitorSearch.competitors,
      footTrafficPeak: saved.footTrafficPeak,
      footTrafficAverage: saved.footTrafficAvg,
      createdAt: saved.createdAt,
    };
  }

  async findAll(userId: string) {
    const analyses = await this.prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return analyses.map((analysis) => ({
      ...analysis,
      overallScore: null,
      verdict: null,
      metrics: [],
      footTrafficPeak: null,
      footTrafficAvg: null,
    }));
  }
}
