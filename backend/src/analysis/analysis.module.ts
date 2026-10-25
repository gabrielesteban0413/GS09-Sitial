import { Module } from '@nestjs/common';
import { CompetitorsModule } from '../competitors/competitors.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { ScoringService } from './services/scoring.service';

@Module({
  imports: [CompetitorsModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, ScoringService],
})
export class AnalysisModule {}