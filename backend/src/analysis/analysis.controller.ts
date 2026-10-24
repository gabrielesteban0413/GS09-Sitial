import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('analysis')
@UseGuards(AuthGuard('jwt'))
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.analysisService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.analysisService.findAll(req.user.userId);
  }
}