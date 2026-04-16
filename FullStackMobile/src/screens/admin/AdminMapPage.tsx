import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, ScrollView, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGetMapZones, GeoJSONZone } from '../../utils/api';

// Conditional import for maps (only on mobile)
let MapView: any, Marker: any, Circle: any, Callout: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
  Callout = maps.Callout;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { fill: '#22c55e', border: '#16a34a', text: 'Good' };
  if (aqi <= 100) return { fill: '#84cc16', border: '#65a30d', text: 'Satisfactory' };
  if (aqi <= 200) return { fill: '#eab308', border: '#d97706', text: 'Moderate' };
  if (aqi <= 300) return { fill: '#f97316', border: '#ea580c', text: 'Poor' };
  if (aqi <= 400) return { fill: '#ef4444', border: '#dc2626', text: 'Very Poor' };
  return { fill: '#a855f7', border: '#9333ea', text: 'Severe' };
};

export default function AdminMapPage() {
  const [zones, setZones] = useState<GeoJSONZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true);
        const data = await apiGetMapZones();
        setZones(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };
    loadZones();
  }, []);

  const handleZonePress = (zoneName: string, lat: number, lng: number) => {
    setSelectedZone(zoneName);
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 800);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={styles.loadingText}>Loading map data…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Could not load map</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </View>
    );
  }

  // Calculate center of all zones
  const centerLat = zones.length > 0 
    ? zones.reduce((sum, z) => sum + (z.geometry?.coordinates?.[0]?.[0]?.[1] || 20.0059), 0) / zones.length
    : 20.0059;
  const centerLng = zones.length > 0
    ? zones.reduce((sum, z) => sum + (z.geometry?.coordinates?.[0]?.[0]?.[0] || 73.7897), 0) / zones.length
    : 73.7897;

  return (
    <View style={styles.container}>
      {/* Map Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="map" size={20} color="#d97706" />
          <Text style={styles.headerTitle}>AQI Zone Map</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Google Map or Web Placeholder */}
      {Platform.OS === 'web' ? (
        <View style={[styles.map, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="map-outline" size={64} color="#9ca3af" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginTop: 16 }}>
            Map View
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
            Interactive maps are available on mobile devices.{'\n'}
            Use the Android or iOS app to view the map.
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {zones.map((zone) => {
            const { properties } = zone;
            const colors = getAQIColor(properties.aqi_value);
            const isSelected = selectedZone === properties.zone_name;
            
            // Get coordinates from GeoJSON
            const coords = zone.geometry?.coordinates?.[0]?.[0];
            const lat = coords?.[1] || 20.0059;
            const lng = coords?.[0] || 73.7897;

            return (
              <React.Fragment key={properties.zone_id}>
                {/* Background circle */}
                <Circle
                  center={{ latitude: lat, longitude: lng }}
                  radius={1200}
                  fillColor={colors.fill + '25'}
                  strokeColor={colors.border + '80'}
                  strokeWidth={2}
                />

                {/* Marker */}
                <Marker
                  coordinate={{ latitude: lat, longitude: lng }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  onPress={() => handleZonePress(properties.zone_name, lat, lng)}
                >
                  <View style={[
                    styles.customMarker,
                    isSelected && styles.customMarkerSelected,
                    { backgroundColor: colors.fill, borderColor: isSelected ? '#fff' : colors.border }
                  ]}>
                    <Text style={[
                      styles.customMarkerText,
                      isSelected && styles.customMarkerTextSelected
                    ]}>{Math.round(properties.aqi_value)}</Text>
                  </View>
                  <Callout tooltip>
                    <View style={styles.callout}>
                      <Text style={styles.calloutZone}>{properties.zone_name}</Text>
                      <View style={[styles.calloutAqiBadge, { backgroundColor: colors.fill }]}>
                        <Text style={styles.calloutAqi}>AQI {Math.round(properties.aqi_value)}</Text>
                      </View>
                      <Text style={styles.calloutLevel}>{properties.level}</Text>
                    </View>
                  </Callout>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>AQI Scale</Text>
        <View style={styles.legendGrid}>
          {[
            { label: 'Good', range: '0-50', color: '#22c55e' },
            { label: 'Satisfactory', range: '51-100', color: '#84cc16' },
            { label: 'Moderate', range: '101-200', color: '#eab308' },
            { label: 'Poor', range: '201-300', color: '#f97316' },
            { label: 'Very Poor', range: '301-400', color: '#ef4444' },
            { label: 'Severe', range: '400+', color: '#a855f7' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendRange}>{item.range}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Zone List */}
      <View style={styles.zoneList}>
        <Text style={styles.zoneListTitle}>Monitored Zones ({zones.length})</Text>
        {zones.map((zone) => {
          const { properties } = zone;
          const colors = getAQIColor(properties.aqi_value);
          const coords = zone.geometry?.coordinates?.[0]?.[0];
          const lat = coords?.[1] || 20.0059;
          const lng = coords?.[0] || 73.7897;

          return (
            <TouchableOpacity
              key={properties.zone_id}
              style={[
                styles.zoneItem,
                selectedZone === properties.zone_name && styles.zoneItemSelected
              ]}
              onPress={() => handleZonePress(properties.zone_name, lat, lng)}
            >
              <View style={[styles.zoneColorBar, { backgroundColor: colors.fill }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneName}>{properties.zone_name}</Text>
                <Text style={styles.zoneLevel}>{properties.level}</Text>
              </View>
              <View style={[styles.zoneAqiBadge, { backgroundColor: colors.fill + '25', borderColor: colors.border }]}>
                <Text style={[styles.zoneAqiText, { color: colors.border }]}>
                  {Math.round(properties.aqi_value)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  liveText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  map: { height: 300 },
  legend: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 14, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  legendTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '30%' },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  legendRange: { fontSize: 9, color: '#9ca3af' },
  zoneList: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, marginBottom: 16,
    borderRadius: 14, padding: 14, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  zoneListTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10 },
  zoneItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingRight: 10, borderRadius: 10,
    marginBottom: 6, borderWidth: 1, borderColor: 'transparent',
  },
  zoneItemSelected: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  zoneColorBar: { width: 4, height: 40, borderRadius: 2 },
  zoneName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  zoneLevel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  zoneAqiBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1,
  },
  zoneAqiText: { fontSize: 13, fontWeight: '700' },
  customMarker: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  customMarkerSelected: { width: 50, height: 50, borderRadius: 25, borderWidth: 3.5, elevation: 8 },
  customMarkerText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  customMarkerTextSelected: { fontSize: 15 },
  callout: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, minWidth: 140,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10,
    alignItems: 'center', gap: 8,
  },
  calloutZone: { fontSize: 14, fontWeight: '700', color: '#111827' },
  calloutAqiBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  calloutAqi: { color: '#fff', fontWeight: '700', fontSize: 14 },
  calloutLevel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loadingText: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 8 },
  errorSub: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
