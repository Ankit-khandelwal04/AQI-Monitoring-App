import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getToken } from '../../utils/api';

interface AdminReportDownloadProps {
  selectedCity: string;
}

const REPORT_TYPES = [
  { id: 'daily', label: 'Daily Report', desc: 'Last 24h AQI summary', icon: 'document-text-outline' },
  { id: 'weekly', label: 'Weekly Report', desc: 'Last 7 days analysis', icon: 'calendar-outline' },
  { id: 'monthly', label: 'Monthly Report', desc: 'Full month breakdown', icon: 'bar-chart-outline' },
];

const SELECTED_REPORT_KEY = '@admin_selected_report';

export default function AdminReportDownload({ selectedCity }: AdminReportDownloadProps) {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load persisted report type on mount
  useEffect(() => {
    const loadReportType = async () => {
      try {
        const saved = await AsyncStorage.getItem(SELECTED_REPORT_KEY);
        if (saved) {
          setSelectedReport(saved);
        }
      } catch (error) {
        console.error('Failed to load report type:', error);
      }
    };
    loadReportType();
  }, []);

  // Persist report type whenever it changes
  const handleReportSelect = async (reportId: string) => {
    setSelectedReport(reportId);
    try {
      await AsyncStorage.setItem(SELECTED_REPORT_KEY, reportId);
    } catch (error) {
      console.error('Failed to save report type:', error);
    }
  };

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    
    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        setIsGenerating(false);
        return;
      }

      // Build URL with format=excel parameter
      const url = `${BASE_URL}/reports/generate?city=${encodeURIComponent(selectedCity)}&report_type=${selectedReport}&format=excel`;
      
      if (Platform.OS === 'web') {
        // Web: Download using fetch and blob
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to generate report');
        }

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `AQI_Report_${selectedCity}_${selectedReport}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Convert response to blob
        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        Alert.alert(
          'Success',
          `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} report downloaded successfully!`
        );
      } else {
        // Mobile: Show alert (file download on mobile requires additional setup)
        Alert.alert(
          'Report Generated',
          `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} report for ${selectedCity} has been generated.\n\nNote: Excel download is currently supported on web only. Mobile download coming soon!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Report download error:', error);
      Alert.alert('Error', error.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="download-outline" size={16} color="#d97706" />
        <Text style={styles.title}>Download Report</Text>
      </View>

      {REPORT_TYPES.map(r => (
        <TouchableOpacity
          key={r.id}
          style={[styles.reportOption, selectedReport === r.id && styles.reportOptionActive]}
          onPress={() => handleReportSelect(r.id)}
          disabled={isGenerating}
        >
          <Ionicons name={r.icon as any} size={16} color={selectedReport === r.id ? '#d97706' : '#6b7280'} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportLabel, selectedReport === r.id && styles.reportLabelActive]}>{r.label}</Text>
            <Text style={styles.reportDesc}>{r.desc}</Text>
          </View>
          {selectedReport === r.id && <Ionicons name="checkmark-circle" size={16} color="#d97706" />}
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.downloadBtn, isGenerating && styles.downloadBtnDisabled]} 
        onPress={handleDownload} 
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.downloadBtnText}>Generating...</Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-download-outline" size={14} color="#fff" />
            <Text style={styles.downloadBtnText}>Download Excel</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  title: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  reportOption: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 4,
  },
  reportOptionActive: { backgroundColor: 'rgba(217, 119, 6, 0.15)' },
  reportLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  reportLabelActive: { color: '#fbbf24', fontWeight: '600' },
  reportDesc: { fontSize: 10, color: '#64748b', marginTop: 1 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#d97706', borderRadius: 8, paddingVertical: 10, marginTop: 6,
  },
  downloadBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  downloadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
