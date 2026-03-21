import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ current, total, style }) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i <= current ? styles.segmentActive : styles.segmentInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentActive: {
    backgroundColor: '#6366f1',
  },
  segmentInactive: {
    backgroundColor: '#e2e8f0',
  },
});
