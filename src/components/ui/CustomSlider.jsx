import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 24;

export default function CustomSlider({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onValueChange,
  colorZones,       // optional: [{ from, to, color }]
  label,
  showValue = true,
  formatValue,      // optional: (val) => string
  trackColor = '#e2e8f0',
  activeColor = '#6366f1',
  thumbColor = '#6366f1',
  style,
}) {
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const clamp = (val) => Math.min(max, Math.max(min, Math.round(val / step) * step));

  const getPositionFromValue = (val) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * trackWidth;
  };

  const getValueFromPosition = (x) => {
    if (trackWidth === 0) return min;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    return clamp(min + ratio * (max - min));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        onValueChange?.(getValueFromPosition(x));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        onValueChange?.(getValueFromPosition(x));
      },
    })
  ).current;

  const thumbLeft = getPositionFromValue(value) - THUMB_SIZE / 2;
  const fillWidth = getPositionFromValue(value);

  const getZoneColor = (val) => {
    if (!colorZones) return activeColor;
    for (const zone of colorZones) {
      if (val >= zone.from && val <= zone.to) return zone.color;
    }
    return activeColor;
  };

  const displayValue = formatValue ? formatValue(value) : String(value);
  const currentColor = getZoneColor(value);

  const renderColorZoneTrack = () => {
    if (!colorZones || trackWidth === 0) return null;
    return colorZones.map((zone, i) => {
      const startPct = ((zone.from - min) / (max - min)) * 100;
      const widthPct = ((zone.to - zone.from) / (max - min)) * 100;
      return (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${startPct}%`,
            width: `${widthPct}%`,
            height: TRACK_HEIGHT,
            backgroundColor: zone.color,
            opacity: 0.3,
            borderRadius: TRACK_HEIGHT / 2,
          }}
        />
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      {(label || showValue) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={[styles.value, { color: currentColor }]}>{displayValue}</Text>}
        </View>
      )}
      <View
        ref={trackRef}
        style={styles.trackContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View style={[styles.track, { backgroundColor: trackColor }]} />

        {/* Color zones */}
        {renderColorZoneTrack()}

        {/* Active fill */}
        <View
          style={[
            styles.fill,
            {
              width: fillWidth,
              backgroundColor: currentColor,
            },
          ]}
        />

        {/* Thumb */}
        {trackWidth > 0 && (
          <View
            style={[
              styles.thumb,
              {
                left: Math.max(0, Math.min(thumbLeft, trackWidth - THUMB_SIZE)),
                backgroundColor: currentColor,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
  },
  trackContainer: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    width: '100%',
  },
  fill: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: (THUMB_SIZE + 8 - THUMB_SIZE) / 2,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
