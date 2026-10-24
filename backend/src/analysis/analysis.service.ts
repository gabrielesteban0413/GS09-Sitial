import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    const score = Math.floor(Math.random() * 40) + 60;
    const verdict = score >= 75 ? 'optimal' : score >= 55 ? 'review' : 'discard';
    
    const metrics = [
      { name: 'Afluencia', value: 78, description: 'Flujo peatonal estimado' },
      { name: 'Competencia', value: 45, description: 'Densidad de competidores' },
      { name: 'Demografía', value: 85, description: 'Perfil del consumidor' },
      { name: 'Accesibilidad', value: 70, description: 'Transporte cercano' },
    ];

    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        label: dto.label,
        latitude: dto.coordinates.lat,
        longitude: dto.coordinates.lng,
        businessType: dto.businessType,
        radiusMeters: dto.radiusMeters,
        overallScore: score,
        verdict: verdict,
        weights: dto.weights,
        metrics: metrics,
        footTrafficPeak: 6200,
        footTrafficAvg: 4800,
      },
    });

    const competitorsData = [
      { placeId: '1', name: 'Competidor A', category: dto.businessType, latitude: dto.coordinates.lat + 0.001, longitude: dto.coordinates.lng + 0.001, distanceMeters: 150, rating: 4.5, reviewCount: 120, threatLevel: 'medium' },
      { placeId: '2', name: 'Competidor B', category: dto.businessType, latitude: dto.coordinates.lat - 0.001, longitude: dto.coordinates.lng - 0.001, distanceMeters: 250, rating: 4.8, reviewCount: 300, threatLevel: 'high' },
    ];

    for (const c of competitorsData) {
      await this.prisma.competitor.create({
        data: { ...c, analysisId: analysis.id },
      });
    }

    return this.prisma.analysis.findUnique({
      where: { id: analysis.id },
      include: { competitors: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.analysis.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}