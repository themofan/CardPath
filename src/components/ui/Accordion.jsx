import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export default function Accordion({ title, children, defaultOpen = false, style }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const animHeight = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  const toggle = useCallback(() => {
    Animated.timing(animHeight, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  }, [expanded, animHeight]);

  const height = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight || 500],
  });

  const rotate = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Animated.Text style={[styles.chevron, { transform: [{ rotate }] }]}>
          ▾
        </Animated.Text>
      </TouchableOpacity>
      <Animated.View style={[styles.body, { height }]}>
        <View
          style={styles.bodyInner}
          onLayout={(e) => {
            if (contentHeight === 0) {
              setContentHeight(e.nativeEvent.layout.height);
            }
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  title: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    color: '#64748b',
    fontSize: 16,
    marginLeft: 8,
  },
  body: {
    overflow: 'hidden',
  },
  bodyInner: {
    padding: 14,
    paddingTop: 0,
  },
});
