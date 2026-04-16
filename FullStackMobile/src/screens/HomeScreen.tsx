import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Modal, FlatList, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAQICategory, nashikAreas } from '../utils/aqiUtils';

// Conditional import for DateTimePicker
let DateTimePicker: any;
if (Platform.OS === 'web') {
  DateTimePicker = require('../components/DateTimePicker.web').default;
} else {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface HomeScreenProps {
  onViewGraph: (area: string, date: Date) => void;
  onViewTable: (area: string) => void;
  onLogout: () => void;
}

export default function HomeScreen({ onViewGraph, onViewTable, onLogout }: HomeScreenProps) {
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedArea = nashikAreas.find(a => a.name === selectedZone) || nashikAreas[0];
  const aqiCategory = getAQICategory(selectedArea.aqi);
  const lastUpdated = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleShowAQI = () => {
    if (selectedZone && selectedDate && selectedTime) {
      setShowResults(true);
      // Animate map to selected zone
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: selectedArea.lat,
          longitude: selectedArea.lng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }, 800);
      }, 300);
    }
  };

  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (t: Date) => t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const isFormComplete = selectedZone && selectedDate && selectedTime;

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={styles.logoBox}>
            <Ionicons name="cloud-outline" size={22} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appBarTitle}>Nashik AQI Monitor</Text>
            <Text style={styles.appBarSubtitle}>Live Air Quality Data</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#2563eb" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Input Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Select Zone & Time</Text>
          </View>

          {/* Zone Picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Zone / Locality</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowZonePicker(true)}>
              <Ionicons name="location-outline" size={20} color="#9ca3af" />
              <Text style={[styles.selectText, !selectedZone && styles.placeholder]}>
                {selectedZone || 'Select a zone in Nashik'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
              <Text style={[styles.selectText, !selectedDate && styles.placeholder]}>
                {selectedDate ? formatDate(selectedDate) : 'Select date'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#9ca3af" />
              <Text style={[styles.selectText, !selectedTime && styles.placeholder]}>
                {selectedTime ? formatTime(selectedTime) : 'Select time'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Show AQI Button */}
          <TouchableOpacity
            style={[styles.btn, !isFormComplete && styles.btnDisabled]}
            onPress={handleShowAQI}
            disabled={!isFormComplete}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, !isFormComplete && styles.btnTextDisabled]}>Show AQI</Text>
          </TouchableOpacity>
        </View>

        {/* AQI Results */}
        {showResults && selectedZone && (
          <>
            {/* AQI Card */}
            <View style={[styles.aqiCard, { backgroundColor: aqiCategory.color }]}>
              <View style={styles.aqiCardTop}>
                <Text style={styles.aqiLabel}>Air Quality Index</Text>
                <Text style={styles.aqiValue}>{selectedArea.aqi}</Text>
                <View style={styles.aqiLevelBadge}>
                  <Text style={styles.aqiLevel}>{aqiCategory.level}</Text>
                </View>
                <Text style={styles.aqiMeta}>{selectedZone} • Last updated {lastUpdated}</Text>
              </View>
              <View style={styles.aqiBottom}>
                <Text style={styles.aqiMessage}><Text style={{ fontWeight: '700' }}>Health Advisory: </Text>{aqiCategory.message}</Text>
              </View>
            </View>

            {/* Real Google Map */}
            <View style={styles.mapCard}>
              <View style={styles.mapHeader}>
                <Ionicons name="map-outline" size={16} color="#2563eb" />
                <Text style={styles.mapTitle}>Zone Location</Text>
                <View style={styles.mapBadge}>
                  <Text style={styles.mapBadgeText}>Live Map</Text>
                </View>
              </View>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: selectedArea.lat,
                  longitude: selectedArea.lng,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                mapType="standard"
              >
                {/* All zones as color-coded background circles */}
                {nashikAreas.map((area) => {
                  const cat = getAQICategory(area.aqi);
                  return (
                    <Circle
                      key={`circle-${area.name}`}
                      center={{ latitude: area.lat, longitude: area.lng }}
                      radius={800}
                      fillColor={cat.color + '30'}
                      strokeColor={cat.color + '80'}
                      strokeWidth={1.5}
                    />
                  );
                })}

                {/* All zones as markers */}
                {nashikAreas.map((area) => {
                  const cat = getAQICategory(area.aqi);
                  const isSelected = area.name === selectedZone;
                  return (
                    <Marker
                      key={area.name}
                      coordinate={{ latitude: area.lat, longitude: area.lng }}
                      anchor={{ x: 0.5, y: 0.5 }}
                    >
                      {/* Custom marker view */}
                      <View style={[
                        styles.customMarker,
                        isSelected && styles.customMarkerSelected,
                        { backgroundColor: cat.color, borderColor: isSelected ? '#fff' : cat.color + 'AA' }
                      ]}>
                        <Text style={[
                          styles.customMarkerText,
                          isSelected && styles.customMarkerTextSelected
                        ]}>{area.aqi}</Text>
                      </View>
                      <Callout tooltip>
                        <View style={styles.callout}>
                          <Text style={styles.calloutZone}>{area.name}</Text>
                          <View style={[styles.calloutAqiBadge, { backgroundColor: cat.color }]}>
                            <Text style={styles.calloutAqi}>AQI {area.aqi}</Text>
                          </View>
                          <Text style={styles.calloutLevel}>{cat.level}</Text>
                        </View>
                      </Callout>
                    </Marker>
                  );
                })}
              </MapView>

              {/* AQI legend */}
              <View style={styles.mapLegend}>
                {[
                  { label: 'Good', color: '#22c55e' },
                  { label: 'Moderate', color: '#eab308' },
                  { label: 'Poor', color: '#f97316' },
                  { label: 'Very Poor', color: '#ef4444' },
                ].map(item => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Health Advisory */}
            {selectedArea.aqi > 100 && (
              <View style={[styles.advisory, { borderLeftColor: aqiCategory.color, backgroundColor: aqiCategory.color + '15' }]}>
                <View style={[styles.advisoryIcon, { backgroundColor: aqiCategory.color + '30' }]}>
                  <Ionicons name="warning-outline" size={20} color={aqiCategory.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.advisoryTitle}>Health Advisory</Text>
                  <Text style={styles.advisoryText}>
                    {selectedArea.aqi > 300
                      ? "Stay indoors. Avoid all outdoor activities. Use air purifiers and N95 masks if going outside is necessary."
                      : selectedArea.aqi > 200
                        ? "Limit outdoor activities. Vulnerable groups should stay indoors. Wear masks when outside."
                        : "Sensitive individuals should consider reducing prolonged outdoor exertion."}
                  </Text>
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
                onPress={() => onViewGraph(selectedZone, selectedDate!)}
                activeOpacity={0.85}
              >
                <Ionicons name="bar-chart-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>View Graph</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}
                onPress={() => onViewTable(selectedZone)}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={24} color="#fff" />
                <Text style={styles.actionBtnText}>View Table</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Empty State */}
        {!showResults && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-outline" size={40} color="#2563eb" />
            </View>
            <Text style={styles.emptyTitle}>Select Zone & Time</Text>
            <Text style={styles.emptySubtitle}>Fill in the form above to view real-time AQI data for your selected zone.</Text>
          </View>
        )}
      </ScrollView>

      {/* Zone Picker Modal */}
      <Modal visible={showZonePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Zone</Text>
              <TouchableOpacity onPress={() => setShowZonePicker(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={nashikAreas}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedZone === item.name && styles.modalItemActive]}
                  onPress={() => { setSelectedZone(item.name); setShowZonePicker(false); }}
                >
                  <Text style={[styles.modalItemText, selectedZone === item.name && styles.modalItemTextActive]}>{item.name}</Text>
                  {selectedZone === item.name && <Ionicons name="checkmark" size={18} color="#2563eb" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date);
            if (Platform.OS === 'android') setShowDatePicker(false);
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour
          onChange={(event, time) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (time) setSelectedTime(time);
            if (Platform.OS === 'android') setShowTimePicker(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  appBar: { backgroundColor: '#2563eb', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  appBarInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  logoutBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 12 },
  logoBox: {
    width: 40, height: 40, backgroundColor: '#fff', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  appBarTitle: { color: '#fff', fontWeight: '700', fontSize: 17 },
  appBarSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 },
  selectBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  selectText: { flex: 1, fontSize: 15, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  btn: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { backgroundColor: '#d1d5db', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextDisabled: { color: '#6b7280' },
  aqiCard: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  aqiCardTop: { padding: 28, alignItems: 'center' },
  aqiLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  aqiValue: { color: '#fff', fontSize: 72, fontWeight: '800', lineHeight: 80, marginBottom: 10 },
  aqiLevelBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, marginBottom: 8 },
  aqiLevel: { color: '#fff', fontSize: 17, fontWeight: '700' },
  aqiMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  aqiBottom: { backgroundColor: '#fff', padding: 16 },
  aqiMessage: { fontSize: 13, color: '#374151', lineHeight: 20 },
  mapCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  mapHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 8 },
  mapTitle: { fontWeight: '600', fontSize: 15, color: '#111827', flex: 1 },
  mapBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  mapBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563eb' },
  map: { height: 260, width: '100%' },
  mapLegend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  customMarker: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
  customMarkerSelected: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#fff', elevation: 8 },
  customMarkerText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  customMarkerTextSelected: { fontSize: 13 },
  callout: {
    backgroundColor: '#fff', borderRadius: 14, padding: 12, minWidth: 130,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8,
    alignItems: 'center', gap: 6,
  },
  calloutZone: { fontSize: 13, fontWeight: '700', color: '#111827' },
  calloutAqiBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  calloutAqi: { color: '#fff', fontWeight: '700', fontSize: 13 },
  calloutLevel: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  advisory: {
    flexDirection: 'row', gap: 14, padding: 18, borderRadius: 20, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  advisoryIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  advisoryTitle: { fontWeight: '700', fontSize: 14, color: '#111827', marginBottom: 4 },
  advisoryText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4, gap: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyState: {
    backgroundColor: '#fff', borderRadius: 20, padding: 36, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  emptyIcon: {
    width: 72, height: 72, backgroundColor: '#eff6ff', borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '70%', paddingBottom: 32,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  modalItemActive: { backgroundColor: '#eff6ff' },
  modalItemText: { fontSize: 15, color: '#374151' },
  modalItemTextActive: { color: '#2563eb', fontWeight: '600' },
});
