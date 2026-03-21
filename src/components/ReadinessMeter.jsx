import React from 'react';

/**
 * Simple horizontal progress bar with label and percentage.
 * Styled with Tailwind for the light-themed app surface.
 */
export default function ReadinessMeter({ label, percentage, color = '#6366f1' }) {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-secondary-700 text-sm">{label}</span>
        <span className="text-sm font-bold text-secondary" style={{ color }}>
          {clamped}%
        </span>
      </div>
      <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
