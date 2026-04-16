import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nashikAreas, getPollutants, getAQICategory } from '../utils/aqiUtils';

interface TableViewScreenProps {
  selectedArea: string;
  onBack: () => void;
}

const POLLUTANT_NAMES: Record<string, string> = {
  'PM2.5': 'Fine Particles',
  'PM10': 'Coarse Particles',
  'CO': 'Carbon Monoxide',
  'NO₂': 'Nitrogen Dioxide',
  'SO₂': 'Sulfur Dioxide',
  'O₃': 'Ozone',
  'NH₃': 'Ammonia',
};

export default function TableViewScreen({ selectedArea, onBack }: TableViewScreenProps) {
  const area = nashikAreas.find(a => a.name === selectedArea) || nashikAreas[0];
  const pollutants = getPollutants(area.aqi);
  const lastUpdated = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AQI Components</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Area</Text>
          <Text style={styles.infoValue}>{selectedArea}</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { flex: 2 }]}>Pollutant</Text>
        <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>Conc.</Text>
        <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Unit</Text>
        <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>AQI Sub</Text>
      </View>

      <FlatList
        data={pollutants}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const category = getAQICategory(item.aqiSubIndex);
          return (
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Text style={styles.pollutantName}>{item.name}</Text>
                <Text style={styles.pollutantSub}>{POLLUTANT_NAMES[item.name] || ''}</Text>
              </View>
              <Text style={[styles.cellText, { flex: 1.2, textAlign: 'right' }]}>{item.concentration}</Text>
              <Text style={[styles.cellUnit, { flex: 1, textAlign: 'right' }]}>{item.unit}</Text>
              <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                <View style={[styles.badge, { backgroundColor: category.color + '20' }]}>
                  <Text style={[styles.badgeText, { color: category.color }]}>{item.aqiSubIndex}</Text>
                </View>
              </View>
              {/* Color bar at bottom */}
              <View style={[styles.colorBar, { backgroundColor: category.color }]} />
            </View>
          );
        }}
        ListFooterComponent={() => (
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  infoBox: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14 },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#2563eb',
    paddingHorizontal: 20, paddingVertical: 14, marginHorizontal: 16, marginTop: 16,
    borderRadius: 14,
  },
  colHeader: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  separator: { height: 8 },
  row: {
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  pollutantName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  pollutantSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cellText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cellUnit: { fontSize: 12, color: '#6b7280' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  colorBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  lastUpdated: { textAlign: 'center', fontSize: 12, color: '#9ca3af', paddingVertical: 20 },
});
