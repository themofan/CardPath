import React, { useMemo } from 'react';
import cards from '../data/cards.json';
import { useUser } from '../context/UserContext';
import { checkEligibility } from '../utils/eligibility';
import { getCSSGradient } from '../data/cardGradients';
import ReadinessMeter from '../components/ReadinessMeter';

export default function CardDetailScreen({ cardId, onClose }) {
  const { profile, dispatch } = useUser();
  const card = cards.find((c) => c.id === cardId);

  const eligibility = useMemo(
    () => (card ? checkEligibility(profile, card) : null),
    [profile, card]
  );

  if (!card) {
    return (
      <div className="min-h-screen bg-[#3A322C] flex items-center justify-center">
        <p className="text-danger text-lg">Card not found</p>
      </div>
    );
  }

  const hasCard = (profile.currentCards || []).includes(card.id);
  const isDream = profile.dreamCard === card.id;
  const gradient = getCSSGradient(card.id);
  const headerBg = gradient || card.imageColor || '#6366f1';

  return (
    <div className="overflow-y-auto max-h-[85vh] bg-[#3A322C] pb-10">
      {/* Card Visual Header */}
      <div
        className="p-6 pt-10 rounded-b-3xl"
        style={{ background: typeof headerBg === 'string' && headerBg.startsWith('linear') ? headerBg : undefined, backgroundColor: !gradient ? headerBg : undefined }}
      >
        <p className="text-white/80 text-sm font-semibold">{card.issuer}</p>
        <h1 className="text-white text-2xl font-bold mt-1 mb-2">{card.name}</h1>
        <p className="text-white/50 text-xs">{card.network}</p>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mt-4 bg-[#3A322C] rounded-xl p-4 flex gap-3 border border-border">
        <div className="flex-1 text-center">
          <p className="text-secondary-500 text-xs mb-1">Annual Fee</p>
          <p className="text-secondary-700 text-lg font-bold">
            {card.annualFee === 0 ? '$0' : `$${card.annualFee}`}
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-secondary-500 text-xs mb-1">Min Score</p>
          <p className="text-secondary-700 text-lg font-bold">{card.creditScoreMin}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-secondary-500 text-xs mb-1">Tier</p>
          <p className="text-secondary-700 text-lg font-bold capitalize">{card.tier}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-secondary-500 text-xs mb-1">Typical Limit</p>
          <p className="text-secondary-700 text-sm font-bold">
            {card.typicalCreditLimit
              ? `$${card.typicalCreditLimit.min.toLocaleString()}-$${card.typicalCreditLimit.max.toLocaleString()}`
              : 'No preset'}
          </p>
        </div>
      </div>

      {/* Eligibility */}
      {eligibility && (
        <div className="px-4 mt-5">
          <h2 className="text-secondary-700 text-base font-bold mb-3">Your Eligibility</h2>
          <ReadinessMeter
            label="Readiness score"
            percentage={eligibility.score}
            color={eligibility.eligible ? '#22c55e' : eligibility.score >= 50 ? '#f59e0b' : '#ef4444'}
          />
          {eligibility.blockers.map((b, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <span className="text-danger text-sm shrink-0">{'\u26A0'}</span>
              <span className="text-danger text-sm">{b}</span>
            </div>
          ))}
          {eligibility.reasons.map((r, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <span className="text-primary text-sm shrink-0">{'\u2713'}</span>
              <span className="text-primary text-sm">{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rewards */}
      <div className="px-4 mt-5">
        <h2 className="text-secondary-700 text-base font-bold mb-3">Rewards</h2>
        {card.rewards.categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-3 mb-1.5">
            <span className="text-primary text-base font-bold w-12 text-right">{cat.rate}</span>
            <span className="text-secondary-700 text-sm flex-1">{cat.category}</span>
          </div>
        ))}
        {card.rewards.notes && (
          <p className="text-secondary-500 text-xs mt-2 italic">{card.rewards.notes}</p>
        )}
      </div>

      {/* Sign-Up Bonus */}
      {card.signUpBonus && (
        <div className="px-4 mt-5">
          <h2 className="text-secondary-700 text-base font-bold mb-2">Sign-Up Bonus</h2>
          <p className="text-warning text-sm font-semibold">{card.signUpBonus}</p>
          {card.signUpSpendReq && (
            <p className="text-secondary-500 text-sm mt-1">
              Spend ${card.signUpSpendReq.toLocaleString()} to qualify
            </p>
          )}
        </div>
      )}

      {/* APR */}
      <div className="px-4 mt-5">
        <h2 className="text-secondary-700 text-base font-bold mb-2">APR</h2>
        {card.introAPR && <p className="text-secondary-700 text-sm mb-1">Intro: {card.introAPR}</p>}
        <p className="text-secondary-700 text-sm">Ongoing: {card.ongoingAPR}</p>
      </div>

      {/* Perks */}
      <div className="px-4 mt-5">
        <h2 className="text-secondary-700 text-base font-bold mb-2">Perks</h2>
        {card.perks.map((p, i) => (
          <p key={i} className="text-secondary-700 text-sm leading-6">{'\u2022'} {p}</p>
        ))}
      </div>

      {/* Pros & Cons */}
      <div className="px-4 mt-5 flex gap-3">
        <div className="flex-1">
          <h3 className="text-primary text-sm font-bold mb-1.5">Pros</h3>
          {card.pros.map((p, i) => (
            <p key={i} className="text-primary text-sm leading-5">+ {p}</p>
          ))}
        </div>
        <div className="flex-1">
          <h3 className="text-danger text-sm font-bold mb-1.5">Cons</h3>
          {card.cons.map((c, i) => (
            <p key={i} className="text-danger text-sm leading-5">- {c}</p>
          ))}
        </div>
      </div>

      {/* Special Requirements */}
      {card.specialRequirements && (
        <div className="mx-4 mt-5 bg-[#3A322C] rounded-lg p-3 border-l-4 border-warning">
          <h3 className="text-warning text-sm font-semibold mb-1">Special Requirements</h3>
          <p className="text-secondary-500 text-sm">{card.specialRequirements}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 mt-6 flex flex-col gap-2">
        <button
          onClick={() =>
            dispatch({
              type: hasCard ? 'REMOVE_CARD' : 'ADD_CARD',
              payload: card.id,
            })
          }
          className={`
            w-full py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer
            ${hasCard ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary/90'}
            transition-colors
          `}
        >
          {hasCard ? 'Remove from My Cards' : 'Add to My Cards'}
        </button>
        <button
          onClick={() =>
            dispatch({ type: 'SET_DREAM_CARD', payload: isDream ? null : card.id })
          }
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm cursor-pointer
            border-[1.5px] border-warning transition-colors
            ${isDream ? 'bg-warning/10 text-warning' : 'bg-transparent text-warning hover:bg-warning/10'}
          `}
        >
          {isDream ? '\u2605 Dream Card' : 'Set as Dream Card'}
        </button>
      </div>
    </div>
  );
}
