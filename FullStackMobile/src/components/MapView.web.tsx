/**
 * Web-compatible MapView component
 * Uses Google Maps JavaScript API for web, falls back to message on web
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock MapView for web
export default function MapView({ children, ...props }: any) {
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={64} color="#9ca3af" />
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.message}>
          Interactive maps are available on mobile devices.
        </Text>
        <Text style={styles.hint}>
          Use the Android or iOS app to view the map.
        </Text>
      </View>
    </View>
  );
}

// Mock Marker component
export function Marker({ children, ...props }: any) {
  return null;
}

// Mock Circle component
export function Circle(props: any) {
  return null;
}

// Mock Callout component
export function Callout({ children }: any) {
  return null;
}

// Mock PROVIDER_GOOGLE
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
