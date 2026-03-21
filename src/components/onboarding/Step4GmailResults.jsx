import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Step4GmailResults({ onGoManual }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚧</Text>
      <Text style={styles.title}>Gmail Integration</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.desc}>
        We're building a feature that will automatically detect your spending
        patterns from Gmail receipts and statements. Stay tuned!
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onGoManual}>
        <Text style={styles.btnText}>Enter Spending Manually</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  desc: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
