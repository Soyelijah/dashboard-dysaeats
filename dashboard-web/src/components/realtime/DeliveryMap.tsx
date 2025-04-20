import React, { useEffect, useRef } from 'react';
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

type DeliveryMapProps = {
  orderId: string;
  destinationAddress: string;
  initialCenter?: { lat: number; lng: number };
  height?: string | number;
  width?: string | number;
};

const defaultMapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

const defaultMapStyles = {
  height: '400px',
  width: '100%',
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  orderId,
  destinationAddress,
  initialCenter = { lat: -33.4489, lng: -70.6693 }, // Santiago, Chile default
  height = '400px',
  width = '100%',
}) => {
  const { deliveryInfo, isLoading, error } = useDeliveryTracking({ orderId });
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const destinationRef = useRef<google.maps.LatLng | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Geocode the destination address
  useEffect(() => {
    if (!window.google || !destinationAddress) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    geocoderRef.current.geocode({ address: destinationAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        destinationRef.current = results[0].geometry.location;
        
        if (mapRef.current && destinationRef.current) {
          // Add destination marker or update map bounds if delivery location is available
          if (deliveryInfo?.location) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(destinationRef.current);
            bounds.extend(new google.maps.LatLng(deliveryInfo.location.lat, deliveryInfo.location.lng));
            mapRef.current.fitBounds(bounds);
          } else {
            mapRef.current.setCenter(destinationRef.current);
            mapRef.current.setZoom(15);
          }
        }
      } else {
        console.error('Geocode failed for address:', destinationAddress, status);
      }
    });
  }, [destinationAddress, deliveryInfo?.location]);

  // Initialize and store map reference
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // If we already have destination coordinates, center the map
    if (destinationRef.current) {
      map.setCenter(destinationRef.current);
      map.setZoom(15);
    }
  };

  if (isLoading) {
    return <div className="delivery-map-loading">Loading map...</div>;
  }

  if (error) {
    return <div className="delivery-map-error">Error loading map: {error.message}</div>;
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={{ height, width }}
        center={initialCenter}
        zoom={13}
        options={defaultMapOptions}
        onLoad={onMapLoad}
      >
        {/* Delivery person marker */}
        {deliveryInfo?.location && (
          <Marker
            position={{
              lat: deliveryInfo.location.lat,
              lng: deliveryInfo.location.lng
            }}
            icon={{
              url: '/assets/delivery-marker.svg',
              scaledSize: new google.maps.Size(40, 40)
            }}
            title="Delivery Person"
          />
        )}

        {/* Destination marker */}
        {destinationRef.current && (
          <Marker
            position={{
              lat: destinationRef.current.lat(),
              lng: destinationRef.current.lng()
            }}
            icon={{
              url: '/assets/destination-marker.svg',
              scaledSize: new google.maps.Size(40, 40)
            }}
            title="Destination"
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default DeliveryMap;
