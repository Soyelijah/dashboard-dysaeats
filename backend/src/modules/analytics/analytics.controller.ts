import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardData(@Query() query: any) {
    return this.analyticsService.getDashboardData(query);
  }

  @Get('sales')
  getSalesData(@Query() query: any) {
    return this.analyticsService.getSalesData(query);
  }

  @Get('orders')
  getOrdersData(@Query() query: any) {
    return this.analyticsService.getOrdersData(query);
  }

  @Get('customers')
  getCustomersData(@Query() query: any) {
    return this.analyticsService.getCustomersData(query);
  }

  @Get('products')
  getProductsData(@Query() query: any) {
    return this.analyticsService.getProductsData(query);
  }

  @Get('restaurants/:id')
  getRestaurantStats(@Param('id') id: string, @Query() query: any) {
    return this.analyticsService.getRestaurantStats(id, query);
  }

  @Post('export')
  exportData(@Body() exportOptions: any) {
    return this.analyticsService.exportData(exportOptions);
  }

  @Get('reports/daily')
  getDailyReport(@Query() query: any) {
    return this.analyticsService.getDailyReport(query);
  }

  @Get('reports/weekly')
  getWeeklyReport(@Query() query: any) {
    return this.analyticsService.getWeeklyReport(query);
  }

  @Get('reports/monthly')
  getMonthlyReport(@Query() query: any) {
    return this.analyticsService.getMonthlyReport(query);
  }
}