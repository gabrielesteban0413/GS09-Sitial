import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { GoogleMapsModule } from "./google-maps/google-maps.module";
import { CompetitorsModule } from "./competitors/competitors.module";
import { AnalysisModule } from "./analysis/analysis.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    GoogleMapsModule,
    CompetitorsModule,
    AnalysisModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
