import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiLogin, UserProfile } from '../utils/api';

interface UserLoginScreenProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToSignUp: () => void;
  onNavigateToAdminLogin: () => void;
}

export default function UserLoginScreen({ onLogin, onNavigateToSignUp, onNavigateToAdminLogin }: UserLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
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
      if (res.user.role !== 'user') {
        setApiError('This account is an admin account. Please use Admin Login.');
        return;
      }
      onLogin(res.user);
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
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
            <Ionicons name="cloud-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to check live AQI in your area</Text>
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
          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, errors.email ? styles.inputError : styles.inputNormal]}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Login</Text>}
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={styles.linkRow}>
          <Text style={styles.linkGray}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp}>
            <Text style={styles.linkBlue}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Login */}
        <TouchableOpacity style={styles.adminLinkWrap} onPress={onNavigateToAdminLogin}>
          <Text style={styles.adminLink}>Admin Login →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  card: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24,
    padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 12, borderWidth: 1,
  },
  inputNormal: { borderColor: '#e5e7eb' },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  btn: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkGray: { color: '#6b7280', fontSize: 14 },
  linkBlue: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  adminLinkWrap: { alignItems: 'center', marginTop: 12 },
  adminLink: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  apiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 12,
  },
  apiBannerText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
