/**
 * Web-compatible DateTimePicker component
 * Uses HTML5 date input for web
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  onChange?: (event: any, date?: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  is24Hour?: boolean;
  [key: string]: any;
}

export default function DateTimePicker({
  value,
  mode = 'date',
  onChange,
  maximumDate,
  minimumDate,
  is24Hour,
  display,
  ...props
}: DateTimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (onChange) {
      onChange({ type: 'set', nativeEvent: {} }, newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  // Filter out React Native-specific props that shouldn't be passed to DOM
  const {
    testID,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    ...domProps
  } = props;

  return (
    <View style={styles.container}>
      <input
        type={mode === 'time' ? 'time' : 'date'}
        value={mode === 'time' ? formatTime(value) : formatDate(value)}
        onChange={handleChange}
        min={minimumDate ? formatDate(minimumDate) : undefined}
        max={maximumDate ? formatDate(maximumDate) : undefined}
        style={{
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #d1d5db',
          backgroundColor: '#fff',
          color: '#1f2937',
          cursor: 'pointer',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Empty for now, styling done inline for web compatibility
  },
});
