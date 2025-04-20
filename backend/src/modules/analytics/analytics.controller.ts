<<<<<<< HEAD
import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
=======
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
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
<<<<<<< HEAD
    try {
      return this.analyticsService.getRestaurantStats(id, query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
=======
    return this.analyticsService.getRestaurantStats(id, query);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }

  @Post('export')
  exportData(@Body() exportOptions: any) {
<<<<<<< HEAD
    try {
      return this.analyticsService.exportData(exportOptions);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
=======
    return this.analyticsService.exportData(exportOptions);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }

  @Get('reports/daily')
  getDailyReport(@Query() query: any) {
<<<<<<< HEAD
    try {
      return this.analyticsService.getDailyReport(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
=======
    return this.analyticsService.getDailyReport(query);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }

  @Get('reports/weekly')
  getWeeklyReport(@Query() query: any) {
<<<<<<< HEAD
    try {
      return this.analyticsService.getWeeklyReport(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
=======
    return this.analyticsService.getWeeklyReport(query);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }

  @Get('reports/monthly')
  getMonthlyReport(@Query() query: any) {
<<<<<<< HEAD
    try {
      return this.analyticsService.getMonthlyReport(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
=======
    return this.analyticsService.getMonthlyReport(query);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }
}