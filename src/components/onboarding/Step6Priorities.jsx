import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PRIORITY_ITEMS = [
  { key: 'cashback', label: 'Cash Back', icon: '💵' },
  { key: 'travel-rewards', label: 'Travel Rewards', icon: '✈️' },
  { key: 'build-credit', label: 'Build Credit', icon: '📈' },
  { key: 'low-apr', label: 'Low APR', icon: '📉' },
  { key: 'no-annual-fee', label: 'No Annual Fee', icon: '🆓' },
  { key: 'sign-up-bonus', label: 'Sign-up Bonuses', icon: '🎁' },
];

export default function Step6Priorities({ form, update }) {
  const priorities = form.priorities || [];

  const handleTap = (key) => {
    if (priorities.includes(key)) {
      // Remove this item and all items ranked after it
      const index = priorities.indexOf(key);
      update('priorities', priorities.slice(0, index));
    } else {
      update('priorities', [...priorities, key]);
    }
  };

  const handleReset = () => {
    update('priorities', []);
  };

  const getRank = (key) => {
    const index = priorities.indexOf(key);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <View>
      <Text style={styles.stepTitle}>What matters most to you?</Text>
      <Text style={styles.stepDesc}>
        Tap items in order of priority. Tap a numbered item to unrank it and everything after it.
      </Text>

      <View style={styles.grid}>
        {PRIORITY_ITEMS.map((item) => {
          const rank = getRank(item.key);
          const isRanked = rank !== null;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isRanked && styles.itemRanked]}
              onPress={() => handleTap(item.key)}
              activeOpacity={0.7}
            >
              {isRanked && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rank}</Text>
                </View>
              )}
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={[styles.itemLabel, isRanked && styles.itemLabelRanked]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {priorities.length > 0 && (
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      )}

      {priorities.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Your priority order:</Text>
          {priorities.map((key, i) => {
            const item = PRIORITY_ITEMS.find((p) => p.key === key);
            return (
              <Text key={key} style={styles.summaryItem}>
                {i + 1}. {item?.icon} {item?.label}
              </Text>
            );
          })}
        </View>
      )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  itemRanked: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  itemLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemLabelRanked: {
    color: '#4338ca',
  },
  resetBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  resetText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryItem: {
    color: '#4338ca',
    fontSize: 14,
    lineHeight: 22,
  },
});
