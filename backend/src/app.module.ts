import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [PrismaModule, AuthModule, AnalysisModule],
})
export class AppModule {}