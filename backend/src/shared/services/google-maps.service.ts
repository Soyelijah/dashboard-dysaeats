import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface DistanceResult {
  distance: {
    text: string;
    value: number; // en metros
  };
  duration: {
    text: string;
    value: number; // en segundos
  };
}

export interface RouteResponse {
  origin: GeocodingResult;
  destination: GeocodingResult;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  directions: any[];
  staticMapUrl: string;
}

export interface EstimateTimeResponse {
  destination: GeocodingResult;
  drivingDistance: {
    text: string;
    value: number;
  };
  drivingTime: {
    text: string;
    value: number;
  };
  preparationTimeMinutes: number;
  totalEstimatedMinutes: number;
  estimatedTimeText: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('googleMapsApiKey');
  }

  /**
   * Geocodifica una dirección en coordenadas
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address,
            key: this.apiKey,
          },
        },
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry.location;

        return {
          lat,
          lng,
          formattedAddress: result.formatted_address,
        };
      } else {
        throw new Error(`Geocoding error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Obtiene la distancia y duración del viaje entre dos puntos
   */
  async getDistanceMatrix(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  ): Promise<DistanceResult> {
    try {
      // Formatear origen y destino
      const originStr = typeof origin === 'string' 
        ? origin 
        : `${origin.lat},${origin.lng}`;
      
      const destinationStr = typeof destination === 'string' 
        ? destination 
        : `${destination.lat},${destination.lng}`;

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: originStr,
            destinations: destinationStr,
            mode,
            key: this.apiKey,
          },
        },
      );

      if (
        response.data.status === 'OK' &&
        response.data.rows.length > 0 &&
        response.data.rows[0].elements.length > 0
      ) {
        const element = response.data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          return {
            distance: element.distance,
            duration: element.duration,
          };
        } else {
          throw new Error(`Distance Matrix error: ${element.status}`);
        }
      } else {
        throw new Error(`Distance Matrix error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      throw error;
    }
  }

  /**
   * Obtiene instrucciones de ruta entre dos puntos
   */
  async getDirections(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  ): Promise<any> {
    try {
      // Formatear origen y destino
      const originStr = typeof origin === 'string' 
        ? origin 
        : `${origin.lat},${origin.lng}`;
      
      const destinationStr = typeof destination === 'string' 
        ? destination 
        : `${destination.lat},${destination.lng}`;

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: originStr,
            destination: destinationStr,
            mode,
            key: this.apiKey,
          },
        },
      );

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        return {
          routes: response.data.routes,
        };
      } else {
        throw new Error(`Directions error: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  /**
   * Genera URL para vista estática del mapa
   */
  getStaticMapUrl(
    center: { lat: number; lng: number } | string,
    zoom: number = 14,
    size: string = '600x300',
    markers: Array<{ lat: number; lng: number; label?: string }> = [],
  ): string {
    // Formatear centro
    const centerStr = typeof center === 'string' 
      ? center 
      : `${center.lat},${center.lng}`;

    // Formatear marcadores
    const markersStr = markers
      .map((marker) => {
        let markerStr = '';
        if (marker.label) {
          markerStr += `label:${marker.label}|`;
        }
        markerStr += `${marker.lat},${marker.lng}`;
        return markerStr;
      })
      .join('&markers=');

    // Construir URL
    let url = `https://maps.googleapis.com/maps/api/staticmap?center=${centerStr}&zoom=${zoom}&size=${size}&key=${this.apiKey}`;
    
    if (markersStr) {
      url += `&markers=${markersStr}`;
    }
    
    return url;
  }
}