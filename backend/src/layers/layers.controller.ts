import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateLayerDto } from './dto/create-layer.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { LayersService } from './layers.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class LayersController {
  constructor(private readonly layersService: LayersService) {}

  @Get('layers')
  listLayers(@Req() req: { user: { userId: string } }) {
    return this.layersService.list(req.user.userId);
  }

  @Post('layers')
  createLayer(@Req() req: { user: { userId: string } }, @Body() dto: CreateLayerDto) {
    return this.layersService.create(req.user.userId, dto);
  }

  @Delete('layers/:layerId')
  async removeLayer(@Req() req: { user: { userId: string } }, @Param('layerId') layerId: string) {
    await this.layersService.removeLayer(req.user.userId, layerId);
    return { success: true };
  }

  @Get('layers/:layerId/locations')
  listLocations(@Req() req: { user: { userId: string } }, @Param('layerId') layerId: string) {
    return this.layersService.listLocations(req.user.userId, layerId);
  }

  @Post('layers/:layerId/locations')
  createLocation(
    @Req() req: { user: { userId: string } },
    @Param('layerId') layerId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.layersService.createLocation(req.user.userId, layerId, dto);
  }

  @Patch('locations/:locationId')
  updateLocation(
    @Req() req: { user: { userId: string } },
    @Param('locationId') locationId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.layersService.updateLocation(req.user.userId, locationId, dto);
  }

  @Delete('locations/:locationId')
  async removeLocation(@Req() req: { user: { userId: string } }, @Param('locationId') locationId: string) {
    await this.layersService.removeLocation(req.user.userId, locationId);
    return { success: true };
  }
}
