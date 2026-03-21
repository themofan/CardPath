/**
 * Check how eligible a user is for a given card.
 * Returns { eligible: boolean, score: 0-100, reasons: string[], blockers: string[] }
 */
export function checkEligibility(profile, card) {
  const reasons = [];
  const blockers = [];
  let score = 100;
  let total = 0;
  let met = 0;

  // Credit score check
  if (profile.creditScore !== null) {
    total++;
    if (profile.creditScore < card.creditScoreMin) {
      const gap = card.creditScoreMin - profile.creditScore;
      blockers.push(`Credit score ${profile.creditScore} is below minimum ${card.creditScoreMin} (need +${gap} points)`);
      score -= Math.min(40, gap / 2);
    } else {
      met++;
      if (profile.creditScore >= card.creditScoreIdeal) {
        reasons.push('Credit score exceeds ideal range');
      } else {
        reasons.push(`Credit score ${profile.creditScore} meets minimum (ideal: ${card.creditScoreIdeal}+)`);
        score -= 10;
      }
    }
  } else {
    // Use range estimate
    const rangeScores = {
      'none': 300,
      'poor': 500,
      'fair': 620,
      'good': 700,
      'excellent': 780,
    };
    const estimated = rangeScores[profile.creditScoreRange] || 600;
    total++;
    if (estimated < card.creditScoreMin) {
      blockers.push(`Estimated credit score range too low for this card`);
      score -= 30;
    } else {
      met++;
    }
  }

  // Income check
  if (card.estimatedIncomeReq && profile.income) {
    total++;
    if (profile.income < card.estimatedIncomeReq) {
      const pct = Math.round((profile.income / card.estimatedIncomeReq) * 100);
      blockers.push(`Income $${profile.income.toLocaleString()} is below estimated requirement of $${card.estimatedIncomeReq.toLocaleString()} (${pct}% of target)`);
      score -= 25;
    } else {
      met++;
      reasons.push('Income meets estimated requirement');
    }
  }

  // Credit history check
  if (card.minCreditHistoryMonths > 0) {
    total++;
    if (profile.creditHistoryMonths < card.minCreditHistoryMonths) {
      const gap = card.minCreditHistoryMonths - profile.creditHistoryMonths;
      blockers.push(`Need ${gap} more months of credit history (${card.minCreditHistoryMonths} months recommended)`);
      score -= 20;
    } else {
      met++;
      reasons.push(`Credit history of ${profile.creditHistoryMonths} months meets requirement`);
    }
  }

  // Special requirements
  if (card.specialRequirements) {
    total++;
    met++; // special requirements are informational, not blocking
    reasons.push(`Note: ${card.specialRequirements}`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const eligible = blockers.length === 0;

  return { eligible, score, reasons, blockers, met, total };
}

/**
 * Get readiness percentage for a dream card
 */
export function getReadiness(profile, card) {
  const { score } = checkEligibility(profile, card);
  return score;
}

/**
 * Rank all cards by eligibility for this user
 */
export function rankCards(profile, cards) {
  return cards
    .map((card) => ({
      card,
      ...checkEligibility(profile, card),
    }))
    .sort((a, b) => b.score - a.score);
}
