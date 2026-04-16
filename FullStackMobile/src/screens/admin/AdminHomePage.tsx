import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGetDashboard, DashboardStats, apiGetCities, apiGetZones, Zone } from '../../utils/api';

interface AdminHomePageProps {
  onSendAlert: () => void;
}

const zones = [
  { id: 1, name: 'Satpur', aqi: 295, status: 'Very Poor', predicted: 310, lastUpdated: '5 min ago', trend: 'up' },
  { id: 2, name: 'MIDC Industrial', aqi: 278, status: 'Very Poor', predicted: 265, lastUpdated: '5 min ago', trend: 'down' },
  { id: 3, name: 'Panchavati', aqi: 142, status: 'Moderate', predicted: 155, lastUpdated: '8 min ago', trend: 'up' },
  { id: 4, name: 'Nashik Road', aqi: 198, status: 'Poor', predicted: 215, lastUpdated: '3 min ago', trend: 'up' },
  { id: 5, name: 'Cidco', aqi: 165, status: 'Poor', predicted: 170, lastUpdated: '6 min ago', trend: 'up' },
  { id: 6, name: 'College Road', aqi: 122, status: 'Moderate', predicted: 118, lastUpdated: '10 min ago', trend: 'down' },
  { id: 7, name: 'Gangapur', aqi: 95, status: 'Satisfactory', predicted: 88, lastUpdated: '7 min ago', trend: 'down' },
  { id: 8, name: 'Old Nashik', aqi: 156, status: 'Poor', predicted: 162, lastUpdated: '4 min ago', trend: 'up' },
  { id: 9, name: 'Deolali', aqi: 52, status: 'Good', predicted: 48, lastUpdated: '12 min ago', trend: 'down' },
];

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { fill: '#22c55e', border: '#16a34a', text: 'Good' };
  if (aqi <= 100) return { fill: '#84cc16', border: '#65a30d', text: 'Satisfactory' };
  if (aqi <= 200) return { fill: '#eab308', border: '#d97706', text: 'Moderate' };
  if (aqi <= 300) return { fill: '#f97316', border: '#ea580c', text: 'Poor' };
  if (aqi <= 400) return { fill: '#ef4444', border: '#dc2626', text: 'Very Poor' };
  return { fill: '#a855f7', border: '#9333ea', text: 'Severe' };
};

export default function AdminHomePage({ onSendAlert }: AdminHomePageProps) {
  const [citySearch, setCitySearch] = useState('Nashik');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dash, cities] = await Promise.all([
          apiGetDashboard(),
          apiGetCities(),
        ]);
        setStats(dash);
        // Load zones for Nashik (first city or matching city)
        const nashik = cities.find(c => c.city_name.toLowerCase().includes('nashik')) || cities[0];
        if (nashik) {
          const zoneList = await apiGetZones(nashik.id);
          setZones(zoneList);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const StatCard = ({ icon, iconBg, iconColor, value, label, sub, subColor }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statSub, { color: subColor || '#6b7280' }]}>{sub}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Could not reach server</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* City Search Row */}
      <View style={styles.searchCard}>
        <Ionicons name="map-outline" size={18} color="#d97706" />
        <Text style={styles.searchLabel}>City</Text>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search-outline" size={14} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            value={citySearch}
            onChangeText={setCitySearch}
            placeholder="Enter city name..."
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.loadMapBtn}>
          <Ionicons name="map-outline" size={14} color="#fff" />
          <Text style={styles.loadMapText}>Load Map</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="analytics-outline" iconBg="#fed7aa" iconColor="#ea580c"
          value={stats?.average_aqi ?? '—'} label="Average AQI" sub="City Wide" subColor="#ea580c" />
        <StatCard icon="trending-up-outline" iconBg="#fecaca" iconColor="#dc2626"
          value={stats?.highest_aqi_zone?.aqi ?? '—'} label="Highest AQI"
          sub={stats?.highest_aqi_zone?.zone_name ?? '—'} subColor="#dc2626" />
        <StatCard icon="warning-outline" iconBg="#fecaca" iconColor="#dc2626"
          value={stats?.red_zone_count ?? 0} label="Red Zones" sub="AQI > 200" subColor="#dc2626" />
        <StatCard icon="layers-outline" iconBg="#dbeafe" iconColor="#2563eb"
          value={stats?.total_zones ?? 0} label="Total Zones" sub="Monitored" subColor="#2563eb" />
      </View>

      {/* Zone Map (zone name list from API, AQI shown from dashboard red_zones) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>City Zone Map — Nashik</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        {/* Show zone names from API; color them by red zones list */}
        <View style={styles.zoneGrid}>
          {zones.length > 0 ? zones.map(zone => {
            const redEntry = stats?.red_zones?.find(r => r.zone_name === zone.zone_name);
            const aqi = redEntry?.aqi ?? 0;
            const colors = getAQIColor(aqi);
            return (
              <View key={zone.id} style={[styles.zoneCell, { backgroundColor: colors.fill + '25', borderColor: colors.border + '60' }]}>
                <Text style={styles.zoneCellName}>{zone.zone_name}</Text>
                <Text style={[styles.zoneCellAqi, { color: colors.border }]}>{aqi > 0 ? aqi : '—'}</Text>
                <Text style={styles.zoneCellStatus}>{aqi > 0 ? colors.text : 'OK'}</Text>
              </View>
            );
          }) : (
            <Text style={{ padding: 16, color: '#9ca3af', fontSize: 13 }}>No zones found for this city.</Text>
          )}
        </View>
      </View>

      {/* Red Zone Table from dashboard */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.redDotRow}>
            <View style={styles.redDot} />
            <Text style={styles.sectionTitle}>Red Zone Areas</Text>
            <View style={styles.redBadge}><Text style={styles.redBadgeText}>{stats?.red_zone_count ?? 0} Active</Text></View>
          </View>
          <Text style={styles.metaText}>AQI &gt; 200</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Zone</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>AQI</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Action</Text>
        </View>
        {(stats?.red_zones ?? []).map((zone, i) => (
          <View key={zone.zone_name} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-outline" size={14} color="#ef4444" />
              <Text style={styles.zoneName}>{zone.zone_name}</Text>
            </View>
            <Text style={[styles.tableCell, { flex: 1, color: '#dc2626', fontWeight: '700' }]}>{zone.aqi}</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={onSendAlert}>
              <Ionicons name="notifications-outline" size={12} color="#fff" />
              <Text style={styles.alertBtnText}>Alert</Text>
            </TouchableOpacity>
          </View>
        ))}
        {(stats?.red_zones?.length ?? 0) === 0 && (
          <Text style={{ padding: 16, color: '#22c55e', fontSize: 13, fontWeight: '600' }}>✓ No red zones currently</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  searchCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff',
    borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111827' },
  loadMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#d97706', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  loadMapText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 28 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 3 },
  statSub: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  liveText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  zoneGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  zoneCell: {
    width: '30%', flexGrow: 1, borderRadius: 10, borderWidth: 1.5,
    padding: 10, alignItems: 'center',
  },
  zoneCellName: { fontSize: 10, color: '#374151', fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  zoneCellAqi: { fontSize: 18, fontWeight: '800' },
  zoneCellStatus: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  redDotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  redBadge: { backgroundColor: '#fef2f2', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#fecaca' },
  redBadgeText: { fontSize: 10, color: '#dc2626', fontWeight: '700' },
  metaText: { fontSize: 11, color: '#9ca3af' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 10 },
  tableHeaderCell: { fontSize: 10, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  tableRowAlt: { backgroundColor: '#fefefe' },
  zoneName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  tableCell: { fontSize: 13, color: '#374151' },
  alertBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 7,
  },
  alertBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loadingText: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 8 },
  errorSub: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
