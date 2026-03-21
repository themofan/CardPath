import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import NumberStepper from '../ui/NumberStepper';
import CustomSlider from '../ui/CustomSlider';

const EMPLOYMENT_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
];

export default function Step1BasicInfo({ form, update }) {
  return (
    <View>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepDesc}>We'll use this to personalize your card recommendations.</Text>

      <NumberStepper
        label="Age"
        value={form.age || 18}
        onValueChange={(v) => update('age', v)}
        min={16}
        max={80}
      />

      <CustomSlider
        label="Annual Income"
        value={form.income || 0}
        onValueChange={(v) => update('income', v)}
        min={0}
        max={200000}
        step={1000}
        formatValue={(v) => `$${v.toLocaleString()}`}
        style={{ marginTop: 16 }}
      />

      <Text style={styles.fieldLabel}>Employment</Text>
      <View style={styles.chipRow}>
        {EMPLOYMENT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, form.employmentStatus === opt.value && styles.chipActive]}
            onPress={() => update('employmentStatus', opt.value)}
          >
            <Text style={[styles.chipText, form.employmentStatus === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Monthly Housing Cost</Text>
      <View style={styles.inputRow}>
        <Text style={styles.dollar}>$</Text>
        <TextInput
          style={styles.textInput}
          value={form.monthlyHousingCost ? String(form.monthlyHousingCost) : ''}
          onChangeText={(v) => update('monthlyHousingCost', Number(v.replace(/[^0-9]/g, '')) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.period}>/mo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDesc: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#64748b',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
  },
  dollar: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    padding: 14,
    color: '#1e293b',
    fontSize: 16,
  },
  period: {
    color: '#64748b',
    fontSize: 13,
  },
});
