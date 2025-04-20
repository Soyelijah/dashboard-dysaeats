// backend/src/modules/deliveries/services/maps.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
<<<<<<< HEAD
// import { HttpService } from '@nestjs/axios';
=======
import { HttpService } from '@nestjs/axios';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
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
<<<<<<< HEAD
    // private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || 'fake-key';
=======
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }
  
  async getDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
    try {
<<<<<<< HEAD
      // Simulación de respuesta
      this.logger.log(`Calculando distancia entre puntos (simulación)`);
      return 1000; // Simular 1km
=======
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${this.apiKey}`;
      
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        return data.rows[0].elements[0].distance.value; // distancia en metros
      }
      
      throw new Error('No se pudo calcular la distancia');
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    } catch (error) {
      this.logger.error(`Error getting distance: ${error.message}`);
      throw error;
    }
  }
  
  async getRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResponse> {
    try {
<<<<<<< HEAD
      // Simulación de respuesta
      this.logger.log(`Calculando ruta entre puntos (simulación)`);
      
      return {
        distance: 1000, // distancia en metros
        duration: 300, // duración en segundos
        polyline: 'simulated_polyline', // codificación de la ruta simulada
      };
=======
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${this.apiKey}`;
      
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance.value, // distancia en metros
          duration: leg.duration.value, // duración en segundos
          polyline: route.overview_polyline.points, // codificación de la ruta
        };
      }
      
      throw new Error('No se pudo calcular la ruta');
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    } catch (error) {
      this.logger.error(`Error getting route: ${error.message}`);
      throw error;
    }
  }
  
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
<<<<<<< HEAD
      // Simulación de respuesta
      this.logger.log(`Geocodificando dirección: ${address} (simulación)`);
      
      // Coordenadas simuladas para cualquier dirección
      return {
        latitude: -33.45694,
        longitude: -70.64827, // Coordenadas para Santiago, Chile
      };
=======
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      
      throw new Error('No se pudo geocodificar la dirección');
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    } catch (error) {
      this.logger.error(`Error geocoding address: ${error.message}`);
      throw error;
    }
  }
}