import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { nashikAreas, generateHourlyData, getAQICategory } from '../utils/aqiUtils';
import { apiGetAQIHistory } from '../utils/api';

interface GraphViewScreenProps {
  selectedArea: string;
  selectedDate: Date;
  onBack: () => void;
  onFilterDate: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AQI_LEGEND = [
  { level: 'Good', range: '0-50', color: '#22c55e' },
  { level: 'Satisfactory', range: '51-100', color: '#84cc16' },
  { level: 'Moderate', range: '101-200', color: '#eab308' },
  { level: 'Poor', range: '201-300', color: '#f97316' },
  { level: 'Very Poor', range: '301-400', color: '#ef4444' },
  { level: 'Severe', range: '401-500', color: '#991b1b' },
];

// Custom SVG bar chart — replaces victory-native
function AQIBarChart({ data }: { data: { x: string; y: number; color: string }[] }) {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 240;
  const padLeft = 40;
  const padBottom = 40;
  const padTop = 12;
  const padRight = 10;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padBottom - padTop;
  const count = data.length;
  const maxY = Math.max(...data.map(d => d.y), 1);

  const barWidth = Math.max(4, (innerW / count) * 0.55);
  const slotW = innerW / count;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), maxY];

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines & Y labels */}
      {yTicks.map((tick) => {
        const y = padTop + innerH - (tick / maxY) * innerH;
        return (
          <React.Fragment key={tick}>
            <Line
              x1={padLeft} y1={y}
              x2={chartWidth - padRight} y2={y}
              stroke="#f3f4f6" strokeWidth={1}
            />
            <SvgText x={padLeft - 4} y={y + 3} fontSize={9} fill="#6b7280" textAnchor="end">
              {tick}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max(2, (d.y / maxY) * innerH);
        const x = padLeft + i * slotW + (slotW - barWidth) / 2;
        const y = padTop + innerH - barH;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={barWidth} height={barH} fill={d.color} rx={2} />
            {/* Only render label when x has a value (every 3rd tick) */}
            {d.x !== '' && (
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight - 10}
                fontSize={8}
                fill="#6b7280"
                textAnchor="middle"
                rotation="-30"
                originX={x + barWidth / 2}
                originY={chartHeight - 10}
              >
                {d.x}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function GraphViewScreen({ selectedArea, selectedDate, onBack }: GraphViewScreenProps) {
  const area = nashikAreas.find(a => a.name === selectedArea) ?? nashikAreas[0];
  const [chartData, setChartData] = useState<{ x: string; y: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setUsingFallback(false);
      try {
        // Build date range: start = beginning of selectedDate, end = end of selectedDate
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        // We need a zone_id — use area index as fallback since we don't have real zone ID here
        const areaIndex = nashikAreas.findIndex(a => a.name === selectedArea);
        const zoneId = areaIndex >= 0 ? areaIndex + 1 : 1;

        const readings = await apiGetAQIHistory(zoneId, start.toISOString(), end.toISOString());
        if (readings.length > 0) {
          const mapped = readings.map((r, i) => ({
            x: i % 3 === 0 ? new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
            y: r.aqi_value,
            color: getAQICategory(r.aqi_value).color,
          }));
          setChartData(mapped);
        } else {
          throw new Error('No readings');
        }
      } catch {
        // Fallback to generated data
        setUsingFallback(true);
        const hourlyData = generateHourlyData(area.aqi);
        setChartData(hourlyData.map((d, i) => ({
          x: i % 3 === 0 ? d.time : '',
          y: d.aqi,
          color: getAQICategory(d.aqi).color,
        })));
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [selectedArea, selectedDate]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AQI vs Time</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Showing data for</Text>
          <Text style={styles.infoValue}>
            {selectedArea} • {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading history…</Text>
          </View>
        )}

        {/* Fallback notice */}
        {!isLoading && usingFallback && (
          <View style={styles.fallbackBanner}>
            <Ionicons name="information-circle-outline" size={15} color="#d97706" />
            <Text style={styles.fallbackText}>Showing simulated data — backend unavailable</Text>
          </View>
        )}

        {/* Bar Chart Card */}
        {!isLoading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hour-wise AQI</Text>
            <AQIBarChart data={chartData} />
          </View>
        )}

        {/* Legend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AQI Level Legend</Text>
          {AQI_LEGEND.map(item => (
            <View key={item.level} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLevel}>{item.level}</Text>
              <Text style={styles.legendRange}>{item.range}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  scrollContent: { padding: 20, paddingBottom: 100, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  legendDot: { width: 20, height: 20, borderRadius: 5 },
  legendLevel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  legendRange: { fontSize: 13, color: '#6b7280' },
  loadingBox: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6b7280' },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 12, padding: 12, marginBottom: 4,
  },
  fallbackText: { flex: 1, fontSize: 12, color: '#92400e', fontWeight: '500' },
});
