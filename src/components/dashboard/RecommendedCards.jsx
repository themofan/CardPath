import React from 'react';
import { TrendingUp } from 'lucide-react';
import ReadinessMeter from '../ReadinessMeter';
import { getCSSGradient } from '../../data/cardGradients';

export default function RecommendedCards({ recommendations, onNavigate }) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-[#3A322C] rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="text-secondary-700 font-semibold text-sm mb-2">Recommended Cards</h3>
        <p className="text-secondary-400 text-sm">Complete your profile to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-secondary-700 font-semibold text-sm">Recommended For You</h3>
        <button
          onClick={() => onNavigate('explorer')}
          className="text-primary text-xs font-medium cursor-pointer hover:underline"
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(({ card, score }) => {
          const gradient = getCSSGradient(card.id);
          const thumbStyle = gradient
            ? { background: gradient }
            : { backgroundColor: card.imageColor || '#6366f1' };

          return (
            <div
              key={card.id}
              className="bg-[#3A322C] rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('explorer')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-8 rounded-md flex flex-col justify-between p-1 shrink-0"
                  style={thumbStyle}
                >
                  <span className="text-white text-[6px] font-bold opacity-90 leading-none">{card.issuer}</span>
                  <span className="text-white text-[5px] text-right opacity-60 leading-none">{card.network}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-secondary-700 text-sm font-bold truncate">{card.name}</p>
                  <p className="text-secondary-500 text-xs">{card.issuer}</p>
                </div>
              </div>
              <ReadinessMeter
                label="Match"
                percentage={score}
                color={score >= 80 ? '#10B981' : score >= 50 ? '#D4A017' : '#B91C1C'}
              />
              <p className="text-secondary-400 text-xs">
                {card.annualFee === 0 ? 'No annual fee' : `$${card.annualFee}/yr`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
