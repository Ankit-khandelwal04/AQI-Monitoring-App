import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const nashikZones = ['Cidco', 'Nashik Road', 'College Road', 'Gangapur Road', 'Satpur', 'Panchavati'];

type TimePeriod = '1month' | '3months' | '6months' | '1year';

const TIME_PERIODS = [
  { id: '1month' as TimePeriod, label: '1 Month', months: 1 },
  { id: '3months' as TimePeriod, label: '3 Months', months: 3 },
  { id: '6months' as TimePeriod, label: '6 Months', months: 6 },
  { id: '1year' as TimePeriod, label: '1 Year', months: 12 },
];

const generateHistory = (baseAqi: number, monthCount: number) => {
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth(); // 0-11
  const months: string[] = [];
  
  // Generate month labels going backwards from current month
  for (let i = monthCount - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    months.push(allMonths[monthIndex]);
  }
  
  return months.map((m, i) => ({
    x: i + 1,
    y: Math.round(baseAqi + (Math.random() * 60 - 30)),
    month: m,
  }));
};

const pollutantHistory = (monthCount: number) => {
  const generateTrend = (base: number) => {
    return Array.from({ length: monthCount }, () => 
      Math.round((base + (Math.random() * 20 - 10)) * 10) / 10
    );
  };
  
  return [
    { name: 'PM2.5', trend: generateTrend(38), color: '#ef4444' },
    { name: 'PM10', trend: generateTrend(55), color: '#f97316' },
    { name: 'NO₂', trend: generateTrend(40), color: '#eab308' },
    { name: 'CO', trend: generateTrend(1.3), color: '#8b5cf6' },
  ];
};

const getMonthLabels = (monthCount: number) => {
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const months: string[] = [];
  
  for (let i = monthCount - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    months.push(allMonths[monthIndex]);
  }
  
  return months;
};

// Custom SVG Bar Chart — no victory-native dependency
function BarChart({ data }: { data: { y: number; month: string }[] }) {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 180;
  const paddingLeft = 38;
  const paddingBottom = 30;
  const paddingTop = 10;
  const paddingRight = 10;

  const innerW = chartWidth - paddingLeft - paddingRight;
  const innerH = chartHeight - paddingBottom - paddingTop;
  const maxY = Math.max(...data.map(d => d.y), 1);
  const barCount = data.length;
  const barWidth = (innerW / barCount) * 0.55;
  const gap = innerW / barCount;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), maxY];

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Y-axis grid lines & labels */}
      {yTicks.map((tick) => {
        const y = paddingTop + innerH - (tick / maxY) * innerH;
        return (
          <React.Fragment key={tick}>
            <Line
              x1={paddingLeft}
              y1={y}
              x2={chartWidth - paddingRight}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
            <SvgText
              x={paddingLeft - 4}
              y={y + 3}
              fontSize={9}
              fill="#9ca3af"
              textAnchor="end"
            >
              {tick}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max(2, (d.y / maxY) * innerH);
        const x = paddingLeft + i * gap + (gap - barWidth) / 2;
        const y = paddingTop + innerH - barH;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill="#d97706"
              rx={3}
            />
            <SvgText
              x={x + barWidth / 2}
              y={chartHeight - 8}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.month}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function AdminHistoricalPage() {
  const [selectedZone, setSelectedZone] = useState('Cidco');
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6months');

  const selectedPeriod = TIME_PERIODS.find(p => p.id === timePeriod)!;
  
  // Memoize data generation so it doesn't change on every render
  const historyData = useMemo(() => {
    const baseAqi = 120;
    return generateHistory(baseAqi, selectedPeriod.months);
  }, [selectedPeriod.months, selectedZone]);
  
  const pollutants = useMemo(() => {
    return pollutantHistory(selectedPeriod.months);
  }, [selectedPeriod.months, selectedZone]);
  
  const monthLabels = useMemo(() => {
    return getMonthLabels(selectedPeriod.months);
  }, [selectedPeriod.months]);
  
  const avgAqi = useMemo(() => {
    return Math.round(historyData.reduce((s, d) => s + d.y, 0) / historyData.length);
  }, [historyData]);
  
  const maxAqi = useMemo(() => {
    return Math.max(...historyData.map(d => d.y));
  }, [historyData]);
  
  const minAqi = useMemo(() => {
    return Math.min(...historyData.map(d => d.y));
  }, [historyData]);
  
  // Memoize table data with stable peak values
  const tableData = useMemo(() => {
    return historyData.map((d, i) => ({
      month: monthLabels[i],
      avgAqi: d.y,
      peakAqi: d.y + Math.round(Math.random() * 20), // Generate once and cache
      category: d.y <= 50 ? { color: '#22c55e', label: 'Good' }
        : d.y <= 100 ? { color: '#84cc16', label: 'Satisfactory' }
        : d.y <= 200 ? { color: '#eab308', label: 'Moderate' }
        : d.y <= 300 ? { color: '#f97316', label: 'Poor' }
        : { color: '#ef4444', label: 'Very Poor' }
    }));
  }, [historyData, monthLabels]);
  
  // Calculate date range for subtitle
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - selectedPeriod.months + 1);
    
    const formatMonth = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    return `${formatMonth(startDate)} – ${formatMonth(now)}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Historical Data</Text>
          <Text style={styles.pageSub}>{selectedPeriod.label} AQI archive · {getDateRange()}</Text>
        </View>
        <TouchableOpacity style={styles.zoneSelector} onPress={() => setShowZonePicker(true)}>
          <Ionicons name="location-outline" size={14} color="#9ca3af" />
          <Text style={styles.zoneSelectorText}>{selectedZone}</Text>
          <Ionicons name="chevron-down" size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        <Text style={styles.periodLabel}>Time Period:</Text>
        <View style={styles.periodButtons}>
          {TIME_PERIODS.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                timePeriod === period.id && styles.periodButtonActive
              ]}
              onPress={() => setTimePeriod(period.id)}
            >
              <Text style={[
                styles.periodButtonText,
                timePeriod === period.id && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Average AQI', value: avgAqi, color: '#d97706', icon: 'analytics-outline' },
          { label: 'Peak AQI', value: maxAqi, color: '#dc2626', icon: 'trending-up-outline' },
          { label: 'Best AQI', value: minAqi, color: '#059669', icon: 'trending-down-outline' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={16} color={s.color} />
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Monthly AQI Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Average AQI — {selectedZone}</Text>
        <BarChart data={historyData} />
      </View>

      {/* Pollutant Trend Lines (mini bars) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pollutant Trends (µg/m³)</Text>
        {pollutants.map(p => (
          <View key={p.name} style={styles.pollutantRow}>
            <View style={styles.pollutantMeta}>
              <View style={[styles.pollutantDot, { backgroundColor: p.color }]} />
              <Text style={styles.pollutantName}>{p.name}</Text>
              <Text style={styles.pollutantLast}>{p.trend[p.trend.length - 1]}</Text>
            </View>
            <View style={styles.miniChart}>
              {p.trend.map((v, i) => {
                const max = Math.max(...p.trend);
                const min = Math.min(...p.trend);
                const pct = max === min ? 0.5 : (v - min) / (max - min);
                return (
                  <View key={i} style={[styles.miniBar, { height: Math.max(6, pct * 36), backgroundColor: p.color + '90' }]} />
                );
              })}
            </View>
          </View>
        ))}
        <View style={styles.monthsRow}>
          {monthLabels.map(m => <Text key={m} style={styles.monthLabel}>{m}</Text>)}
        </View>
      </View>

      {/* Monthly Table */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Month-wise Summary</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Month</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Avg AQI</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Peak AQI</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Category</Text>
        </View>
        {tableData.map((row, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{row.month}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>{row.avgAqi}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{row.peakAqi}</Text>
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
              <View style={[styles.catBadge, { backgroundColor: row.category.color + '20' }]}>
                <Text style={[styles.catBadgeText, { color: row.category.color }]}>{row.category.label}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Zone Modal */}
      <Modal visible={showZonePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Zone</Text>
              <TouchableOpacity onPress={() => setShowZonePicker(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>
            <FlatList data={nashikZones} keyExtractor={i => i} renderItem={({ item }) => (
              <TouchableOpacity style={[styles.modalItem, selectedZone === item && styles.modalItemActive]} onPress={() => { setSelectedZone(item); setShowZonePicker(false); }}>
                <Text style={[styles.modalItemText, selectedZone === item && { color: '#2563eb', fontWeight: '600' }]}>{item}</Text>
                {selectedZone === item && <Ionicons name="checkmark" size={18} color="#2563eb" />}
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  pageSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  zoneSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  zoneSelectorText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  periodSelector: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 3, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 14 },
  pollutantRow: { marginBottom: 12 },
  pollutantMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  pollutantDot: { width: 10, height: 10, borderRadius: 5 },
  pollutantName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  pollutantLast: { fontSize: 13, fontWeight: '700', color: '#374151' },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 44 },
  miniBar: { flex: 1, borderRadius: 3, minWidth: 8 },
  monthsRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  monthLabel: { flex: 1, fontSize: 9, color: '#9ca3af', textAlign: 'center' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4 },
  tableHeaderCell: { fontSize: 10, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tableRowAlt: { backgroundColor: '#fafafa' },
  tableCell: { fontSize: 13, color: '#374151' },
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  modalItemActive: { backgroundColor: '#eff6ff' },
  modalItemText: { fontSize: 15, color: '#374151' },
});
