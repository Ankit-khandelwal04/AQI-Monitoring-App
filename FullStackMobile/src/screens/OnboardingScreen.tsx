import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Know the Air You Breathe",
    description: "Access real-time air quality data for Nashik city. Make informed decisions about your outdoor activities.",
    iconName: 'cloud-outline' as const,
    bgColor: '#3b82f6',
    points: null,
  },
  {
    title: "Air Quality Affects Your Health",
    description: "",
    iconName: 'heart-outline' as const,
    bgColor: '#10b981',
    points: [
      { icon: "🫁", text: "Respiratory issues & breathing problems" },
      { icon: "🏃", text: "Impact on outdoor safety & exercise" },
      { icon: "❤️", text: "Long-term cardiovascular health effects" },
    ],
  },
  {
    title: "Track Live AQI in Nashik",
    description: "Get area-wise, real-time air quality insights with hourly updates and health advisories.",
    iconName: 'location-outline' as const,
    bgColor: '#7c3aed',
    points: null,
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else onComplete();
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Icon Circle */}
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: slide.bgColor }]}>
          <Ionicons name={slide.iconName} size={96} color="#fff" />
        </View>

        <Text style={styles.title}>{slide.title}</Text>

        {currentSlide === 1 && slide.points ? (
          <View style={styles.pointsList}>
            {slide.points.map((p, i) => (
              <View key={i} style={styles.pointRow}>
                <Text style={styles.pointIcon}>{p.icon}</Text>
                <Text style={styles.pointText}>{p.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.description}>{slide.description}</Text>
        )}
      </View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[styles.btn, currentSlide === slides.length - 1 ? styles.btnBlue : styles.btnGray]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, currentSlide === slides.length - 1 ? styles.btnTextWhite : styles.btnTextDark]}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentSlide < slides.length - 1 && (
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: {
    width: 200, height: 200, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 36, shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16, paddingHorizontal: 8 },
  description: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  pointsList: { width: '100%', gap: 12 },
  pointRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#f9fafb', borderRadius: 16, padding: 16,
  },
  pointIcon: { fontSize: 28, lineHeight: 34 },
  pointText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22, paddingTop: 4 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: '#2563eb' },
  dotInactive: { width: 8, backgroundColor: '#d1d5db' },
  btnWrap: { paddingHorizontal: 32, paddingBottom: 48 },
  btn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  btnBlue: { backgroundColor: '#2563eb' },
  btnGray: { backgroundColor: '#f3f4f6' },
  btnText: { fontSize: 16, fontWeight: '700' },
  btnTextWhite: { color: '#fff' },
  btnTextDark: { color: '#111827' },
});
