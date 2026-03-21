import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SpendingInput from '../SpendingInput';

const CATEGORIES = [
  { key: 'dining', label: 'Dining', icon: '🍽️', max: 1500 },
  { key: 'groceries', label: 'Groceries', icon: '🛒', max: 1500 },
  { key: 'travel', label: 'Travel', icon: '✈️', max: 2000 },
  { key: 'gas', label: 'Gas', icon: '⛽', max: 500 },
  { key: 'onlineShopping', label: 'Online Shopping', icon: '🛍️', max: 1500 },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', max: 500 },
  { key: 'subscriptions', label: 'Subscriptions', icon: '📱', max: 500 },
  { key: 'transportation', label: 'Transportation', icon: '🚗', max: 1000 },
];

export default function Step3BManualSpending({ form, updateSpending }) {
  const spending = form.monthlySpending || {};
  const total = Object.values(spending).reduce((s, v) => s + (v || 0), 0);

  return (
    <View>
      <Text style={styles.stepTitle}>Monthly Spending</Text>
      <Text style={styles.stepDesc}>
        Drag the sliders to estimate your monthly spending in each category.
      </Text>

      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Monthly Total</Text>
        <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
      </View>

      {CATEGORIES.map((cat) => (
        <SpendingInput
          key={cat.key}
          label={cat.label}
          icon={cat.icon}
          value={spending[cat.key] || 0}
          onChangeText={(v) => updateSpending(cat.key, v)}
          min={0}
          max={cat.max}
        />
      ))}
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
    marginBottom: 16,
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  totalLabel: {
    color: '#4338ca',
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: '#4338ca',
    fontSize: 20,
    fontWeight: '700',
  },
});
