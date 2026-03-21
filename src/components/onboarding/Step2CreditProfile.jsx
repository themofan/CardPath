import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomSlider from '../ui/CustomSlider';
import NumberStepper from '../ui/NumberStepper';
import SearchableDropdown from '../ui/SearchableDropdown';
import cards from '../../data/cards.json';

const AWARENESS_OPTIONS = [
  { value: 'yes', label: 'Yes, I know my score' },
  { value: 'roughly', label: 'Roughly' },
  { value: 'no-idea', label: 'No idea' },
];

const NUM_CARDS_OPTIONS = [0, 1, 2, 3, 4, '5+'];

const OLDEST_CARD_OPTIONS = [
  { value: 'none', label: 'No cards yet' },
  { value: '<6mo', label: 'Less than 6 months' },
  { value: '6-12mo', label: '6-12 months' },
  { value: '1-2yr', label: '1-2 years' },
  { value: '2-5yr', label: '2-5 years' },
  { value: '5+yr', label: '5+ years' },
];

const CREDIT_SCORE_ZONES = [
  { from: 300, to: 579, color: '#ef4444' },   // Poor - red
  { from: 580, to: 669, color: '#f59e0b' },   // Fair - amber
  { from: 670, to: 739, color: '#22c55e' },   // Good - green
  { from: 740, to: 850, color: '#06b6d4' },   // Excellent - cyan
];

// Build unique card items for dropdown
const cardItems = cards.map((c) => ({
  label: `${c.name} (${c.issuer})`,
  value: c.id,
}));

export default function Step2CreditProfile({ form, update }) {
  const showScoreSlider = form.creditScoreAwareness === 'yes' || form.creditScoreAwareness === 'roughly';

  return (
    <View>
      <Text style={styles.stepTitle}>Your Credit Profile</Text>
      <Text style={styles.stepDesc}>Don't worry if you're just starting — that's what CardPath is for!</Text>

      <Text style={styles.fieldLabel}>Do you know your credit score?</Text>
      <View style={styles.chipRow}>
        {AWARENESS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, form.creditScoreAwareness === opt.value && styles.chipActive]}
            onPress={() => update('creditScoreAwareness', opt.value)}
          >
            <Text style={[styles.chipText, form.creditScoreAwareness === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showScoreSlider && (
        <CustomSlider
          label="Credit Score"
          value={form.creditScore || 650}
          onValueChange={(v) => update('creditScore', v)}
          min={300}
          max={850}
          step={5}
          colorZones={CREDIT_SCORE_ZONES}
          formatValue={(v) => {
            if (v < 580) return `${v} (Poor)`;
            if (v < 670) return `${v} (Fair)`;
            if (v < 740) return `${v} (Good)`;
            return `${v} (Excellent)`;
          }}
          style={{ marginTop: 16 }}
        />
      )}

      <Text style={styles.fieldLabel}>How many credit cards do you have?</Text>
      <View style={styles.segmentRow}>
        {NUM_CARDS_OPTIONS.map((opt) => {
          const val = opt === '5+' ? 5 : opt;
          const isActive = form.numCreditCards === val;
          return (
            <TouchableOpacity
              key={String(opt)}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => update('numCreditCards', val)}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {form.numCreditCards > 0 && (
        <>
          <SearchableDropdown
            label="Search your cards"
            items={cardItems}
            value={form.currentCards?.[0]}
            onSelect={(val) => {
              const existing = form.currentCards || [];
              if (!existing.includes(val)) {
                update('currentCards', [...existing, val]);
              }
            }}
            placeholder="Search by card name..."
          />

          {(form.currentCards || []).length > 0 && (
            <View style={styles.selectedCards}>
              {form.currentCards.map((id) => {
                const card = cards.find((c) => c.id === id);
                return (
                  <View key={id} style={styles.cardTag}>
                    <Text style={styles.cardTagText}>{card ? card.name : id}</Text>
                    <TouchableOpacity
                      onPress={() => update('currentCards', form.currentCards.filter((c) => c !== id))}
                    >
                      <Text style={styles.cardTagRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      <SearchableDropdown
        label="How old is your oldest card?"
        items={OLDEST_CARD_OPTIONS}
        value={form.oldestCardAge}
        onSelect={(val) => update('oldestCardAge', val)}
        placeholder="Select..."
      />

      <NumberStepper
        label="Recent applications (last 6 months)"
        value={form.recentApplications || 0}
        onValueChange={(v) => update('recentApplications', v)}
        min={0}
        max={10}
        style={{ marginTop: 12 }}
      />
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
  segmentRow: {
    flexDirection: 'row',
    gap: 0,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#6366f1',
  },
  segmentText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  selectedCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  cardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  cardTagText: {
    color: '#4338ca',
    fontSize: 13,
    fontWeight: '500',
  },
  cardTagRemove: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
  },
});
