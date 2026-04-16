import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminHomePage from './AdminHomePage';
import AdminPredictionPage from './AdminPredictionPage';
import AdminSendAlertPage from './AdminSendAlertPage';
import AdminHistoricalPage from './AdminHistoricalPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminReportDownload from './AdminReportDownload';
import AdminMapPage from './AdminMapPage';

export type AdminPage = 'dashboard' | 'map' | 'predictions' | 'alerts' | 'historical' | 'settings';

interface AdminDashboardProps {
  onLogout: () => void;
}

const DRAWER_WIDTH = 260;
const ACTIVE_PAGE_KEY = '@admin_active_page';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',              icon: 'grid-outline',           iconActive: 'grid' },
  { id: 'map',         label: 'AQI Map',                icon: 'map-outline',            iconActive: 'map' },
  { id: 'predictions', label: 'AQI Predictions',        icon: 'trending-up-outline',    iconActive: 'trending-up' },
  { id: 'alerts',      label: 'Alerts & Notifications', icon: 'notifications-outline',  iconActive: 'notifications', badge: 3 },
  { id: 'historical',  label: 'Historical Data',        icon: 'time-outline',           iconActive: 'time' },
  { id: 'settings',    label: 'Settings',               icon: 'settings-outline',       iconActive: 'settings' },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCity] = useState('Nashik');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animated values
  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current; // drawer X offset
  const backdropAnim = useRef(new Animated.Value(0)).current;            // backdrop opacity
  const pageAnim    = useRef(new Animated.Value(1)).current;             // page fade

  // Load persisted active page on mount
  useEffect(() => {
    const loadActivePage = async () => {
      try {
        const saved = await AsyncStorage.getItem(ACTIVE_PAGE_KEY);
        if (saved) {
          setActivePage(saved as AdminPage);
        }
      } catch (error) {
        console.error('Failed to load active page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadActivePage();
  }, []);

  // Persist active page whenever it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(ACTIVE_PAGE_KEY, activePage).catch(console.error);
    }
  }, [activePage, isLoading]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ── Drawer helpers ─────────────────────────── */
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
      if (callback) callback();
    });
  };

  /* ── Page navigation with fade transition ─── */
  const navigate = (id: string) => {
    if (id === activePage) { closeDrawer(); return; }
    closeDrawer(() => {
      // Fade out → switch page → fade in
      Animated.timing(pageAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setActivePage(id as AdminPage);
        Animated.timing(pageAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  const activeLabel = NAV_ITEMS.find(n => n.id === activePage)?.label || 'Dashboard';

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':   return <AdminHomePage onSendAlert={() => navigate('alerts')} />;
      case 'map':         return <AdminMapPage />;
      case 'predictions': return <AdminPredictionPage />;
      case 'alerts':      return <AdminSendAlertPage />;
      case 'historical':  return <AdminHistoricalPage />;
      case 'settings':    return <AdminSettingsPage />;
      default:            return <AdminHomePage onSendAlert={() => navigate('alerts')} />;
    }
  };

  /* ── Drawer content component ─────────────── */
  const DrawerContent = () => (
    <View style={styles.drawerInner}>
      {/* Logo — padded for status bar */}
      <View style={[styles.drawerLogo, { paddingTop: insets.top + 14 }]}>
        <View style={styles.drawerLogoIcon}>
          <Ionicons name="shield-outline" size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.drawerLogoTitle}>AQI Control</Text>
          <Text style={styles.drawerLogoSub}>Nashik Smart City</Text>
        </View>
      </View>

      <Text style={styles.navSectionLabel}>Navigation</Text>

      <ScrollView style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => navigate(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? item.iconActive : item.icon) as any}
                size={18}
                color={isActive ? '#fbbf24' : '#94a3b8'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* System Status */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>System Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All Sensors Online</Text>
        </View>
        <Text style={styles.statusMeta}>Last sync: 2 min ago</Text>
      </View>

      {/* Report Download */}
      <AdminReportDownload selectedCity={selectedCity} />

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, { paddingBottom: insets.bottom + 8 }]} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* ── Drawer overlay (Modal) ─────────────────── */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}
        statusBarTranslucent
      >
        <View style={styles.drawerOverlay}>

          {/* Drawer slides in from LEFT */}
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <DrawerContent />
          </Animated.View>

          {/* Backdrop — tapping closes the drawer */}
          <Animated.View
            style={[styles.drawerBackdropWrap, { opacity: backdropAnim }]}
            pointerEvents="box-only"
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => closeDrawer()}
              activeOpacity={1}
            />
          </Animated.View>

        </View>
      </Modal>

      {/* ── Top header ────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
            <Ionicons name="menu" size={22} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{activeLabel}</Text>
            <Text style={styles.headerSub}>Smart City AQI Monitoring</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigate('alerts')} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        </View>
      </View>

      {/* ── Page content (fades on navigation) ──── */}
      <Animated.View style={[styles.pageContent, { opacity: pageAnim }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {renderContent()}
        </ScrollView>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuBtn:     { padding: 6 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  headerSub:   { fontSize: 10, color: '#9ca3af', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeBox:     { backgroundColor: '#f9fafb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#e5e7eb' },
  timeText:    { fontSize: 11, color: '#374151', fontWeight: '600' },
  bellBtn:     { position: 'relative', padding: 6 },
  bellDot:     { position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#fff' },
  adminAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },

  /* Page content */
  pageContent: { flex: 1 },

  /* Drawer overlay */
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#1e293b',
    height: '100%',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerBackdropWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  /* Drawer inner */
  drawerInner:     { flex: 1 },
  drawerLogo:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  drawerLogoIcon:  { width: 36, height: 36, borderRadius: 9, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },
  drawerLogoTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  drawerLogoSub:   { color: '#94a3b8', fontSize: 11 },
  navSectionLabel: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 },
  navItem:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, marginHorizontal: 8, borderRadius: 8, marginBottom: 2 },
  navItemActive:   { backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  navLabel:        { flex: 1, fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  navLabelActive:  { color: '#fbbf24', fontWeight: '600' },
  badge:           { backgroundColor: '#ef4444', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText:       { color: '#fff', fontSize: 10, fontWeight: '700' },
  statusBox:       { marginHorizontal: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 },
  statusTitle:     { fontSize: 11, color: '#64748b', marginBottom: 6 },
  statusRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText:      { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  statusMeta:      { fontSize: 10, color: '#64748b', marginTop: 4 },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8, borderRadius: 8 },
  logoutText:      { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
});
