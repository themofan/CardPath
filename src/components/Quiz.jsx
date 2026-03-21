import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import cardsData from '../data/cards.json';
import { estimateSpending } from '../utils/spendingEstimator';

const STEPS = [
  { title: 'Basic Info', description: 'Tell us about yourself so we can personalize your recommendations.' },
  { title: 'Credit Profile', description: 'Help us understand your credit history and current cards.' },
  { title: 'Monthly Spending', description: 'Estimate how much you spend in each category per month.' },
  { title: 'Your Priorities', description: 'What matters most to you in a credit card?' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
];

const SCORE_RANGES = [
  { value: 'poor', label: 'Poor', range: '300-579' },
  { value: 'fair', label: 'Fair', range: '580-669' },
  { value: 'good', label: 'Good', range: '670-739' },
  { value: 'excellent', label: 'Excellent', range: '740-850' },
];

const OLDEST_CARD_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '<6mo', label: '< 6 months' },
  { value: '6-12mo', label: '6-12 months' },
  { value: '1-2yr', label: '1-2 years' },
  { value: '2-5yr', label: '2-5 years' },
  { value: '5+yr', label: '5+ years' },
];

const SPENDING_CATEGORIES = [
  { key: 'dining', label: 'Dining' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'travel', label: 'Travel' },
  { key: 'gas', label: 'Gas' },
  { key: 'onlineShopping', label: 'Online Shopping' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'transportation', label: 'Transportation' },
];

const PRIORITY_OPTIONS = [
  { value: 'cashback', label: 'Cash Back' },
  { value: 'travel-rewards', label: 'Travel Rewards' },
  { value: 'build-credit', label: 'Build Credit' },
  { value: 'low-fees', label: 'Low Fees' },
  { value: 'sign-up-bonus', label: 'Sign-Up Bonus' },
  { value: 'premium-perks', label: 'Premium Perks' },
  { value: 'balance-transfer', label: 'Balance Transfer' },
];

export default function Quiz({ onComplete }) {
  const { dispatch } = useUser();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [age, setAge] = useState(25);
  const [income, setIncome] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyHousingCost, setMonthlyHousingCost] = useState('');

  // Step 2 state
  const [creditScoreAwareness, setCreditScoreAwareness] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [creditScoreRange, setCreditScoreRange] = useState('');
  const [numCreditCards, setNumCreditCards] = useState(0);
  const [oldestCardAge, setOldestCardAge] = useState('');
  const [recentApplications, setRecentApplications] = useState(0);
  const [currentCards, setCurrentCards] = useState([]);
  const [cardSearch, setCardSearch] = useState('');

  // Step 3 state
  const [preferredCreditLimit, setPreferredCreditLimit] = useState('');
  const [skipSpending, setSkipSpending] = useState(false);
  const [spending, setSpending] = useState({
    dining: '',
    groceries: '',
    travel: '',
    gas: '',
    onlineShopping: '',
    entertainment: '',
    subscriptions: '',
    transportation: '',
  });

  // Step 4 state — all items pre-populated in default order, user drags to reorder
  const [priorities, setPriorities] = useState(PRIORITY_OPTIONS.map((o) => o.value));
  const [dragIdx, setDragIdx] = useState(null);

  const filteredCards = useMemo(() => {
    if (!cardSearch.trim()) return [];
    const query = cardSearch.toLowerCase();
    return cardsData
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.issuer.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [cardSearch]);

  const handleCardToggle = (cardId) => {
    setCurrentCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleDragStart = (idx) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setPriorities((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  const updateSpending = (key, val) => {
    setSpending((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleComplete = () => {
    const incomeNum = Number(income) || 0;
    const housingNum = Number(monthlyHousingCost) || 0;

    let monthlySpending;
    let spendingSource;
    if (skipSpending) {
      monthlySpending = estimateSpending(incomeNum, housingNum);
      spendingSource = 'estimated';
    } else {
      monthlySpending = {};
      for (const cat of SPENDING_CATEGORIES) {
        monthlySpending[cat.key] = Number(spending[cat.key]) || 0;
      }
      spendingSource = 'manual';
    }

    let resolvedScore = null;
    if (creditScoreAwareness === 'yes') {
      resolvedScore = Number(creditScore) || null;
    } else if (creditScoreAwareness === 'roughly') {
      const rangeMap = { poor: 500, fair: 625, good: 700, excellent: 790 };
      resolvedScore = rangeMap[creditScoreRange] || null;
    }

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        age,
        income: incomeNum,
        employmentStatus,
        monthlyHousingCost: housingNum,
        creditScore: resolvedScore,
        creditScoreAwareness,
        numCreditCards,
        oldestCardAge,
        recentApplications,
        currentCards,
        monthlySpending,
        spendingSource,
        preferredCreditLimit: Number(preferredCreditLimit) || null,
        priorities,
      },
    });
    dispatch({ type: 'SET_ONBOARDED' });
    onComplete();
  };

  const canGoNext = () => {
    switch (step) {
      case 0:
        return age && employmentStatus;
      case 1:
        return creditScoreAwareness && oldestCardAge;
      case 2:
        return true;
      case 3:
        return true; // all 7 priorities are always present, just reordered
      default:
        return false;
    }
  };

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#2C2420] flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-2xl bg-[#3A322C] rounded-2xl shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-[#4A4038]">
          <div
            className="h-full bg-[#10B981] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[#10B981] mb-1">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold text-[#F0EBE3]">{STEPS[step].title}</h2>
            <p className="text-[#B0A898] mt-1">{STEPS[step].description}</p>
          </div>

          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Age Slider */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Age: <span className="text-[#10B981]">{age}</span>
                </label>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-2 bg-[#4A4038] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                />
                <div className="flex justify-between text-xs text-[#B0A898] mt-1">
                  <span>18</span>
                  <span>80</span>
                </div>
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Annual Income
                </label>
                <div className="flex items-center bg-[#3A322C] border border-[#4A4038] rounded-xl px-4 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]">
                  <span className="text-[#F0EBE3] font-semibold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={income}
                    onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="flex-1 bg-transparent py-3 px-2 text-[#F0EBE3] outline-none placeholder-[#6A6058]"
                  />
                  <span className="text-[#B0A898] text-sm">/year</span>
                </div>
              </div>

              {/* Employment Status */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Employment Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEmploymentStatus(opt.value)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                        employmentStatus === opt.value
                          ? 'bg-[#1A3A2A] border-[#10B981] text-[#10B981]'
                          : 'bg-[#3A322C] border-[#4A4038] text-[#B0A898] hover:border-[#6A6058]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Fixed Expenses */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-1">
                  Monthly Fixed Expenses
                </label>
                <p className="text-xs text-[#B0A898] mb-2">
                  Rent, car payment, tuition, utilities, insurance, etc.
                </p>
                <div className="flex items-center bg-[#3A322C] border border-[#4A4038] rounded-xl px-4 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]">
                  <span className="text-[#F0EBE3] font-semibold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={monthlyHousingCost}
                    onChange={(e) =>
                      setMonthlyHousingCost(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    placeholder="0"
                    className="flex-1 bg-transparent py-3 px-2 text-[#F0EBE3] outline-none placeholder-[#6A6058]"
                  />
                  <span className="text-[#B0A898] text-sm">/month</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Credit Score Awareness */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Do you know your credit score?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'yes', label: 'Yes, I know it' },
                    { value: 'roughly', label: 'Roughly' },
                    { value: 'no-idea', label: 'No idea' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCreditScoreAwareness(opt.value)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                        creditScoreAwareness === opt.value
                          ? 'bg-[#1A3A2A] border-[#10B981] text-[#10B981]'
                          : 'bg-[#3A322C] border-[#4A4038] text-[#B0A898] hover:border-[#6A6058]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Score Input (exact) */}
              {creditScoreAwareness === 'yes' && (
                <div>
                  <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                    Your Credit Score
                  </label>
                  <input
                    type="number"
                    min={300}
                    max={850}
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                    placeholder="e.g. 720"
                    className={`w-full bg-[#3A322C] border rounded-xl px-4 py-3 text-[#F0EBE3] outline-none focus:ring-1 placeholder-[#6A6058] ${
                      creditScore && (Number(creditScore) < 300 || Number(creditScore) > 850)
                        ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]'
                        : 'border-[#4A4038] focus:border-[#10B981] focus:ring-[#10B981]'
                    }`}
                  />
                  {creditScore && Number(creditScore) < 300 && (
                    <p className="text-[#B91C1C] text-xs mt-1">Credit score must be at least 300</p>
                  )}
                  {creditScore && Number(creditScore) > 850 && (
                    <p className="text-[#B91C1C] text-xs mt-1">Credit score cannot exceed 850</p>
                  )}
                </div>
              )}

              {/* Credit Score Range */}
              {creditScoreAwareness === 'roughly' && (
                <div>
                  <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                    Approximate Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCORE_RANGES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setCreditScoreRange(r.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          creditScoreRange === r.value
                            ? 'bg-[#1A3A2A] border-[#10B981] text-[#10B981]'
                            : 'bg-[#3A322C] border-[#4A4038] text-[#B0A898] hover:border-[#6A6058]'
                        }`}
                      >
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-xs opacity-70">{r.range}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Number of Credit Cards */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Number of Credit Cards
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumCreditCards(Math.max(0, numCreditCards - 1))}
                    className="w-10 h-10 rounded-full bg-[#10B981] text-white font-bold text-lg flex items-center justify-center hover:bg-[#059669] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-[#F0EBE3] w-8 text-center">
                    {numCreditCards}
                  </span>
                  <button
                    onClick={() => setNumCreditCards(Math.min(20, numCreditCards + 1))}
                    className="w-10 h-10 rounded-full bg-[#10B981] text-white font-bold text-lg flex items-center justify-center hover:bg-[#059669] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Oldest Card Age */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Oldest Card Age
                </label>
                <div className="flex flex-wrap gap-2">
                  {OLDEST_CARD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOldestCardAge(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        oldestCardAge === opt.value
                          ? 'bg-[#1A3A2A] border-[#10B981] text-[#10B981]'
                          : 'bg-[#3A322C] border-[#4A4038] text-[#B0A898] hover:border-[#6A6058]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Applications in Last 6 Months
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setRecentApplications(Math.max(0, recentApplications - 1))
                    }
                    className="w-10 h-10 rounded-full bg-[#10B981] text-white font-bold text-lg flex items-center justify-center hover:bg-[#059669] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-[#F0EBE3] w-8 text-center">
                    {recentApplications}
                  </span>
                  <button
                    onClick={() =>
                      setRecentApplications(Math.min(10, recentApplications + 1))
                    }
                    className="w-10 h-10 rounded-full bg-[#10B981] text-white font-bold text-lg flex items-center justify-center hover:bg-[#059669] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Select Cards You Own */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-2">
                  Select Cards You Own
                </label>
                <input
                  type="text"
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  placeholder="Search cards by name or issuer..."
                  className="w-full bg-[#3A322C] border border-[#4A4038] rounded-xl px-4 py-3 text-[#F0EBE3] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder-[#6A6058] mb-2"
                />

                {/* Selected cards */}
                {currentCards.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentCards.map((cardId) => {
                      const card = cardsData.find((c) => c.id === cardId);
                      return (
                        <span
                          key={cardId}
                          onClick={() => handleCardToggle(cardId)}
                          className="inline-flex items-center gap-1 bg-[#1A3A2A] text-[#10B981] border border-[#10B981] rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-[#2A4A3A] transition-colors"
                        >
                          {card?.name || cardId}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search results */}
                {cardSearch.trim() && (
                  <div className="max-h-48 overflow-y-auto bg-[#3A322C] border border-[#4A4038] rounded-xl">
                    {filteredCards.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#B0A898]">No cards found</p>
                    ) : (
                      filteredCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => handleCardToggle(card.id)}
                          className={`w-full text-left px-4 py-3 border-b border-[#4A4038] last:border-b-0 hover:bg-[#3A322C] transition-colors ${
                            currentCards.includes(card.id) ? 'bg-[#1A3A2A] border-l-2 border-l-[#10B981]' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-[#F0EBE3]">
                            {currentCards.includes(card.id) && (
                              <span className="text-[#10B981] mr-1">&#10003;</span>
                            )}
                            {card.name}
                          </div>
                          <div className="text-xs text-[#B0A898]">{card.issuer}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Preferred credit limit */}
              <div>
                <label className="block text-sm font-semibold text-[#F0EBE3] mb-1">
                  Preferred Minimum Credit Limit
                </label>
                <p className="text-xs text-[#B0A898] mb-2">
                  What's the minimum credit limit you'd need? Leave blank if no preference.
                </p>
                <div className="flex items-center bg-[#3A322C] border border-[#4A4038] rounded-xl px-4 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]">
                  <span className="text-[#F0EBE3] font-semibold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={preferredCreditLimit}
                    onChange={(e) => setPreferredCreditLimit(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="No preference"
                    className="flex-1 bg-transparent py-3 px-2 text-[#F0EBE3] outline-none placeholder-[#6A6058]"
                  />
                </div>
              </div>

              <hr className="border-[#4A4038]" />

              {/* Skip spending toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipSpending}
                  onChange={(e) => setSkipSpending(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#10B981]"
                />
                <span className="text-sm text-[#B0A898]">
                  Skip spending details — estimate from my income instead
                </span>
              </label>

              {skipSpending ? (
                <div className="bg-[#1A3A2A] border border-[#1A3A2A] rounded-xl p-4">
                  <p className="text-sm text-[#10B981]">
                    We'll estimate your monthly spending based on your income
                    {income ? ` ($${Number(income).toLocaleString()}/yr)` : ''} and fixed expenses
                    {monthlyHousingCost ? ` ($${Number(monthlyHousingCost).toLocaleString()}/mo)` : ''}.
                    You can always update this later in Settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {SPENDING_CATEGORIES.map((cat) => {
                    const val = Number(spending[cat.key]) || 0;
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-semibold text-[#F0EBE3]">
                            {cat.label}
                          </label>
                          <div className="flex items-center bg-[#3A322C] border border-[#4A4038] rounded-lg px-2 py-1 w-24 focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]">
                            <span className="text-[#F0EBE3] text-xs font-semibold">$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={spending[cat.key]}
                              onChange={(e) =>
                                updateSpending(cat.key, e.target.value.replace(/[^0-9]/g, ''))
                              }
                              placeholder="0"
                              className="w-full bg-transparent text-right text-sm text-[#F0EBE3] outline-none placeholder-[#6A6058]"
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={2000}
                          step={10}
                          value={val}
                          onChange={(e) => updateSpending(cat.key, e.target.value)}
                          className="w-full h-2 bg-[#4A4038] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#B0A898]">
                Drag to reorder your priorities. The top item is your highest priority.
              </p>
              <div className="space-y-2">
                {priorities.map((val, i) => {
                  const opt = PRIORITY_OPTIONS.find((o) => o.value === val);
                  const isDragging = dragIdx === i;
                  return (
                    <div
                      key={val}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-grab active:cursor-grabbing
                        transition-all select-none
                        ${isDragging
                          ? 'border-[#10B981] bg-[#1A3A2A] opacity-60 scale-[0.98]'
                          : 'border-[#4A4038] bg-[#3A322C] hover:border-[#6A6058] hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Rank number */}
                      <span className="w-7 h-7 rounded-full bg-[#10B981] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>

                      {/* Label */}
                      <span className="text-[#F0EBE3] text-sm font-medium flex-1">
                        {opt?.label}
                      </span>

                      {/* Drag handle */}
                      <span className="text-[#B5AEA5] text-sm shrink-0 select-none">
                        ⠿
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                step === 0
                  ? 'invisible'
                  : 'bg-[#3A322C] border border-[#4A4038] text-[#F0EBE3] hover:bg-[#3A322C]'
              }`}
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                  canGoNext()
                    ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md'
                    : 'bg-[#4A4038] text-white cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canGoNext()}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                  canGoNext()
                    ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md'
                    : 'bg-[#4A4038] text-white cursor-not-allowed'
                }`}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
