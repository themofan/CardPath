import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PathStep({ step, index, totalSteps, onCardPress }) {
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;
  const isGoal = isLast;

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.timeline}>
        {!isFirst && <View style={styles.lineTop} />}
        <View style={[styles.dot, isGoal && styles.goalDot]}>
          <Text style={styles.dotText}>{isGoal ? '★' : index + 1}</Text>
        </View>
        {!isLast && <View style={styles.lineBottom} />}
      </View>

      {/* Step content */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.card, isGoal && styles.goalCard]}
          onPress={() => onCardPress && onCardPress(step.card)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{step.card.name}</Text>
            {step.estimatedMonths > 0 && (
              <Text style={styles.timeline_text}>~{step.estimatedMonths}mo</Text>
            )}
          </View>

          <Text style={styles.reason}>{step.reason}</Text>

          {step.requirements.length > 0 && (
            <View style={styles.reqSection}>
              {step.requirements.map((req, i) => (
                <Text key={i} style={styles.req}>• {req}</Text>
              ))}
            </View>
          )}

          {step.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Tips:</Text>
              {step.tips.slice(0, 2).map((tip, i) => (
                <Text key={i} style={styles.tip}>→ {tip}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 100,
  },
  timeline: {
    width: 36,
    alignItems: 'center',
  },
  lineTop: {
    width: 2,
    flex: 1,
    backgroundColor: '#6366f1',
    opacity: 0.4,
  },
  lineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: '#6366f1',
    opacity: 0.4,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalDot: {
    backgroundColor: '#f59e0b',
  },
  dotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  goalCard: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  timeline_text: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  reason: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  reqSection: {
    marginBottom: 6,
  },
  req: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  tipsSection: {
    marginTop: 4,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 8,
  },
  tipsTitle: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  tip: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
});
