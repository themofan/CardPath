import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import cards from '../data/cards.json';
import ComparisonTable from '../components/ComparisonTable';

export default function CompareScreen() {
  const [selected, setSelected] = useState([]);

  const selectedCards = useMemo(
    () => selected.map((id) => cards.find((c) => c.id === id)).filter(Boolean),
    [selected]
  );

  const toggleCard = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Compare Cards</Text>
        <Text style={styles.subtitle}>Select 2-3 cards to compare side by side</Text>

        {/* Selected cards indicator */}
        <View style={styles.selectedRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.slot, selected[i] && styles.slotFilled]}>
              {selected[i] ? (
                <TouchableOpacity onPress={() => toggleCard(selected[i])}>
                  <Text style={styles.slotText} numberOfLines={1}>
                    {cards.find((c) => c.id === selected[i])?.name || ''}
                  </Text>
                  <Text style={styles.slotRemove}>tap to remove</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.slotEmpty}>Slot {i + 1}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Comparison table */}
        {selectedCards.length >= 2 && (
          <View style={styles.tableContainer}>
            <ComparisonTable cards={selectedCards} />
          </View>
        )}

        {/* Card picker */}
        <Text style={styles.pickLabel}>
          {selected.length < 2 ? 'Pick cards to compare:' : 'Add another or swap:'}
        </Text>
        {cards.map((c) => {
          const isSelected = selected.includes(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.pickCard, isSelected && styles.pickCardSelected]}
              onPress={() => toggleCard(c.id)}
              disabled={!isSelected && selected.length >= 3}
            >
              <View style={[styles.pickDot, { backgroundColor: c.imageColor }]} />
              <View style={styles.pickInfo}>
                <Text style={styles.pickName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.pickIssuer}>{c.issuer} · {c.annualFee === 0 ? 'No AF' : `$${c.annualFee}/yr`}</Text>
              </View>
              {isSelected && <Text style={styles.pickCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 4, marginBottom: 16 },

  selectedRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  slot: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  slotFilled: { borderColor: '#6366f1', borderStyle: 'solid' },
  slotText: { color: '#c7d2fe', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  slotRemove: { color: '#64748b', fontSize: 9, textAlign: 'center', marginTop: 2 },
  slotEmpty: { color: '#475569', fontSize: 12 },

  tableContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 8,
    marginBottom: 20,
  },

  pickLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  pickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  pickCardSelected: { borderWidth: 1.5, borderColor: '#6366f1' },
  pickDot: { width: 12, height: 12, borderRadius: 6 },
  pickInfo: { flex: 1 },
  pickName: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },
  pickIssuer: { color: '#64748b', fontSize: 11 },
  pickCheck: { color: '#6366f1', fontSize: 18, fontWeight: '700' },
});
