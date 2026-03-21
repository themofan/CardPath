import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { askGeminiJSON, isAPIConfigured } from '../../api/gemini';
import { buildSpendingProjectionPrompt, buildInitialRecommendationPrompt } from '../../api/aiPromptBuilder';

const MESSAGES = [
  'Building your path...',
  'Analyzing your spending patterns...',
  'Finding the best cards for you...',
  'Almost there...',
];

export default function LoadingScreen({ form, onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let projectedSpending = null;

      try {
        // If user described spending changes, ask Gemini to project
        if (
          isAPIConfigured() &&
          form.futureSpendingIntent === 'changing' &&
          form.futureSpendingDescription?.trim()
        ) {
          const prompt = buildSpendingProjectionPrompt(
            form.monthlySpending,
            form.futureSpendingDescription
          );
          const result = await Promise.race([
            askGeminiJSON(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
          ]);
          if (!cancelled) {
            projectedSpending = result;
          }
        }
      } catch (e) {
        console.warn('Spending projection failed, continuing without:', e.message);
      }

      // Add a minimum display time so it doesn't flash
      await new Promise((r) => setTimeout(r, 2000));

      if (!cancelled) {
        onComplete(projectedSpending);
      }
    };

    run();

    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" style={styles.spinner} />
      <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>
      <Text style={styles.sub}>Personalizing your CardPath experience</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  spinner: {
    marginBottom: 24,
    transform: [{ scale: 1.5 }],
  },
  message: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
