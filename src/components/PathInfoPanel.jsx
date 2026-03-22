import React from 'react';
import cards from '../data/cards.json';
import { checkEligibility } from '../utils/eligibility';
import { estimateTimeToQualify, generateTips } from '../utils/pathEngine';
import { getCSSGradient } from '../data/cardGradients';
import cardGradients from '../data/cardGradients';

const TIER_COLORS = {
  'starter': '#22c55e',
  'mid-tier': '#3b82f6',
  'premium': '#a855f7',
  'ultra-premium': '#f59e0b',
  'invite-only': '#1a1a1a',
};

export default function PathInfoPanel({ selectedNode, selectedEdge, tree, profile, onClose }) {
  // Default state
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="bg-[#3A322C] rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <p className="text-4xl mb-3">{'\uD83D\uDC46'}</p>
        <h3 className="text-[#F0EBE3] text-lg font-bold mb-1.5">Click to begin</h3>
        <p className="text-[#B0A898] text-sm leading-5">
          Tap a card to see its details, or tap an arrow to see upgrade steps.
        </p>
      </div>
    );
  }

  // Card selected
  if (selectedNode) {
    const card = cards.find((c) => c.id === selectedNode);
    if (!card) return null;

    const node = tree?.nodes?.find((n) => n.id === selectedNode);
    const tierColor = TIER_COLORS[card.tier] || '#6366f1';
    const gradient = getCSSGradient(card.id);
    const headerBg = gradient || card.imageColor || '#6366f1';

    return (
      <div className="bg-[#3A322C] w-full overflow-hidden relative rounded-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-surface flex items-center justify-center text-[#B0A898] hover:text-[#F0EBE3] cursor-pointer text-sm"
        >
          {'\u2715'}
        </button>

        {/* Card visual */}
        <div className="m-2 rounded-xl overflow-hidden">
        <div
          className="w-full aspect-[1.586] p-4 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: typeof headerBg === 'string' && headerBg.startsWith('linear') ? headerBg : undefined,
            backgroundColor: !gradient ? headerBg : undefined,
          }}
        >
          <div className="flex justify-between items-start relative z-[1]">
            <span className="text-white text-sm font-bold">{card.issuer}</span>
            <div className="w-[30px] h-[22px] rounded bg-yellow-600 flex items-center justify-center">
              <div className="w-5 h-3.5 rounded-sm border border-black/20 bg-yellow-500" />
            </div>
          </div>
          <p className="text-white/90 text-sm font-semibold tracking-wide relative z-[1] truncate">
            {card.name}
          </p>
          <div className="flex justify-end relative z-[1]">
            <span className="text-white/70 text-xs font-bold italic">{card.network || ''}</span>
          </div>
        </div>
        </div>

        <div className="p-3">
          {/* Name + meta */}
          <h3 className="text-[#F0EBE3] text-base font-bold mb-1">{card.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-white text-[11px] font-bold capitalize px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: tierColor }}
            >
              {card.tier}
            </span>
            <span className="text-[#B0A898] text-sm">
              {card.annualFee === 0 ? 'No annual fee' : <span className="text-primary-300 font-semibold">${card.annualFee}/yr</span>}
            </span>
          </div>

          {node?.isOwned && (
            <div className="bg-accent rounded-lg py-1 px-2 inline-block mb-2">
              <span className="text-primary-300 text-xs font-semibold">You have this card</span>
            </div>
          )}

          {/* Rewards */}
          {card.rewards?.categories?.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">Rewards</h4>
              {card.rewards.categories.slice(0, 4).map((cat, i) => (
                <p key={i} className="text-[#F0EBE3] text-sm leading-4">
                  {cat.rate} &mdash; {cat.category}
                </p>
              ))}
            </div>
          )}

          {/* Pros */}
          {card.pros?.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">Pros</h4>
              {card.pros.map((pro, i) => (
                <p key={i} className="text-[#F0EBE3] text-sm leading-4">+ {pro}</p>
              ))}
            </div>
          )}

          {/* Cons */}
          {card.cons?.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">Cons</h4>
              {card.cons.map((con, i) => (
                <p key={i} className="text-[#B0A898] text-sm leading-4">- {con}</p>
              ))}
            </div>
          )}

          {/* Sign-up bonus */}
          {card.signUpBonus && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">Sign-up Bonus</h4>
              <p className="text-primary-300 text-sm leading-4">{card.signUpBonus}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edge selected (upgrade path)
  if (selectedEdge) {
    const fromCard = cards.find((c) => c.id === selectedEdge.from);
    const toCard = cards.find((c) => c.id === selectedEdge.to);
    if (!fromCard || !toCard) return null;

    const elig = profile ? checkEligibility(profile, toCard) : null;
    const months = profile ? estimateTimeToQualify(profile, toCard) : 0;
    const tips = profile ? generateTips(profile, toCard) : [];

    return (
      <div className="bg-[#3A322C] w-full overflow-hidden relative rounded-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-surface flex items-center justify-center text-[#B0A898] hover:text-[#F0EBE3] cursor-pointer text-sm"
        >
          {'\u2715'}
        </button>

        <div className="p-3">
          <h3 className="text-[#F0EBE3] text-base font-bold mb-2">Upgrade Path</h3>

          {/* Route */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center gap-1.5 bg-surface rounded-lg p-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cardGradients[fromCard.id]?.colors[0] || fromCard.imageColor || '#6366f1' }}
              />
              <span className="text-[#F0EBE3] text-[11px] font-semibold truncate">{fromCard.name.length > 19 ?fromCard.name.slice(0, 19) + '...' : fromCard.name}</span>
            </div>
            <span className="text-primary-300 text-base font-bold shrink-0">{'\u2192'}</span>
            <div className="flex-1 flex items-center gap-1.5 bg-surface rounded-lg p-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cardGradients[toCard.id]?.colors[0] || toCard.imageColor || '#6366f1' }}
              />
              <span className="text-[#F0EBE3] text-[11px] font-semibold truncate">{toCard.name.length > 19 ?toCard.name.slice(0, 19) + '...' : toCard.name}</span>
            </div>
          </div>

          {/* Time estimate */}
          <div className="bg-surface rounded-lg p-2 mb-2 text-center">
            <p className="text-[#B0A898] text-[11px] font-semibold mb-0.5">Estimated Time</p>
            <p className="text-primary-300 text-lg font-bold">
              {months === 0 ? 'Ready now!' : `~${months} month${months !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Satisfied Conditions */}
          {elig && elig.reasons.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">
                Satisfied Conditions
              </h4>
              {elig.reasons.map((r, i) => (
                <p key={i} className="text-primary-300 text-sm leading-4">{'\u2713'} {r}</p>
              ))}
            </div>
          )}

          {/* Requirements to Meet */}
          {elig && elig.blockers.length > 0 && (
            <div className="mb-2">
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">
                Requirements to Meet
              </h4>
              {elig.blockers.map((b, i) => (
                <p key={i} className="text-warning text-sm leading-4">{'\u26A0'} {b}</p>
              ))}
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div>
              <h4 className="text-[#B0A898] text-xs font-bold uppercase tracking-wider mb-1">Tips</h4>
              {tips.map((tip, i) => (
                <p key={i} className="text-[#B0A898] text-xs leading-[18px]">{'\u2192'} {tip}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
