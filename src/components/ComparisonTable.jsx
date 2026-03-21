import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ComparisonTable({ cards }) {
  if (!cards || cards.length === 0) return null;

  const rows = [
    { label: 'Annual Fee', key: (c) => c.annualFee === 0 ? '$0' : `$${c.annualFee}` },
    { label: 'APR', key: (c) => c.ongoingAPR || 'N/A' },
    { label: 'Min Score', key: (c) => String(c.creditScoreMin) },
    { label: 'Ideal Score', key: (c) => `${c.creditScoreIdeal}+` },
    { label: 'Sign-Up Bonus', key: (c) => c.signUpBonus || 'None' },
    { label: 'SUB Spend', key: (c) => c.signUpSpendReq ? `$${c.signUpSpendReq.toLocaleString()}` : 'N/A' },
    { label: 'Top Reward', key: (c) => c.rewards.categories.length > 0 ? `${c.rewards.categories[0].rate} ${c.rewards.categories[0].category}` : 'None' },
    { label: 'History Needed', key: (c) => c.minCreditHistoryMonths ? `${c.minCreditHistoryMonths}mo` : 'None' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={styles.row}>
          <View style={styles.labelCell} />
          {cards.map((c) => (
            <View key={c.id} style={[styles.headerCell, { backgroundColor: c.imageColor || '#333' }]}>
              <Text style={styles.headerText} numberOfLines={2}>{c.name}</Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {rows.map((r, i) => (
          <View key={i} style={[styles.row, i % 2 === 0 && styles.altRow]}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>{r.label}</Text>
            </View>
            {cards.map((c) => (
              <View key={c.id} style={styles.dataCell}>
                <Text style={styles.dataText} numberOfLines={3}>{r.key(c)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  altRow: {
    backgroundColor: '#0f172a',
  },
  labelCell: {
    width: 100,
    padding: 10,
    justifyContent: 'center',
  },
  headerCell: {
    width: 130,
    padding: 10,
    borderRadius: 8,
    margin: 2,
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  dataCell: {
    width: 130,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataText: {
    color: '#e2e8f0',
    fontSize: 12,
    textAlign: 'center',
  },
});
