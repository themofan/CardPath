import allCards from '../data/cards.json';
import { checkEligibility } from './eligibility';

const cards = allCards.filter((c) => c.active !== false);

const TIER_ORDER = ['starter', 'mid-tier', 'premium', 'ultra-premium', 'invite-only'];

/**
 * Generate an upgrade path from user's current position to a dream card.
 * Returns an array of steps: [{ card, reason, requirements, estimatedMonths, tips }]
 */
export function generatePath(profile, dreamCardId) {
  const dreamCard = cards.find((c) => c.id === dreamCardId);
  if (!dreamCard) return [];

  const dreamTierIdx = TIER_ORDER.indexOf(dreamCard.tier);
  const currentCardIds = new Set(profile.currentCards || []);

  // Figure out where the user is now
  const currentCards = cards.filter((c) => currentCardIds.has(c.id));
  const highestTier = currentCards.reduce((max, c) => {
    const idx = TIER_ORDER.indexOf(c.tier);
    return idx > max ? idx : max;
  }, -1);

  // Check if user already qualifies
  const dreamElig = checkEligibility(profile, dreamCard);
  if (dreamElig.eligible && highestTier >= dreamTierIdx) {
    return [{
      card: dreamCard,
      reason: "You're ready to apply for this card!",
      requirements: dreamElig.reasons,
      estimatedMonths: 0,
      tips: ['Apply directly — you meet the requirements'],
    }];
  }

  const path = [];
  const sameIssuer = cards.filter((c) => c.issuer === dreamCard.issuer && c.id !== dreamCard.id);

  // Build stepping stones from the same issuer ecosystem first
  const tiers = TIER_ORDER.slice(
    Math.max(0, highestTier < 0 ? 0 : highestTier),
    dreamTierIdx + 1
  );

  for (const tier of tiers) {
    // Find best card at this tier from same issuer (or any issuer for starter)
    let candidates = tier === 'starter'
      ? cards.filter((c) => c.tier === tier)
      : sameIssuer.filter((c) => c.tier === tier);

    // Skip cards user already has
    candidates = candidates.filter((c) => !currentCardIds.has(c.id) && c.id !== dreamCard.id);

    if (candidates.length === 0) continue;

    // Pick the best candidate based on eligibility
    const ranked = candidates
      .map((c) => ({ card: c, elig: checkEligibility(profile, c) }))
      .sort((a, b) => b.elig.score - a.elig.score);

    const best = ranked[0];
    if (!best) continue;

    const step = buildStep(profile, best.card, best.elig, path.length, dreamCard);
    path.push(step);
  }

  // Add dream card as final step
  path.push({
    card: dreamCard,
    reason: `Your goal card! ${dreamCard.name} offers ${dreamCard.tier === 'premium' || dreamCard.tier === 'ultra-premium' ? 'premium travel perks and rewards' : 'great rewards'} that match your goals.`,
    requirements: dreamElig.blockers.length > 0 ? dreamElig.blockers : dreamElig.reasons,
    estimatedMonths: estimateTimeToQualify(profile, dreamCard),
    tips: generateTips(profile, dreamCard),
  });

  return path;
}

function buildStep(profile, card, elig, stepIndex, dreamCard) {
  const tierLabel = {
    'starter': 'building a credit foundation',
    'mid-tier': 'earning solid rewards while building history',
    'premium': 'stepping up to premium perks',
    'ultra-premium': 'accessing top-tier benefits',
  };

  let reason = '';
  if (stepIndex === 0 && card.tier === 'starter') {
    reason = `Start here to build your credit history. ${card.name} is easy to get approved for and begins your journey toward ${dreamCard.name}.`;
  } else if (card.issuer === dreamCard.issuer) {
    reason = `Stay in the ${card.issuer} ecosystem. Having a relationship with ${card.issuer} improves your chances for ${dreamCard.name}.`;
  } else {
    reason = `Great for ${tierLabel[card.tier] || 'building your profile'}.`;
  }

  return {
    card,
    reason,
    requirements: elig.blockers.length > 0 ? elig.blockers : elig.reasons,
    estimatedMonths: estimateTimeToQualify(profile, card),
    tips: generateTips(profile, card),
  };
}

export function estimateTimeToQualify(profile, card) {
  let months = 0;

  // Credit history gap
  if (profile.creditHistoryMonths < card.minCreditHistoryMonths) {
    months = Math.max(months, card.minCreditHistoryMonths - profile.creditHistoryMonths);
  }

  // Credit score gap (rough: ~5-10 points per month of good behavior)
  if (profile.creditScore && profile.creditScore < card.creditScoreMin) {
    const gap = card.creditScoreMin - profile.creditScore;
    months = Math.max(months, Math.ceil(gap / 7));
  }

  // Wait between applications (general rule: 3-6 months)
  if (months < 3 && card.tier !== 'starter') {
    months = Math.max(months, 3);
  }

  return months;
}

export function generateTips(profile, card) {
  const tips = [];
  const spending = profile.monthlySpending || {};

  // Credit score specific
  if (profile.creditScore && card.creditScoreMin) {
    const gap = card.creditScoreMin - profile.creditScore;
    if (gap > 0) {
      tips.push(`Your score needs ~${gap} more points — pay on time and keep utilization under 10%`);
      if (gap > 50) tips.push(`At ~7 points/month improvement, aim to apply in ~${Math.ceil(gap / 7)} months`);
    }
  }

  // Credit history specific
  if (card.minCreditHistoryMonths && profile.creditHistoryMonths < card.minCreditHistoryMonths) {
    const wait = card.minCreditHistoryMonths - profile.creditHistoryMonths;
    tips.push(`You need ${wait} more months of credit history — keep existing accounts open and active`);
  }

  // Income specific
  if (card.estimatedIncomeReq && profile.income && profile.income < card.estimatedIncomeReq) {
    tips.push(`Reported income of $${profile.income.toLocaleString()} is below the suggested $${card.estimatedIncomeReq.toLocaleString()} — consider including all income sources`);
  }

  // Spending-based tips
  if (card.rewards && card.rewards.categories) {
    const topSpendCats = Object.entries(spending)
      .sort(([,a],[,b]) => b - a)
      .filter(([,v]) => v > 0)
      .slice(0, 2);

    for (const [cat, amount] of topSpendCats) {
      const matchingReward = card.rewards.categories.find(function(r) {
        return r.category.toLowerCase().includes(cat.toLowerCase());
      });
      if (matchingReward) {
        tips.push(`You spend $${amount}/mo on ${cat} — this card gives ${matchingReward.rate} on that category`);
      }
    }
  }

  // Sign-up bonus tip
  if (card.signUpBonus) {
    tips.push(`Sign-up bonus: ${card.signUpBonus} — plan spending to hit the minimum requirement`);
  }

  // Special requirements
  if (card.specialRequirements) {
    if (card.specialRequirements.includes('5/24') && profile.recentApplications > 3) {
      tips.push(`Chase 5/24 rule: you have ${profile.recentApplications} recent apps — wait before applying`);
    }
    if (card.specialRequirements.includes('Invitation only')) {
      tips.push(`This card is invitation-only — build spend history with ${card.issuer} cards first`);
    }
  }

  // Annual fee value
  if (card.annualFee > 0) {
    tips.push(`$${card.annualFee}/yr annual fee — make sure you'll use enough perks to offset the cost`);
  }

  if (tips.length === 0) {
    tips.push('Keep accounts in good standing and apply when you meet all requirements');
  }

  return tips;
}
