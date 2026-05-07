/**
 * Web-compatible MapView component
 * Google Maps implementation for web
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

interface MapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  provider?: string;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  mapType?: string;
  innerRef?: any;
  [key: string]: any;
}

// Context to share map instance with children
const MapContext = React.createContext<any>(null);

export default function MapView({ 
  style, 
  initialRegion, 
  children, 
  provider,
  showsUserLocation,
  showsMyLocationButton,
  mapType,
  innerRef,
  ...props 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDrH_9NPvz0bABzYgsqt-4JC13mxLQyT0I`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps');
      };
    } else if ((window as any).google) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const google = (window as any).google;
    const map = new google.maps.Map(mapRef.current, {
      center: {
        lat: initialRegion?.latitude || 20.0059,
        lng: initialRegion?.longitude || 73.7897,
      },
      zoom: calculateZoom(initialRegion?.latitudeDelta || 0.15),
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [], // Default styling
    });

    setMapInstance(map);

    // Expose methods for imperative API
    if (innerRef) {
      innerRef.current = {
        animateToRegion: (region: any, duration: number) => {
          map.panTo({
            lat: region.latitude,
            lng: region.longitude,
          });
          map.setZoom(calculateZoom(region.latitudeDelta));
        },
      };
    }

    if (props.onMapReady) {
      props.onMapReady();
    }
  }, [isLoaded]);

  // Calculate zoom level from latitudeDelta
  const calculateZoom = (latitudeDelta: number) => {
    return Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
  };

  return (
    <MapContext.Provider value={mapInstance}>
      <View style={[styles.container, style]}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 0,
          }}
        />
        {isLoaded && mapInstance && children}
      </View>
    </MapContext.Provider>
  );
}

// Marker component for web
export function Marker({ coordinate, children, anchor, onPress, ...props }: any) {
  const mapInstance = React.useContext(MapContext);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;

    const google = (window as any).google;
    
    // Create standard marker
    const marker = new google.maps.Marker({
      map: mapInstance,
      position: { lat: coordinate.latitude, lng: coordinate.longitude },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    markerRef.current = marker;

    if (onPress) {
      marker.addListener('click', onPress);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [mapInstance, coordinate?.latitude, coordinate?.longitude]);

  return null;
}

// Circle component for web
export function Circle({ center, radius, fillColor, strokeColor, strokeWidth, ...props }: any) {
  const mapInstance = React.useContext(MapContext);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;

    const google = (window as any).google;
    
    // Parse opacity from hex color (e.g., #FF000030 -> 0.19)
    const getFillOpacity = (color: string) => {
      if (!color) return 0.3;
      const match = color.match(/^#[0-9A-F]{6}([0-9A-F]{2})$/i);
      if (match) {
        return parseInt(match[1], 16) / 255;
      }
      return 0.3;
    };

    const getStrokeOpacity = (color: string) => {
      if (!color) return 0.8;
      const match = color.match(/^#[0-9A-F]{6}([0-9A-F]{2})$/i);
      if (match) {
        return parseInt(match[1], 16) / 255;
      }
      return 0.8;
    };

    const getBaseColor = (color: string) => {
      if (!color) return '#FF0000';
      return color.substring(0, 7); // Get first 7 chars (#RRGGBB)
    };
    
    const circle = new google.maps.Circle({
      map: mapInstance,
      center: { lat: center.latitude, lng: center.longitude },
      radius: radius,
      fillColor: getBaseColor(fillColor),
      fillOpacity: getFillOpacity(fillColor),
      strokeColor: getBaseColor(strokeColor),
      strokeOpacity: getStrokeOpacity(strokeColor),
      strokeWeight: strokeWidth || 2,
    });

    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [mapInstance, center?.latitude, center?.longitude, radius, fillColor, strokeColor, strokeWidth]);

  return null;
}

// Callout component for web
export function Callout({ children, tooltip, ...props }: any) {
  // Callouts are handled by InfoWindow in Google Maps
  // For now, we'll skip this as it requires more complex integration
  return null;
}

export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
