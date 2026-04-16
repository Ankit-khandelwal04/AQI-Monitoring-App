/**
 * api.ts — Central API client for the AQI Monitoring Backend
 * Base URL is configured via environment variables
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ── Config ──────────────────────────────────────────────────────────────────
// Get API URL from environment variables with fallback
// Priority: EXPO_PUBLIC_API_URL > localhost
const getApiUrl = (): string => {
  // Try to get from environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback for development
  // For web: use localhost
  // For mobile: use the machine's IP (update this when WiFi changes)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Web environment
    return 'http://localhost:8000';
  } else {
    // Mobile environment - update this IP when switching networks
    return 'http://192.168.148.173:8000';
  }
};

export const BASE_URL = getApiUrl();

// Log the API URL for debugging (only in development)
if (__DEV__) {
  console.log('🌐 API Base URL:', BASE_URL);
}

// ── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = '@aqi_token';
export const USER_KEY  = '@aqi_user';

export const saveToken = async (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken  = async () => AsyncStorage.getItem(TOKEN_KEY);
export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};
export const saveUser  = async (user: any) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser   = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

// ── Core fetch wrapper ───────────────────────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  auth?: boolean;   // whether to attach JWT; defaults to true
}

export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${BASE_URL}${path}`;
    
    // Log request in development
    if (__DEV__) {
      console.log(`📡 ${method} ${url}`);
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      // FastAPI validation errors come as { detail: [...] }
      const detail = json?.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((d: any) => d.msg).join(', '));
      }
      throw new Error(detail || json?.message || 'Request failed');
    }

    return json;
  } catch (error: any) {
    // Enhanced error handling
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      throw new Error(
        `Cannot connect to backend at ${BASE_URL}. ` +
        `Please ensure:\n` +
        `1. Backend is running\n` +
        `2. IP address is correct (check .env file)\n` +
        `3. You're on the same WiFi network`
      );
    }
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ── AUTH ─────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

/**
 * POST /auth/register
 * Registers a new user. role defaults to 'user'; pass 'admin' for admin signup.
 */
export async function apiRegister(params: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}): Promise<LoginResponse> {
  // Backend returns { status, data: { access_token, user } } from register
  // Actually it returns UserResponse (no token) — we login right after
  const res = await request('/auth/register', {
    method: 'POST',
    body: { name: params.name, email: params.email, password: params.password, role: params.role || 'user' },
    auth: false,
  });
  // After register, automatically log in to get a token
  return apiLogin({ email: params.email, password: params.password });
}

/**
 * POST /auth/login
 */
export async function apiLogin(params: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email: params.email, password: params.password },
    auth: false,
  });
  await saveToken(res.access_token);
  await saveUser(res.user);
  return res;
}

/**
 * GET /auth/me
 */
export async function apiMe(): Promise<UserProfile> {
  const res = await request<{ data: UserProfile }>('/auth/me');
  return res.data;
}

// ────────────────────────────────────────────────────────────────────────────
// ── AQI ──────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export interface AQICurrentData {
  zone_id: number;
  zone_name: string;
  city_name: string;
  aqi_value: number;
  classification: { level: string; color: string; color_code: string };
  pollutants: { pm25?: number; pm10?: number; no2?: number; so2?: number; co?: number; o3?: number };
  timestamp: string;
}

/**
 * GET /aqi/current?city=Nashik&zone=Cidco
 */
export async function apiGetCurrentAQI(city: string, zone: string): Promise<AQICurrentData> {
  const res = await request<{ data: AQICurrentData }>(
    `/aqi/current?city=${encodeURIComponent(city)}&zone=${encodeURIComponent(zone)}`
  );
  return res.data;
}

export interface AQIHistoryPoint {
  timestamp: string;
  aqi_value: number;
  pm25?: number; pm10?: number; no2?: number; so2?: number; co?: number; o3?: number;
}

/**
 * GET /aqi/history?zone_id=1&start_date=...&end_date=...
 */
export async function apiGetAQIHistory(
  zoneId: number,
  startDate?: string,
  endDate?: string
): Promise<AQIHistoryPoint[]> {
  let url = `/aqi/history?zone_id=${zoneId}`;
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
  if (endDate)   url += `&end_date=${encodeURIComponent(endDate)}`;
  const res = await request<{ data: { readings: AQIHistoryPoint[] } }>(url);
  return res.data?.readings ?? [];
}

/**
 * POST /aqi/predict
 */
export async function apiPredictAQI(zoneId: number, hours = 24) {
  const res = await request<{ data: any }>('/aqi/predict', {
    method: 'POST',
    body: { zone_id: zoneId, hours },
  });
  return res.data;
}

// ────────────────────────────────────────────────────────────────────────────
// ── ZONES / CITIES ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export interface City {
  id: number;
  city_name: string;
  latitude: number;
  longitude: number;
}

export interface Zone {
  id: number;
  city_id: number;
  zone_name: string;
  geojson_polygon?: any;
  created_at: string;
}

export interface GeoJSONZone {
  type: string;
  properties: {
    zone_id: number;
    zone_name: string;
    aqi_value: number;
    level: string;
    color: string;
    color_code: string;
  };
  geometry?: any;
}

/**
 * GET /cities
 */
export async function apiGetCities(): Promise<City[]> {
  const res = await request<{ data: City[] }>('/cities');
  return res.data ?? [];
}

/**
 * GET /zones/:city_id
 */
export async function apiGetZones(cityId: number): Promise<Zone[]> {
  const res = await request<{ data: Zone[] }>(`/zones/${cityId}`);
  return res.data ?? [];
}

/**
 * GET /map/zones — GeoJSON FeatureCollection with AQI color per zone
 */
export async function apiGetMapZones(): Promise<GeoJSONZone[]> {
  const res = await request<{ data: { features: GeoJSONZone[] } }>('/map/zones');
  return res.data?.features ?? [];
}

// ────────────────────────────────────────────────────────────────────────────
// ── ADMIN ────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_zones: number;
  average_aqi: number;
  highest_aqi_zone: { zone_name: string | null; aqi: number | null };
  red_zone_count: number;
  red_zones: { zone_name: string; aqi: number }[];
}

/**
 * GET /admin/dashboard
 */
export async function apiGetDashboard(): Promise<DashboardStats> {
  const res = await request<{ data: DashboardStats }>('/admin/dashboard');
  return res.data;
}

/**
 * POST /admin/create-zone
 */
export async function apiCreateZone(payload: { city_id: number; zone_name: string; geojson_polygon?: any }) {
  return request('/admin/create-zone', { method: 'POST', body: payload });
}

/**
 * DELETE /admin/delete-zone/:id
 */
export async function apiDeleteZone(zoneId: number) {
  return request(`/admin/delete-zone/${zoneId}`, { method: 'DELETE' });
}

// ────────────────────────────────────────────────────────────────────────────
// ── ALERTS ───────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'advisory' | 'warning' | 'emergency';

export interface AlertRecord {
  id: number;
  zone_id: number;
  zone_name?: string;
  message: string;
  severity: AlertSeverity;
  created_at: string;
}

/**
 * POST /alerts/send  (admin only)
 */
export async function apiSendAlert(payload: {
  zone_id: number;
  message: string;
  severity: AlertSeverity;
}): Promise<AlertRecord> {
  const res = await request<{ data: AlertRecord }>('/alerts/send', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

/**
 * GET /alerts/history?zone_id=1&limit=50
 */
export async function apiGetAlertHistory(zoneId?: number, limit = 50): Promise<AlertRecord[]> {
  let url = `/alerts/history?limit=${limit}`;
  if (zoneId) url += `&zone_id=${zoneId}`;
  const res = await request<{ data: { alerts: AlertRecord[] } }>(url);
  return res.data?.alerts ?? [];
}


// ────────────────────────────────────────────────────────────────────────────
// ── REPORTS ──────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

/**
 * GET /reports/generate?city=Nashik&report_type=daily
 */
export async function apiGenerateReport(city: string, reportType: 'daily' | 'weekly' | 'monthly') {
  const res = await request<{ data: any }>(`/reports/generate?city=${encodeURIComponent(city)}&report_type=${reportType}`);
  return res.data;
}
