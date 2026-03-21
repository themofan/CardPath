import React from 'react';
import { ArrowRight, GitBranch } from 'lucide-react';
import ReadinessMeter from '../ReadinessMeter';
import { getCSSGradient } from '../../data/cardGradients';

function MiniCard({ card, label }) {
  if (!card) {
    return (
      <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border border-dashed">
        <div className="w-8 h-5 rounded bg-secondary-200 shrink-0" />
        <span className="text-secondary-400 text-xs">{label || 'None'}</span>
      </div>
    );
  }

  const gradient = getCSSGradient(card.id);
  const thumbStyle = gradient
    ? { background: gradient }
    : { backgroundColor: card.imageColor || '#6366f1' };

  return (
    <div className="flex items-center gap-2 bg-[#3A322C] rounded-xl px-3 py-2 border border-border">
      <div className="w-8 h-5 rounded shrink-0" style={thumbStyle} />
      <div className="min-w-0">
        <p className="text-secondary-700 text-xs font-semibold truncate">{card.name}</p>
        <p className="text-secondary-400 text-[10px]">{card.issuer}</p>
      </div>
    </div>
  );
}

export default function PathPreview({ currentCards, dreamCard, dreamReadiness, onNavigate }) {
  const firstCard = currentCards.length > 0 ? currentCards[0] : null;

  return (
    <div className="bg-[#3A322C] rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-secondary-700 font-semibold text-sm">Path Preview</h3>
        </div>
        <button
          onClick={() => onNavigate('pathgraph')}
          className="text-primary text-xs font-medium cursor-pointer hover:underline"
        >
          View Full Path
        </button>
      </div>

      {/* Mini flow: You Now → Current Card → Dream Card */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* You Now */}
        <div className="flex items-center gap-2 bg-accent rounded-xl px-3 py-2 border border-primary/20 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold">You Now</span>
        </div>

        <ArrowRight className="w-4 h-4 text-secondary-300 shrink-0" />

        {/* Current Card or placeholder */}
        <div className="shrink-0">
          <MiniCard card={firstCard} label="No cards yet" />
        </div>

        {dreamCard && (
          <>
            <ArrowRight className="w-4 h-4 text-secondary-300 shrink-0" />
            <div className="shrink-0">
              <MiniCard card={dreamCard} />
            </div>
          </>
        )}
      </div>

      {/* Dream card readiness */}
      {dreamCard && (
        <div className="mt-3">
          <ReadinessMeter
            label={`${dreamCard.name} readiness`}
            percentage={dreamReadiness}
            color={dreamReadiness >= 80 ? '#10B981' : dreamReadiness >= 50 ? '#D4A017' : '#B91C1C'}
          />
        </div>
      )}
    </div>
  );
}
