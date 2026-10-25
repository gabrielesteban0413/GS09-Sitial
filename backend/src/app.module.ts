import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AnalysisModule } from './analysis/analysis.module';
import { CompetitorsModule } from './competitors/competitors.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { LayersModule } from './layers/layers.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GoogleMapsModule,
    CompetitorsModule,
    AuthModule,
    AnalysisModule,
    LayersModule,
    PlacesModule,
  ],
})
export class AppModule {}