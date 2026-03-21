import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function Step5FutureIntent({ form, update }) {
  return (
    <View>
      <Text style={styles.stepTitle}>Future Spending Plans</Text>
      <Text style={styles.stepDesc}>
        Will your spending change in the next 6-12 months? This helps us project better card matches.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.choiceBtn, form.futureSpendingIntent === 'same' && styles.choiceBtnActive]}
          onPress={() => update('futureSpendingIntent', 'same')}
        >
          <Text style={styles.choiceIcon}>📊</Text>
          <Text style={[styles.choiceText, form.futureSpendingIntent === 'same' && styles.choiceTextActive]}>
            About the same
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choiceBtn, form.futureSpendingIntent === 'changing' && styles.choiceBtnActive]}
          onPress={() => update('futureSpendingIntent', 'changing')}
        >
          <Text style={styles.choiceIcon}>🔄</Text>
          <Text style={[styles.choiceText, form.futureSpendingIntent === 'changing' && styles.choiceTextActive]}>
            Changing
          </Text>
        </TouchableOpacity>
      </View>

      {form.futureSpendingIntent === 'changing' && (
        <View style={styles.textareaContainer}>
          <Text style={styles.fieldLabel}>What's changing?</Text>
          <TextInput
            style={styles.textarea}
            value={form.futureSpendingDescription}
            onChangeText={(v) => update('futureSpendingDescription', v.slice(0, 1000))}
            placeholder="e.g. I'm moving to a new city, starting to travel more, getting a car..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {(form.futureSpendingDescription || '').length}/1000
          </Text>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  choiceBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  choiceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  choiceText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  choiceTextActive: {
    color: '#6366f1',
  },
  textareaContainer: {
    marginTop: 20,
  },
  fieldLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    color: '#1e293b',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  charCount: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
