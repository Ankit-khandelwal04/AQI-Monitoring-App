import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home-outline' as const, iconActive: 'home' as const },
  { id: 'graph', label: 'Graph', icon: 'bar-chart-outline' as const, iconActive: 'bar-chart' as const },
  { id: 'table', label: 'Table', icon: 'document-text-outline' as const, iconActive: 'document-text' as const },
];

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.tab}
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeBar} />}
            <Ionicons
              name={isActive ? item.iconActive : item.icon}
              size={24}
              color={isActive ? '#2563eb' : '#9ca3af'}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 24 : 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 8, paddingBottom: 6, position: 'relative' },
  activeBar: {
    position: 'absolute', top: 0, left: 12, right: 12, height: 3,
    backgroundColor: '#2563eb', borderBottomLeftRadius: 999, borderBottomRightRadius: 999,
  },
  label: { fontSize: 11, marginTop: 4 },
  labelActive: { color: '#2563eb', fontWeight: '700' },
  labelInactive: { color: '#9ca3af', fontWeight: '500' },
});
