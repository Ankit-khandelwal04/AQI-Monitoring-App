import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRegister, UserProfile } from '../utils/api';

interface AdminSignUpScreenProps {
  onSignUp: (user: UserProfile) => void;
  onNavigateToAdminLogin: () => void;
}

export default function AdminSignUpScreen({ onSignUp, onNavigateToAdminLogin }: AdminSignUpScreenProps) {
  const [formData, setFormData] = useState({
    adminName: '', email: '', departmentId: '', password: '', confirmPassword: '', accessCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    else if (formData.adminName.trim().length < 2) newErrors.adminName = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Official email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    else if (!formData.email.includes('.gov.') && !formData.email.includes('.org')) newErrors.email = 'Please use an official government/organization email';
    if (!formData.departmentId) newErrors.departmentId = 'Department ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 12) newErrors.password = 'Admin password must be at least 12 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) newErrors.password = 'Must include uppercase, lowercase, number, and special character';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.accessCode) newErrors.accessCode = 'Access code is required';
    else if (formData.accessCode.length !== 8) newErrors.accessCode = 'Access code must be 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) { const e = { ...errors }; delete e[field]; setErrors(e); }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const res = await apiRegister({
        name: formData.adminName.trim(),
        email: formData.email,
        password: formData.password,
        role: 'admin',
      });
      onSignUp(res.user);
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({ field, label, placeholder, secure, showSec, toggleSec, iconName, keyboardType, maxLength }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, errors[field] ? styles.inputError : styles.inputNormal]}>
        <Ionicons name={iconName} size={20} color="#9ca3af" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={formData[field as keyof typeof formData] as string}
          onChangeText={(v) => updateField(field, field === 'accessCode' ? v.toUpperCase() : v)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secure && !showSec}
          autoCapitalize="none"
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
        />
        {secure && (
          <TouchableOpacity onPress={toggleSec} style={styles.eyeBtn}>
            <Ionicons name={showSec ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
          <Text style={styles.errorText}>{errors[field]}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Create Admin Account</Text>
          <Text style={styles.subtitle}>Restricted to authorized personnel</Text>
        </View>

        <View style={styles.card}>
          {apiError ? (
            <View style={styles.apiBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
              <Text style={styles.apiBannerText}>{apiError}</Text>
            </View>
          ) : null}
          <View style={styles.notice}>
            <Ionicons name="warning-outline" size={20} color="#dc2626" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Account Creation Restricted</Text>
              <Text style={styles.noticeText}>Admin account creation requires super-admin approval. You must have a valid access code to proceed.</Text>
            </View>
          </View>

          <Field field="adminName" label="Admin Name" placeholder="Enter your full name" iconName="person-outline" />
          <Field field="email" label="Official Email" placeholder="admin@nashik.gov.in" iconName="mail-outline" keyboardType="email-address" />
          <Field field="departmentId" label="Department ID" placeholder="e.g., MPCB-NSK-2024" iconName="shield-checkmark-outline" />
          <Field field="password" label="Password" placeholder="Minimum 12 characters" iconName="lock-closed-outline" secure showSec={showPassword} toggleSec={() => setShowPassword(!showPassword)} />
          <Field field="confirmPassword" label="Confirm Password" placeholder="Re-enter your password" iconName="lock-closed-outline" secure showSec={showConfirmPassword} toggleSec={() => setShowConfirmPassword(!showConfirmPassword)} />

          {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
            <View style={[styles.errorRow, { marginTop: -8, marginBottom: 8 }]}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#22c55e" />
              <Text style={[styles.errorText, { color: '#22c55e' }]}>Passwords match</Text>
            </View>
          )}

          <Field field="accessCode" label="Super-Admin Access Code" placeholder="8-character code" iconName="key-outline" maxLength={8} />
          <Text style={styles.hintText}>Contact your super-admin to obtain the access code</Text>

          <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Create Admin Account</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.linkRow}>
          <Text style={styles.linkLight}>Already have admin credentials? </Text>
          <TouchableOpacity onPress={onNavigateToAdminLogin}>
            <Text style={styles.linkPurple}>Admin Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1b4b' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#c4b5fd', textAlign: 'center' },
  card: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  notice: {
    flexDirection: 'row', gap: 10, backgroundColor: '#fef2f2', borderWidth: 1,
    borderColor: '#fecaca', borderRadius: 12, padding: 14, marginBottom: 20,
  },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#991b1b', marginBottom: 3 },
  noticeText: { fontSize: 12, color: '#b91c1c', lineHeight: 17 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1 },
  inputNormal: { borderColor: '#e5e7eb' },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  hintText: { fontSize: 11, color: '#9ca3af', marginTop: -8, marginBottom: 14 },
  btn: {
    backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5, marginTop: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  linkLight: { color: '#c4b5fd', fontSize: 14 },
  linkPurple: { color: '#a78bfa', fontWeight: '700', fontSize: 14 },
  apiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  apiBannerText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
