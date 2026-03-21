import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NumberStepper({
  value = 0,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  formatValue,
  style,
}) {
  const intervalRef = useRef(null);

  const clamp = (v) => Math.min(max, Math.max(min, v));

  const startRepeat = useCallback((delta) => {
    // Immediate first change
    onValueChange?.(clamp(value + delta));
    // Long-press repeat
    intervalRef.current = setInterval(() => {
      onValueChange?.((prev) => {
        // Since we can't read state in interval, just dispatch
        return clamp(value + delta);
      });
    }, 150);
  }, [value, min, max, step, onValueChange]);

  const stopRepeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const decrement = () => onValueChange?.(clamp(value - step));
  const increment = () => onValueChange?.(clamp(value + step));

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.btn, value <= min && styles.btnDisabled]}
          onPress={decrement}
          onLongPress={() => startRepeat(-step)}
          onPressOut={stopRepeat}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, value <= min && styles.btnTextDisabled]}>-</Text>
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{displayValue}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, value >= max && styles.btnDisabled]}
          onPress={increment}
          onLongPress={() => startRepeat(step)}
          onPressOut={stopRepeat}
          disabled={value >= max}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, value >= max && styles.btnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6366f1',
  },
  btnTextDisabled: {
    color: '#94a3b8',
  },
  valueContainer: {
    minWidth: 48,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
});
