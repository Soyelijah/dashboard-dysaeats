import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { RouteResponse, EstimateTimeResponse } from '../../shared/services';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.deliveriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Post()
  create(@Body() createDeliveryDto: any) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDto: any) {
    return this.deliveriesService.update(id, updateDeliveryDto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.deliveriesService.updateStatus(id, status);
  }

  @Put(':id/location')
  updateLocation(@Param('id') id: string, @Body() locationData: any) {
    return this.deliveriesService.updateLocation(id, locationData);
  }

  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.deliveriesService.findByDriver(driverId);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.deliveriesService.findByOrder(orderId);
  }

  @Post(':id/complete')
  completeDelivery(@Param('id') id: string, @Body() deliveryData: any) {
    return this.deliveriesService.completeDelivery(id, deliveryData);
  }

  @Post('route/calculate')
  calculateRoute(@Body() routeData: { origin: string; destination: string }): Promise<RouteResponse> {
    return this.deliveriesService.calculateDeliveryRoute(
      routeData.origin,
      routeData.destination,
    );
  }

  @Post('time/estimate')
  estimateDeliveryTime(
    @Body() estimateData: { 
      driverLocation: { lat: number; lng: number }; 
      destinationAddress: string 
    }
  ): Promise<EstimateTimeResponse> {
    return this.deliveriesService.estimateDeliveryTime(
      estimateData.driverLocation,
      estimateData.destinationAddress,
    );
  }
}