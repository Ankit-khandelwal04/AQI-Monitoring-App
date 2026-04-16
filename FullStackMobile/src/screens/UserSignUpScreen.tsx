import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRegister, UserProfile } from '../utils/api';

interface UserSignUpScreenProps {
  onSignUp: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export default function UserSignUpScreen({ onSignUp, onNavigateToLogin }: UserSignUpScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Must include uppercase, lowercase, and number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const res = await apiRegister({
        name: formData.fullName.trim(),
        email: formData.email,
        password: formData.password,
        role: 'user',
      });
      onSignUp(res.user);
    } catch (err: any) {
      setApiError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) { const e = { ...errors }; delete e[field]; setErrors(e); }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z\d]/.test(p)) s++;
    return s;
  };

  const strength = passwordStrength();
  const strengthColor = strength <= 1 ? '#ef4444' : strength === 2 ? '#f97316' : strength === 3 ? '#eab308' : '#22c55e';
  const strengthLabel = strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong';

  const InputField = ({ field, label, placeholder, secure, toggleSecure, showSecure, keyboardType }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, errors[field] ? styles.inputError : styles.inputNormal]}>
        <Ionicons name={field === 'email' ? 'mail-outline' : field === 'fullName' ? 'person-outline' : 'lock-closed-outline'} size={20} color="#9ca3af" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={formData[field as keyof typeof formData] as string}
          onChangeText={(v) => updateField(field, v)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secure && !showSecure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
        />
        {secure && (
          <TouchableOpacity onPress={toggleSecure} style={styles.eyeBtn}>
            <Ionicons name={showSecure ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
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
            <Ionicons name="cloud-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Track live AQI in your area</Text>
        </View>

        {/* API Error Banner */}
        {apiError ? (
          <View style={styles.apiBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
            <Text style={styles.apiBannerText}>{apiError}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <InputField field="fullName" label="Full Name" placeholder="Enter your full name" />
          <InputField field="email" label="Email Address" placeholder="you@example.com" keyboardType="email-address" />
          <InputField field="password" label="Password" placeholder="Create a strong password" secure showSecure={showPassword} toggleSecure={() => setShowPassword(!showPassword)} />

          {/* Password Strength */}
          {formData.password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((l) => (
                  <View key={l} style={[styles.strengthBar, { backgroundColor: l <= strength ? strengthColor : '#e5e7eb' }]} />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel} password</Text>
            </View>
          )}

          <InputField field="confirmPassword" label="Confirm Password" placeholder="Re-enter your password" secure showSecure={showConfirmPassword} toggleSecure={() => setShowConfirmPassword(!showConfirmPassword)} />

          {/* Passwords match */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
            <View style={[styles.errorRow, { marginTop: -8, marginBottom: 8 }]}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#22c55e" />
              <Text style={[styles.errorText, { color: '#22c55e' }]}>Passwords match</Text>
            </View>
          )}

          {/* Terms */}
          <TouchableOpacity style={styles.termsRow} onPress={() => updateField('agreeToTerms', !formData.agreeToTerms)}>
            <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
              {formData.agreeToTerms && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.termsText}>I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text></Text>
          </TouchableOpacity>
          {errors.agreeToTerms && (
            <View style={[styles.errorRow, { marginBottom: 8 }]}>
              <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
              <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.linkRow}>
          <Text style={styles.linkGray}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.linkGreen}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  card: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
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
  strengthWrap: { marginBottom: 12, marginTop: -8 },
  strengthBars: { flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 5, borderRadius: 4 },
  strengthLabel: { fontSize: 11, marginTop: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  termsText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  termsLink: { color: '#059669', fontWeight: '600' },
  btn: {
    backgroundColor: '#059669', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5, marginTop: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkGray: { color: '#6b7280', fontSize: 14 },
  linkGreen: { color: '#059669', fontWeight: '700', fontSize: 14 },
  apiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 12,
  },
  apiBannerText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },
});
