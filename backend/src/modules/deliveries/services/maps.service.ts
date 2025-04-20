// backend/src/modules/deliveries/services/maps.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  distance: number;
  duration: number;
  polyline: string;
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly apiKey: string;
  
  constructor(
    private readonly configService: ConfigService,
    // private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || 'fake-key';
  }
  
  async getDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
    try {
      // Simulación de respuesta
      this.logger.log(`Calculando distancia entre puntos (simulación)`);
      return 1000; // Simular 1km
    } catch (error) {
      this.logger.error(`Error getting distance: ${error.message}`);
      throw error;
    }
  }
  
  async getRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResponse> {
    try {
      // Simulación de respuesta
      this.logger.log(`Calculando ruta entre puntos (simulación)`);
      
      return {
        distance: 1000, // distancia en metros
        duration: 300, // duración en segundos
        polyline: 'simulated_polyline', // codificación de la ruta simulada
      };
    } catch (error) {
      this.logger.error(`Error getting route: ${error.message}`);
      throw error;
    }
  }
  
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
      // Simulación de respuesta
      this.logger.log(`Geocodificando dirección: ${address} (simulación)`);
      
      // Coordenadas simuladas para cualquier dirección
      return {
        latitude: -33.45694,
        longitude: -70.64827, // Coordenadas para Santiago, Chile
      };
    } catch (error) {
      this.logger.error(`Error geocoding address: ${error.message}`);
      throw error;
    }
  }
}