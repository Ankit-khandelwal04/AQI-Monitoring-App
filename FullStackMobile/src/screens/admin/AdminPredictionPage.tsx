import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const generateData = (hours: number) => {
  const base = [
    { time: '00:00', current: 156, predicted: 160 },
    { time: '02:00', current: 162, predicted: 167 },
    { time: '04:00', current: 178, predicted: 175 },
    { time: '06:00', current: 185, predicted: 190 },
    { time: '08:00', current: 198, predicted: 205 },
    { time: '10:00', current: 210, predicted: 218 },
    { time: '12:00', current: 225, predicted: 230 },
    { time: '14:00', current: 218, predicted: 222 },
    { time: '16:00', current: null, predicted: 210 },
    { time: '18:00', current: null, predicted: 218 },
    { time: '20:00', current: null, predicted: 215 },
    { time: '22:00', current: null, predicted: 205 },
  ];
  const sliceCount = hours === 6 ? 6 : hours === 12 ? 9 : 12;
  return base.slice(0, sliceCount);
};

const pollutantContributions = [
  { name: 'PM2.5', value: 38, color: '#ef4444', description: 'Fine particulate matter' },
  { name: 'PM10', value: 25, color: '#f97316', description: 'Coarse particulate matter' },
  { name: 'NO₂', value: 15, color: '#eab308', description: 'Nitrogen Dioxide' },
  { name: 'O₃', value: 11, color: '#22c55e', description: 'Ozone' },
  { name: 'SO₂', value: 7, color: '#3b82f6', description: 'Sulphur Dioxide' },
  { name: 'CO', value: 4, color: '#8b5cf6', description: 'Carbon Monoxide' },
];

const nashikZones = ['Satpur', 'MIDC Industrial', 'Panchavati', 'Nashik Road', 'Cidco', 'College Road', 'Gangapur', 'Old Nashik', 'Deolali'];

// Custom SVG line chart — no victory-native dependency
function LineChart({
  actualData,
  predictedData,
  timeLabels,
}: {
  actualData: (number | null)[];
  predictedData: number[];
  timeLabels: string[];
}) {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 200;
  const padLeft = 40;
  const padBottom = 36;
  const padTop = 12;
  const padRight = 12;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padBottom - padTop;
  const count = predictedData.length;

  const allVals = [...predictedData, ...actualData.filter((v): v is number => v !== null)];
  const minY = Math.max(0, Math.min(...allVals) - 20);
  const maxY = Math.max(...allVals) + 20;

  const toX = (i: number) => padLeft + (i / Math.max(count - 1, 1)) * innerW;
  const toY = (v: number) => padTop + innerH - ((v - minY) / (maxY - minY)) * innerH;

  // Build polyline points strings
  const predictedPoints = predictedData.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  const actualSegments: string[] = [];
  let segment: string[] = [];
  actualData.forEach((v, i) => {
    if (v !== null) {
      segment.push(`${toX(i)},${toY(v)}`);
    } else {
      if (segment.length > 1) actualSegments.push(segment.join(' '));
      segment = [];
    }
  });
  if (segment.length > 1) actualSegments.push(segment.join(' '));

  // Y-axis ticks
  const yTicks = [minY, Math.round((minY + maxY) / 2), maxY];
  // X-axis: show every other label to avoid overlap
  const xLabels = timeLabels.filter((_, i) => i % 2 === 0);
  const xLabelIndices = timeLabels.map((_, i) => i).filter(i => i % 2 === 0);

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Y-axis grid lines & labels */}
      {yTicks.map((tick) => {
        const y = toY(tick);
        return (
          <React.Fragment key={tick}>
            <Line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <SvgText x={padLeft - 4} y={y + 3} fontSize={9} fill="#94a3b8" textAnchor="end">{tick}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Predicted line (orange) */}
      <Polyline points={predictedPoints} fill="none" stroke="#f97316" strokeWidth={2.5} />

      {/* Actual lines (blue, may be multiple segments) */}
      {actualSegments.map((pts, idx) => (
        <Polyline key={idx} points={pts} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      ))}

      {/* Dots on predicted */}
      {predictedData.map((v, i) => (
        <Circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="#f97316" />
      ))}

      {/* Dots on actual */}
      {actualData.map((v, i) =>
        v !== null ? <Circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="#3b82f6" /> : null
      )}

      {/* X-axis labels */}
      {xLabelIndices.map((idx, k) => (
        <SvgText
          key={k}
          x={toX(idx)}
          y={chartHeight - 6}
          fontSize={8}
          fill="#94a3b8"
          textAnchor="middle"
        >
          {xLabels[k]}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function AdminPredictionPage() {
  const [selectedZone, setSelectedZone] = useState('Satpur');
  const [predHours, setPredHours] = useState<6 | 12 | 24>(24);

  const chartData = generateData(predHours);

  const actualData = chartData.map(d => d.current);
  const predictedData = chartData.map(d => d.predicted);
  const timeLabels = chartData.map(d => d.time);

  const peakPredicted = Math.max(...predictedData);

  const getRisk = (aqi: number) => {
    if (aqi <= 100) return { label: 'Satisfactory', color: '#22c55e' };
    if (aqi <= 200) return { label: 'Moderate', color: '#eab308' };
    if (aqi <= 300) return { label: 'Poor', color: '#f97316' };
    return { label: 'Very Poor', color: '#ef4444' };
  };
  const risk = getRisk(peakPredicted);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>AQI Predictions</Text>
          <Text style={styles.pageSub}>ML-based forecasting · LSTM Model v2.1</Text>
        </View>
        <View style={styles.modelBadge}>
          <Ionicons name="bulb-outline" size={14} color="#3b82f6" />
          <Text style={styles.modelBadgeText}>89.4% Accuracy</Text>
        </View>
      </View>

      {/* Zone Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zonePillScroll}>
        {nashikZones.map(z => (
          <TouchableOpacity
            key={z}
            style={[styles.zonePill, selectedZone === z && styles.zonePillActive]}
            onPress={() => setSelectedZone(z)}
          >
            <Text style={[styles.zonePillText, selectedZone === z && styles.zonePillTextActive]}>{z}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>AQI Trend — {selectedZone}</Text>
            <Text style={styles.cardSub}>Current vs ML-Predicted AQI</Text>
          </View>
          <View style={styles.hToggleGroup}>
            {([6, 12, 24] as const).map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.hToggle, predHours === h && styles.hToggleActive]}
                onPress={() => setPredHours(h)}
              >
                <Text style={[styles.hToggleText, predHours === h && styles.hToggleTextActive]}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LineChart actualData={actualData} predictedData={predictedData} timeLabels={timeLabels} />

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>Actual AQI</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#f97316' }]} />
            <Text style={styles.legendText}>Predicted (ML)</Text>
          </View>
        </View>
      </View>

      {/* Prediction Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prediction Summary</Text>
        <View style={styles.peakBox}>
          <Text style={styles.peakLabel}>Expected Peak AQI</Text>
          <Text style={styles.peakValue}>{peakPredicted}</Text>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + '20' }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>
        <View style={styles.suggestionBox}>
          <Ionicons name="warning-outline" size={16} color="#d97706" />
          <Text style={styles.suggestionText}>
            Issue public health advisory. Restrict industrial emissions in {selectedZone}. Monitor PM2.5 levels continuously.
          </Text>
        </View>
      </View>

      {/* Feature Importance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pollutant Contribution (ML Feature Importance)</Text>
        {pollutantContributions.map(p => (
          <View key={p.name} style={styles.featureRow}>
            <View style={styles.featureNameRow}>
              <Text style={styles.featureName}>{p.name}</Text>
              <Text style={styles.featureDesc}>{p.description}</Text>
              <Text style={[styles.featurePct, { color: p.color }]}>{p.value}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${p.value}%` as any, backgroundColor: p.color }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  pageSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  modelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  modelBadgeText: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
  zonePillScroll: { flexGrow: 0 },
  zonePill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8,
    backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb',
  },
  zonePillActive: { backgroundColor: '#d97706', borderColor: '#d97706' },
  zonePillText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  zonePillTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardSub: { fontSize: 11, color: '#9ca3af' },
  hToggleGroup: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 },
  hToggle: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  hToggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  hToggleText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  hToggleTextActive: { color: '#d97706' },
  legendRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendLine: { width: 20, height: 3, borderRadius: 2 },
  legendText: { fontSize: 11, color: '#6b7280' },
  peakBox: {
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  peakLabel: { fontSize: 11, color: '#ef4444', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  peakValue: { fontSize: 36, fontWeight: '800', color: '#dc2626', lineHeight: 44 },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginTop: 4 },
  riskText: { fontSize: 12, fontWeight: '700' },
  suggestionBox: {
    flexDirection: 'row', gap: 10, backgroundColor: '#fffbeb',
    borderWidth: 1, borderColor: '#fde68a', borderRadius: 10, padding: 12,
  },
  suggestionText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  featureRow: { marginBottom: 14 },
  featureNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  featureDesc: { flex: 1, fontSize: 11, color: '#9ca3af', marginLeft: 8 },
  featurePct: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
});
