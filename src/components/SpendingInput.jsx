import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomSlider from './ui/CustomSlider';

export default function SpendingInput({ label, icon, value, onChangeText, min = 0, max = 1000 }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>${value || 0}/mo</Text>
      </View>
      <CustomSlider
        value={value || 0}
        onValueChange={(v) => onChangeText(v)}
        min={min}
        max={max}
        step={10}
        showValue={false}
        activeColor="#6366f1"
        trackColor="#e2e8f0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '700',
  },
});
