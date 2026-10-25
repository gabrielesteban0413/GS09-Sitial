import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLayerDto } from './dto/create-layer.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LayersService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.layer.findMany({
      where: { userId },
      include: { _count: { select: { locations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateLayerDto) {
    return this.prisma.layer.create({
      data: {
        userId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        color: dto.color ?? '#3a9aa3',
      },
      include: { _count: { select: { locations: true } } },
    });
  }

  async removeLayer(userId: string, layerId: string) {
    const layer = await this.prisma.layer.findFirst({ where: { id: layerId, userId } });
    if (!layer) throw new NotFoundException('No se encontró la capa');
    await this.prisma.layer.delete({ where: { id: layerId } });
  }

  async listLocations(userId: string, layerId: string) {
    await this.getOwnedLayer(userId, layerId);
    return this.prisma.location.findMany({
      where: { layerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createLocation(userId: string, layerId: string, dto: CreateLocationDto) {
    await this.getOwnedLayer(userId, layerId);
    return this.prisma.location.create({
      data: {
        layerId,
        name: dto.name.trim(),
        address: dto.address?.trim() || null,
        category: dto.category,
        notes: dto.notes?.trim() || null,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async updateLocation(userId: string, locationId: string, dto: CreateLocationDto) {
    const location = await this.prisma.location.findFirst({
      where: { id: locationId, layer: { userId } },
    });
    if (!location) throw new NotFoundException('No se encontró la ubicación');

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        name: dto.name.trim(),
        address: dto.address?.trim() || null,
        category: dto.category,
        notes: dto.notes?.trim() || null,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async removeLocation(userId: string, locationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id: locationId, layer: { userId } },
    });
    if (!location) throw new NotFoundException('No se encontró la ubicación');
    await this.prisma.location.delete({ where: { id: locationId } });
  }

  private async getOwnedLayer(userId: string, layerId: string) {
    const layer = await this.prisma.layer.findFirst({ where: { id: layerId, userId } });
    if (!layer) throw new NotFoundException('No se encontró la capa');
    return layer;
  }
}
