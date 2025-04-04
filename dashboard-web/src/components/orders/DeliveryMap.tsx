import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '../common/card';
import { Button } from '../common/button';
import { useDictionary } from '@/hooks/useDictionary';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

interface DeliveryMapProps {
  restaurantLocation: {
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
  };
  deliveryPersonLocation?: {
    lat: number;
    lng: number;
  };
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantLocation,
  deliveryLocation,
  deliveryPersonLocation,
}) => {
  const { resolvedTheme } = useTheme();
  const dict = useDictionary();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapCenter, setMapCenter] = useState(restaurantLocation);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (!isLoaded) return;

    // Calcular el centro del mapa
    setMapCenter({
      lat: (restaurantLocation.lat + deliveryLocation.lat) / 2,
      lng: (restaurantLocation.lng + deliveryLocation.lng) / 2,
    });

    if (directionsService.current) {
      calculateRoute();
    }
  }, [isLoaded, restaurantLocation, deliveryLocation, deliveryPersonLocation]);

  const onMapLoad = (map: google.maps.Map) => {
    directionsService.current = new google.maps.DirectionsService();
    calculateRoute();
  };

  const calculateRoute = () => {
    if (!directionsService.current) return;

    const origin = deliveryPersonLocation || restaurantLocation;
    const destination = deliveryLocation;

    directionsService.current.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  if (!isLoaded) {
    return <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg"></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.orders.deliveryMap}</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            styles: resolvedTheme === 'dark' ? [{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] }] : [],
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Restaurante */}
          <Marker
            position={restaurantLocation}
            icon={{
              url: '/icons/restaurant-marker.svg',
              scaledSize: new google.maps.Size(40, 40),
            }}
            title={dict.orders.restaurant}
          />

          {/* Punto de entrega */}
          <Marker
            position={deliveryLocation}
            icon={{
              url: '/icons/delivery-marker.svg',
              scaledSize: new google.maps.Size(40, 40),
            }}
            title={dict.orders.deliveryLocation}
          />

          {/* Repartidor (si está disponible) */}
          {deliveryPersonLocation && (
            <Marker
              position={deliveryPersonLocation}
              icon={{
                url: '/icons/driver-marker.svg',
                scaledSize: new google.maps.Size(40, 40),
              }}
              title={dict.orders.deliveryPerson}
            />
          )}

          {/* Ruta */}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={calculateRoute}>
            {dict.orders.refreshRoute}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryMap;