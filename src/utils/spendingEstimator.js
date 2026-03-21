/**
 * Estimate monthly spending from income and housing cost.
 * Based on BLS Consumer Expenditure Survey approximations.
 */
export function estimateSpending(income, housingCost) {
  const monthly = (income || 0) / 12;
  const afterHousing = Math.max(monthly - (housingCost || 0), 0);

  return {
    dining: Math.round(afterHousing * 0.08),
    groceries: Math.round(afterHousing * 0.12),
    travel: Math.round(afterHousing * 0.05),
    gas: Math.round(afterHousing * 0.06),
    onlineShopping: Math.round(afterHousing * 0.08),
    entertainment: Math.round(afterHousing * 0.05),
    subscriptions: Math.round(afterHousing * 0.03),
    transportation: Math.round(afterHousing * 0.06),
  };
}
