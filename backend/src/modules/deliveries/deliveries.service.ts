import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleMapsService, RouteResponse, EstimateTimeResponse } from '../../shared/services';

@Injectable()
export class DeliveriesService {
  constructor(
    // Inyección de repositorios
    // @InjectRepository(Delivery)
    // private deliveriesRepository: Repository<Delivery>,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async findAll(query: any) {
    // Implementar lógica de búsqueda con filtros
    return { 
      message: 'Lista de entregas',
      query
    };
  }

  async findOne(id: string) {
    // Buscar entrega por ID
    const delivery = { 
      id, 
      orderId: 'order123',
      driverId: 'driver456',
      status: 'in_progress',
      estimatedTime: '30 minutos',
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    };
    
    if (!delivery) {
      throw new NotFoundException(`Entrega con ID ${id} no encontrada`);
    }
    
    return delivery;
  }

  async create(createDeliveryDto: any) {
    // Crear nueva entrega
    return { 
      message: 'Entrega creada',
      data: createDeliveryDto 
    };
  }

  async update(id: string, updateDeliveryDto: any) {
    // Actualizar entrega existente
    return { 
      message: `Entrega ${id} actualizada`,
      data: updateDeliveryDto 
    };
  }

  async updateStatus(id: string, status: string) {
    // Actualizar estado de la entrega
    return { 
      message: `Estado de entrega ${id} actualizado a ${status}`
    };
  }

  async updateLocation(id: string, locationData: any) {
    // Actualizar ubicación del repartidor
    return { 
      message: `Ubicación de entrega ${id} actualizada`,
      location: locationData
    };
  }

  async findByDriver(driverId: string) {
    // Buscar entregas de un repartidor
    return { 
      message: `Entregas del repartidor ${driverId}`,
      deliveries: [
        { id: '1', orderId: 'order123', status: 'in_progress' },
        { id: '2', orderId: 'order456', status: 'pending' },
      ]
    };
  }

  async findByOrder(orderId: string) {
    // Buscar entrega de una orden
    return { 
      message: `Entrega de la orden ${orderId}`,
      delivery: {
        id: '1',
        driverId: 'driver456',
        status: 'in_progress',
        estimatedTime: '30 minutos'
      }
    };
  }

  async completeDelivery(id: string, deliveryData: any) {
    // Completar una entrega
    return { 
      message: `Entrega ${id} completada`,
      completedAt: new Date().toISOString(),
      deliveryData
    };
  }

  /**
   * Calcula la ruta para una entrega usando Google Maps
   */
  async calculateDeliveryRoute(
    originAddress: string,
    destinationAddress: string,
  ): Promise<RouteResponse> {
    try {
      // Geocodificar direcciones
      const originCoords = await this.googleMapsService.geocodeAddress(originAddress);
      const destinationCoords = await this.googleMapsService.geocodeAddress(destinationAddress);
      
      // Obtener distancia y duración
      const distanceMatrix = await this.googleMapsService.getDistanceMatrix(
        originCoords,
        destinationCoords,
        'driving',
      );
      
      // Obtener ruta
      const directions = await this.googleMapsService.getDirections(
        originCoords,
        destinationCoords,
        'driving',
      );
      
      // Generar URL de mapa estático
      const staticMapUrl = this.googleMapsService.getStaticMapUrl(
        originCoords,
        13,
        '600x400',
        [
          { lat: originCoords.lat, lng: originCoords.lng, label: 'A' },
          { lat: destinationCoords.lat, lng: destinationCoords.lng, label: 'B' },
        ],
      );
      
      return {
        origin: originCoords,
        destination: destinationCoords,
        distance: distanceMatrix.distance,
        duration: distanceMatrix.duration,
        directions: directions.routes[0].legs[0].steps,
        staticMapUrl,
      };
    } catch (error) {
      console.error('Error calculating delivery route:', error);
      throw error;
    }
  }

  /**
   * Obtiene una estimación de tiempo de entrega basada en 
   * la ubicación actual del repartidor y el destino
   */
  async estimateDeliveryTime(
    driverLocation: { lat: number; lng: number },
    destinationAddress: string
  ): Promise<EstimateTimeResponse> {
    try {
      // Geocodificar dirección de destino
      const destinationCoords = await this.googleMapsService.geocodeAddress(destinationAddress);
      
      // Obtener matriz de distancia
      const distanceMatrix = await this.googleMapsService.getDistanceMatrix(
        driverLocation,
        destinationCoords,
        'driving',
      );
      
      // Añadir tiempo adicional de preparación
      const preparationTimeMinutes = 10;
      const drivingTimeMinutes = Math.ceil(distanceMatrix.duration.value / 60);
      const totalEstimatedMinutes = preparationTimeMinutes + drivingTimeMinutes;
      
      return {
        destination: destinationCoords,
        drivingDistance: distanceMatrix.distance,
        drivingTime: distanceMatrix.duration,
        preparationTimeMinutes,
        totalEstimatedMinutes,
        estimatedTimeText: `${totalEstimatedMinutes} minutos`,
      };
    } catch (error) {
      console.error('Error estimating delivery time:', error);
      throw error;
    }
  }
}