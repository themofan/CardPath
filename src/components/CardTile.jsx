import React from 'react';
import { getCSSGradient } from '../data/cardGradients';

const tierBadgeColors = {
  'starter': '#22c55e',
  'mid-tier': '#3b82f6',
  'premium': '#a855f7',
  'ultra-premium': '#f59e0b',
  'invite-only': '#1a1a1a',
};

export default function CardTile({ card, onPress, compact = false, isOwned = false, isDream = false }) {
  const gradient = getCSSGradient(card.id);
  const thumbnailStyle = gradient
    ? { background: gradient }
    : { backgroundColor: card.imageColor || '#333' };

  return (
    <button
      type="button"
      onClick={onPress}
      className={`
        flex items-center gap-3 w-full text-left bg-[#3A322C] border border-border rounded-xl
        ${compact ? 'p-2' : 'p-3'}
        ${isOwned ? 'ring-[1.5px] ring-primary' : ''}
        ${isDream ? 'ring-[1.5px] ring-warning' : ''}
        hover:bg-surface hover:shadow-sm transition-all cursor-pointer
      `}
    >
      {/* Gradient card thumbnail */}
      <div
        className="w-14 h-9 rounded-md flex flex-col justify-between p-1 shrink-0"
        style={thumbnailStyle}
      >
        <span className="text-white text-[7px] font-bold opacity-90 leading-none">
          {card.issuer}
        </span>
        <span className="text-white text-[6px] text-right opacity-70 leading-none">
          {card.network}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-secondary-700 text-sm font-semibold truncate flex-1">
            {card.name}
          </span>
          {isOwned && (
            <span className="bg-primary text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">
              OWNED
            </span>
          )}
          {isDream && (
            <span className="bg-warning text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">
              DREAM
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-white text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full"
            style={{ backgroundColor: tierBadgeColors[card.tier] || '#666' }}
          >
            {card.tier.replace('-', ' ')}
          </span>
          <span className="text-secondary-500 text-xs">
            {card.annualFee === 0 ? 'No AF' : `$${card.annualFee}/yr`}
          </span>
        </div>

        {!compact && card.rewards.categories.length > 0 && (
          <p className="text-primary text-xs mt-1 truncate">
            {card.rewards.categories[0].rate} {card.rewards.categories[0].category}
          </p>
        )}
      </div>
    </button>
  );
}
