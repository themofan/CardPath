import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import cards from '../data/cards.json';

export default function SettingsScreen({ onRetakeQuiz, onSignOut }) {
  const { profile, dispatch } = useUser();
  const [editingScore, setEditingScore] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [scoreValue, setScoreValue] = useState(profile.creditScore || '');
  const [incomeValue, setIncomeValue] = useState(profile.income || '');
  const [scoreError, setScoreError] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const currentCardObjects = (profile.currentCards || [])
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);

  const dreamCard = profile.dreamCard
    ? cards.find((c) => c.id === profile.dreamCard)
    : null;

  const saveScore = () => {
    const val = parseInt(scoreValue, 10);
    if (isNaN(val) || scoreValue === '') {
      setScoreError('Please enter a number');
      return;
    }
    if (val < 300) {
      setScoreError('Credit score must be at least 300');
      return;
    }
    if (val > 850) {
      setScoreError('Credit score cannot exceed 850');
      return;
    }
    setScoreError('');
    dispatch({ type: 'UPDATE_PROFILE', payload: { creditScore: val } });
    setEditingScore(false);
  };

  const saveIncome = () => {
    const val = parseInt(incomeValue, 10);
    if (isNaN(val) || incomeValue === '') {
      setIncomeError('Please enter a number');
      return;
    }
    if (val < 0) {
      setIncomeError('Income cannot be negative');
      return;
    }
    setIncomeError('');
    dispatch({ type: 'UPDATE_PROFILE', payload: { income: val } });
    setEditingIncome(false);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    dispatch({ type: 'RESET' });
    setConfirmReset(false);
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: '#2C2420' }}>
      <div className="max-w-2xl mx-auto p-4 pb-10">
        <h1 className="text-secondary-700 text-2xl font-bold mb-6">Settings</h1>

        {/* Profile Summary */}
        <div className="bg-surface rounded-xl p-4 mb-5">
          <h2 className="text-secondary-700 text-base font-bold mb-4">Profile Summary</h2>

          {/* Credit Score */}
          <div className="py-2 border-b border-border">
            <div className="flex justify-between items-center">
              <span className="text-secondary-500 text-sm">Credit Score</span>
              {editingScore ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={300}
                    max={850}
                    value={scoreValue}
                    onChange={(e) => { setScoreValue(e.target.value); setScoreError(''); }}
                    className={`w-20 bg-[#2C2420] border rounded px-2 py-1 text-secondary-700 text-sm outline-none focus:ring-1 ${scoreError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary'}`}
                    autoFocus
                  />
                  <button
                    onClick={saveScore}
                    className="text-primary text-sm font-semibold cursor-pointer hover:text-primary/80"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingScore(false); setScoreError(''); }}
                    className="text-secondary-500 text-sm cursor-pointer hover:text-secondary-700"
                  >
                    Cancel
                  </button>
                </div>
            ) : (
              <button
                onClick={() => { setScoreValue(profile.creditScore || ''); setEditingScore(true); }}
                className="text-secondary-700 text-sm font-semibold cursor-pointer hover:text-primary"
              >
                {profile.creditScore || 'Not set'} {'\u270E'}
              </button>
            )}
            </div>
            {scoreError && <p className="text-danger text-xs mt-1 text-right">{scoreError}</p>}
          </div>

          {/* Income */}
          <div className="py-2 border-b border-border">
            <div className="flex justify-between items-center">
              <span className="text-secondary-500 text-sm">Annual Income</span>
              {editingIncome ? (
                <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={incomeValue}
                  onChange={(e) => { setIncomeValue(e.target.value); setIncomeError(''); }}
                  className={`w-28 bg-[#2C2420] border rounded px-2 py-1 text-secondary-700 text-sm outline-none focus:ring-1 ${incomeError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary'}`}
                  autoFocus
                />
                <button
                  onClick={saveIncome}
                  className="text-primary text-sm font-semibold cursor-pointer hover:text-primary/80"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditingIncome(false); setIncomeError(''); }}
                  className="text-secondary-500 text-sm cursor-pointer hover:text-secondary-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIncomeValue(profile.income || ''); setEditingIncome(true); }}
                className="text-secondary-700 text-sm font-semibold cursor-pointer hover:text-primary"
              >
                {profile.income ? `$${profile.income.toLocaleString()}` : 'Not set'} {'\u270E'}
              </button>
            )}
            </div>
            {incomeError && <p className="text-danger text-xs mt-1 text-right">{incomeError}</p>}
          </div>

          {/* Employment */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-secondary-500 text-sm">Employment</span>
            <span className="text-secondary-700 text-sm capitalize">
              {profile.employmentStatus || 'Not set'}
            </span>
          </div>

          {/* Cards Owned */}
          <div className="flex justify-between items-center py-2">
            <span className="text-secondary-500 text-sm">Cards Owned</span>
            <span className="text-secondary-700 text-sm font-semibold">
              {(profile.currentCards || []).length}
            </span>
          </div>
        </div>

        {/* Current Cards */}
        <div className="bg-surface rounded-xl p-4 mb-5">
          <h2 className="text-secondary-700 text-base font-bold mb-3">Current Cards</h2>
          {currentCardObjects.length === 0 ? (
            <p className="text-secondary-500 text-sm">No cards added yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {currentCardObjects.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between bg-[#2C2420] border border-border rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-secondary-700 text-sm font-medium">{card.name}</p>
                    <p className="text-secondary-500 text-xs">{card.issuer}</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_CARD', payload: card.id })}
                    className="text-danger text-xs font-semibold cursor-pointer hover:text-danger/80 px-2 py-1 rounded hover:bg-danger/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dream Card */}
        {dreamCard && (
          <div className="bg-surface rounded-xl p-4 mb-5">
            <h2 className="text-secondary-700 text-base font-bold mb-3">Dream Card</h2>
            <div className="flex items-center justify-between bg-[#2C2420] border border-border rounded-lg px-3 py-2">
              <div>
                <p className="text-warning text-sm font-medium">{dreamCard.name}</p>
                <p className="text-secondary-500 text-xs">{dreamCard.issuer}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_DREAM_CARD', payload: null })}
                className="text-secondary-500 text-xs font-semibold cursor-pointer hover:text-secondary-700 px-2 py-1 rounded hover:bg-surface transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Preferred Credit Limit */}
        <div className="bg-surface rounded-xl p-4 mb-5">
          <h2 className="text-secondary-700 text-base font-bold mb-3">Preferred Credit Limit</h2>
          <div className="flex items-center gap-2">
            <span className="text-secondary-500">$</span>
            <input
              type="number"
              min={0}
              value={profile.preferredCreditLimit || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                dispatch({ type: 'UPDATE_PROFILE', payload: { preferredCreditLimit: val } });
              }}
              placeholder="No preference"
              className="flex-1 bg-[#2C2420] border border-border rounded-lg px-3 py-2 text-secondary-700 text-sm outline-none focus:ring-1 focus:ring-primary placeholder-secondary-500"
            />
          </div>
          <p className="text-secondary-500 text-xs mt-2">Minimum credit limit you'd need on a new card.</p>
        </div>

        {/* Monthly Spending */}
        <div className="bg-surface rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-secondary-700 text-base font-bold">Monthly Spending</h2>
            <div className="flex items-center gap-2">
              {profile.spendingSource === 'estimated' && (
                <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded">(estimated)</span>
              )}
              <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Include spending in recommendations">
                <input
                  type="checkbox"
                  checked={profile.spendingEnabled !== false}
                  onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { spendingEnabled: e.target.checked } })}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="text-secondary-500 text-xs">Consider</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(profile.monthlySpending || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-1">
                <span className="text-secondary-500 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center bg-[#2C2420] border border-border rounded-lg px-2 py-1 w-20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="text-secondary-700 text-xs font-semibold">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value || 0}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      dispatch({
                        type: 'UPDATE_PROFILE',
                        payload: {
                          monthlySpending: {
                            ...profile.monthlySpending,
                            [key]: Number(val) || 0,
                          },
                          spendingSource: 'manual',
                        },
                      });
                    }}
                    className="w-full bg-transparent text-right text-sm text-secondary-700 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          {Object.values(profile.monthlySpending || {}).every(v => !v || v === 0) && (
            <p className="text-primary text-xs mt-3">Add your spending to unlock personalized card recommendations</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onRetakeQuiz}
            className="w-full bg-primary hover:bg-primary/90 rounded-xl py-3.5 text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={onSignOut}
            className="w-full bg-[#2C2420] border border-secondary-300 hover:bg-surface rounded-xl py-3.5 text-secondary-700 font-semibold text-sm cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
