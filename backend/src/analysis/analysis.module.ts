import { Module } from "@nestjs/common";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { ScoringService } from "./services/scoring.service";
import { DemographicService } from "./services/demographic.service";
import { CompetitorsModule } from "../competitors/competitors.module";

@Module({
  imports: [CompetitorsModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, ScoringService, DemographicService],
})
export class AnalysisModule {}
