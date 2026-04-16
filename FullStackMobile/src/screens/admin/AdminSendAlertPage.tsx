import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiSendAlert, apiGetCities, apiGetZones, Zone, AlertSeverity } from '../../utils/api';

const nashikZones = ['All Zones', 'Satpur', 'MIDC Industrial', 'Panchavati', 'Nashik Road', 'Cidco', 'College Road', 'Gangapur', 'Old Nashik', 'Deolali'];

const ALERT_TYPES = [
  { id: 'emergency', label: 'Emergency Alert', desc: 'Immediate danger — severe AQI > 400', color: '#dc2626', icon: 'skull-outline' },
  { id: 'warning', label: 'Health Warning', desc: 'Significant health risk — AQI 300-400', color: '#d97706', icon: 'warning-outline' },
  { id: 'advisory', label: 'Health Advisory', desc: 'Moderate concern — AQI 200-300', color: '#2563eb', icon: 'information-circle-outline' },
  { id: 'info', label: 'Information', desc: 'General awareness — AQI 100-200', color: '#059669', icon: 'megaphone-outline' },
];

const CHANNELS = [
  { id: 'push', label: 'Push Notifications', icon: 'phone-portrait-outline' },
  { id: 'sms', label: 'SMS Alerts', icon: 'chatbubble-outline' },
  { id: 'email', label: 'Email Alerts', icon: 'mail-outline' },
  { id: 'broadcast', label: 'Public Broadcast', icon: 'radio-outline' },
];

export default function AdminSendAlertPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedType, setSelectedType] = useState('warning');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({ push: true, sms: true, email: false, broadcast: false });
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const loadZones = async () => {
      try {
        const cities = await apiGetCities();
        if (cities.length > 0) {
          const z = await apiGetZones(cities[0].id);
          setZones(z);
        }
      } catch (_) {}
    };
    loadZones();
  }, []);

  const handleSend = async () => {
    if (!selectedZone || !message.trim()) {
      setSendError('Please select a zone and enter a message.');
      return;
    }
    setSending(true);
    setSendError('');
    try {
      await apiSendAlert({
        zone_id: selectedZone.id,
        message: message.trim(),
        severity: selectedType as AlertSeverity,
      });
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setSendError(err.message || 'Failed to send alert.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Alerts & Notifications</Text>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>3 Active</Text>
        </View>
      </View>

      {sent && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#059669" />
          <Text style={styles.successText}>Alert sent successfully!</Text>
        </View>
      )}

      {/* Alert Type */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alert Type</Text>
        {ALERT_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeRow, selectedType === type.id && styles.typeRowActive]}
            onPress={() => setSelectedType(type.id)}
          >
            <View style={[styles.typeIcon, { backgroundColor: type.color + '15' }]}>
              <Ionicons name={type.icon as any} size={18} color={type.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text style={styles.typeDesc}>{type.desc}</Text>
            </View>
            <View style={[styles.radio, selectedType === type.id && { borderColor: type.color }]}>
              {selectedType === type.id && <View style={[styles.radioDot, { backgroundColor: type.color }]} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Zone & Message */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Target Zone</Text>
        <TouchableOpacity style={styles.zoneSelector} onPress={() => setShowZonePicker(true)}>
          <Ionicons name="location-outline" size={18} color="#9ca3af" />
          <Text style={styles.zoneSelectorText}>{selectedZone?.zone_name ?? 'Select a zone...'}</Text>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <Text style={[styles.cardTitle, { marginTop: 16 }]}>Alert Message</Text>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter your alert message here..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length} / 500 characters</Text>
      </View>

      {/* Channels */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Channels</Text>
        {CHANNELS.map(ch => (
          <View key={ch.id} style={styles.channelRow}>
            <View style={styles.channelLeft}>
              <Ionicons name={ch.icon as any} size={20} color="#6b7280" />
              <Text style={styles.channelLabel}>{ch.label}</Text>
            </View>
            <Switch
              value={channels[ch.id as keyof typeof channels]}
              onValueChange={(v) => setChannels(prev => ({ ...prev, [ch.id]: v }))}
              trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
              thumbColor={channels[ch.id as keyof typeof channels] ? '#2563eb' : '#9ca3af'}
            />
          </View>
        ))}
      </View>

      {/* Error Banner */}
      {sendError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorBannerText}>{sendError}</Text>
        </View>
      ) : null}

      {/* Send Button */}
      <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending} activeOpacity={0.85}>
        {sending
          ? <ActivityIndicator color="#fff" />
          : (<>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <Text style={styles.sendBtnText}>Send Alert Now</Text>
            </>)
        }
      </TouchableOpacity>

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
              data={zones}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedZone?.id === item.id && styles.modalItemActive]}
                  onPress={() => { setSelectedZone(item); setShowZonePicker(false); }}
                >
                  <Text style={[styles.modalItemText, selectedZone?.id === item.id && { color: '#2563eb', fontWeight: '600' as const }]}>{item.zone_name}</Text>
                  {selectedZone?.id === item.id && <Ionicons name="checkmark" size={18} color="#2563eb" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef2f2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#fecaca' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  activeText: { fontSize: 11, color: '#dc2626', fontWeight: '700' },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7',
    borderRadius: 12, padding: 14,
  },
  successText: { fontSize: 14, color: '#065f46', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },
  typeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#f3f4f6', marginBottom: 8, backgroundColor: '#fafafa',
  },
  typeRowActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  typeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  typeDesc: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  zoneSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  zoneSelectorText: { flex: 1, fontSize: 14, color: '#111827' },
  messageInput: {
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    padding: 14, fontSize: 14, color: '#111827', minHeight: 110,
  },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 6 },
  channelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  channelLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  channelLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#ef4444', borderRadius: 14, paddingVertical: 18,
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  modalItemActive: { backgroundColor: '#eff6ff' },
  modalItemText: { fontSize: 15, color: '#374151' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 14,
  },
  errorBannerText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
