import React from 'react';

const GREEN = '#10B981';
const BLUE = '#D4A017';
const TRACK = '#D5D0CB';

/**
 * Circular progress ring using CSS conic-gradient.
 * Shows filled portion in gold (or fully green when all met).
 * Uses an inner circle mask to create the ring effect.
 */
export default function EligibilityRing({ met, total, size = 22 }) {
  const ratio = total === 0 ? 1 : met / total;
  const allMet = ratio >= 1;
  const filled = Math.min(ratio, 1) * 360;
  const borderW = 3;
  const innerSize = size - borderW * 2;

  if (allMet) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${borderW}px solid ${GREEN}`,
          boxSizing: 'border-box',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${BLUE} 0deg ${filled}deg, ${TRACK} ${filled}deg 360deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Inner circle mask to create ring effect */}
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          backgroundColor: '#2C2420',
        }}
      />
    </div>
  );
}
