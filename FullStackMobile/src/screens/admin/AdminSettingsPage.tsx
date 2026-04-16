import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminSettingsPage() {
  const [alerts, setAlerts] = useState({
    pushNotif: true,
    emailAlerts: true,
    smsAlerts: false,
    autoAlert: true,
    dailyReport: true,
  });
  const [thresholds, setThresholds] = useState({
    poor: '200',
    veryPoor: '300',
    severe: '400',
  });
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@nashik.gov.in');

  const toggle = (key: keyof typeof alerts) => setAlerts(prev => ({ ...prev, [key]: !prev[key] }));

  const SwitchRow = ({ label, desc, value, onToggle }: any) => (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.switchLabel}>{label}</Text>
        {desc && <Text style={styles.switchDesc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
        thumbColor={value ? '#2563eb' : '#9ca3af'}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Profile */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Admin Profile</Text>
        <View style={styles.profilePic}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput style={styles.fieldInput} value={adminName} onChangeText={setAdminName} />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Official Email</Text>
          <TextInput style={styles.fieldInput} value={adminEmail} onChangeText={setAdminEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SwitchRow label="Push Notifications" desc="Receive alerts on your device" value={alerts.pushNotif} onToggle={() => toggle('pushNotif')} />
        <SwitchRow label="Email Alerts" desc="Send alerts to official email" value={alerts.emailAlerts} onToggle={() => toggle('emailAlerts')} />
        <SwitchRow label="SMS Alerts" desc="Text message alerts" value={alerts.smsAlerts} onToggle={() => toggle('smsAlerts')} />
        <SwitchRow label="Auto-Alert on Threshold" desc="Automatically alert when AQI crosses threshold" value={alerts.autoAlert} onToggle={() => toggle('autoAlert')} />
        <SwitchRow label="Daily Report Email" desc="Receive daily AQI summary" value={alerts.dailyReport} onToggle={() => toggle('dailyReport')} />
      </View>

      {/* AQI Thresholds */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AQI Alert Thresholds</Text>
        <Text style={styles.thresholdNote}>Set the AQI values that trigger automatic alerts</Text>
        {[
          { key: 'poor', label: '⚠ Poor Threshold', color: '#f97316' },
          { key: 'veryPoor', label: '🔴 Very Poor Threshold', color: '#ef4444' },
          { key: 'severe', label: '☠ Severe Threshold', color: '#991b1b' },
        ].map(t => (
          <View key={t.key} style={styles.thresholdRow}>
            <Text style={[styles.thresholdLabel, { color: t.color }]}>{t.label}</Text>
            <View style={styles.thresholdInputWrap}>
              <TextInput
                style={styles.thresholdInput}
                value={thresholds[t.key as keyof typeof thresholds]}
                onChangeText={(v) => setThresholds(prev => ({ ...prev, [t.key]: v }))}
                keyboardType="numeric"
              />
              <Text style={styles.thresholdUnit}>AQI</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Update Thresholds</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Clear Cache', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive' }])}>
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.dangerBtnText}>Clear All Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Reset Settings', 'This will reset all settings to defaults.', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive' }])}>
          <Ionicons name="refresh-outline" size={16} color="#dc2626" />
          <Text style={styles.dangerBtnText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 16 },
  profilePic: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#d97706',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  switchLabel: { fontSize: 14, color: '#111827', fontWeight: '500' },
  switchDesc: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  thresholdNote: { fontSize: 12, color: '#9ca3af', marginBottom: 14, marginTop: -8 },
  thresholdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  thresholdLabel: { fontSize: 13, fontWeight: '600' },
  thresholdInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  thresholdInput: {
    width: 70, backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, fontWeight: '700', color: '#111827',
    textAlign: 'center',
  },
  thresholdUnit: { fontSize: 11, color: '#6b7280' },
  dangerCard: { borderWidth: 1, borderColor: '#fecaca' },
  dangerTitle: { fontSize: 14, fontWeight: '700', color: '#dc2626', marginBottom: 14 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 14, marginBottom: 8, backgroundColor: '#fef2f2',
  },
  dangerBtnText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },
});
