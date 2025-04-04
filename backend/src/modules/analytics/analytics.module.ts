import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Aquí se importarán los módulos necesarios para analíticas
    // TypeOrmModule.forFeature([]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}