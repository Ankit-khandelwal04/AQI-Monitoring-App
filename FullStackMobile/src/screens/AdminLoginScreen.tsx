import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiLogin, UserProfile } from '../utils/api';

interface AdminLoginScreenProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToUserLogin: () => void;
  onNavigateToAdminSignUp: () => void;
}

export default function AdminLoginScreen({ onLogin, onNavigateToUserLogin, onNavigateToAdminSignUp }: AdminLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Username or email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const res = await apiLogin({ email, password });
      if (res.user.role !== 'admin') {
        setApiError('This account does not have admin privileges.');
        return;
      }
      onLogin(res.user);
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Authorized access only</Text>
        </View>

        {/* API Error Banner */}
        {apiError ? (
          <View style={styles.apiBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
            <Text style={styles.apiBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.card}>
          {/* Security Notice */}
          <View style={styles.notice}>
            <Ionicons name="warning-outline" size={20} color="#d97706" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Restricted Access</Text>
              <Text style={styles.noticeText}>Access restricted to authorized personnel only. All login attempts are monitored and logged.</Text>
            </View>
          </View>

          {/* Email/Username */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Username / Email</Text>
            <View style={[styles.inputWrap, errors.email ? styles.inputError : styles.inputNormal]}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder="admin@nashik.gov.in"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            )}
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, errors.password ? styles.inputError : styles.inputNormal]}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(v) => { setPassword(v); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                <Text style={styles.errorText}>{errors.password}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Login as Admin</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.linkSection}>
          <View style={styles.linkRow}>
            <Text style={styles.linkLight}>Need admin access? </Text>
            <TouchableOpacity onPress={onNavigateToAdminSignUp}>
              <Text style={styles.linkAmber}>Request Account</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ marginTop: 8 }} onPress={onNavigateToUserLogin}>
            <Text style={styles.linkBack}>← Back to User Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, shadowColor: '#d97706', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#bfdbfe', textAlign: 'center' },
  card: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  notice: {
    flexDirection: 'row', gap: 10, backgroundColor: '#fffbeb', borderWidth: 1,
    borderColor: '#fde68a', borderRadius: 12, padding: 14, marginBottom: 20,
  },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 3 },
  noticeText: { fontSize: 12, color: '#b45309', lineHeight: 17 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1 },
  inputNormal: { borderColor: '#e5e7eb' },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#d97706' },
  btn: {
    backgroundColor: '#d97706', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkSection: { alignItems: 'center', marginTop: 24 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkLight: { color: '#bfdbfe', fontSize: 14 },
  linkAmber: { color: '#fcd34d', fontWeight: '700', fontSize: 14 },
  linkBack: { color: '#93c5fd', fontSize: 13, fontWeight: '500' },
  apiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 12,
  },
  apiBannerText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
