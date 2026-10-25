import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleMapsService } from '../google-maps/google-maps.service';

@Controller('places')
@UseGuards(AuthGuard('jwt'))
export class PlacesController {
  constructor(private readonly googleMaps: GoogleMapsService) {}

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
    @Query('type') type: string,
  ) {
    return { places: [] };
  }

  @Get('geocode')
  geocode(@Query('address') address?: string) {
    const query = address?.trim();
    if (!query) {
      throw new BadRequestException('Escribe una dirección para buscar.');
    }
    return this.googleMaps.geocodeAddress(`${query}, Bogotá, Colombia`);
  }
}