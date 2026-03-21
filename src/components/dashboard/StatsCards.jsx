import React from 'react';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';

const SPENDING_LABELS = {
  dining: 'Dining', groceries: 'Groceries', travel: 'Travel', gas: 'Gas',
  onlineShopping: 'Online Shopping', entertainment: 'Entertainment',
  subscriptions: 'Subscriptions', transportation: 'Transportation',
};

export default function StatsCards({ creditScore, scoreInfo, totalSpend, topCategory, cardsOwned, cardNames, onNavigate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Credit Score */}
      <div className="bg-[#3A322C] rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-secondary-500 font-semibold text-sm">Credit Score</h3>
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color: scoreInfo.color }}>
          {creditScore || 'N/A'}
        </div>
        <p className="text-sm font-medium" style={{ color: scoreInfo.color }}>
          {scoreInfo.label}
        </p>
        <p className="text-secondary-400 text-xs mt-2">Self-reported</p>
      </div>

      {/* Monthly Spend */}
      <div className="bg-[#3A322C] rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-secondary-500 font-semibold text-sm">Monthly Spend</h3>
        </div>
        <div className="text-3xl font-bold text-secondary-700 mb-1">
          ${totalSpend.toLocaleString()}
        </div>
        {topCategory && topCategory[1] > 0 ? (
          <p className="text-secondary-500 text-sm">
            Top: {SPENDING_LABELS[topCategory[0]] || topCategory[0]} (${topCategory[1]}/mo)
          </p>
        ) : (
          <p className="text-secondary-400 text-sm">No spending data</p>
        )}
        <p className="text-secondary-400 text-xs mt-2">Across 8 categories</p>
      </div>

      {/* Cards Owned */}
      <div className="bg-[#3A322C] rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-secondary-500 font-semibold text-sm">Cards Owned</h3>
        </div>
        <div className="text-3xl font-bold text-secondary-700 mb-1">
          {cardsOwned}
        </div>
        {cardNames.length > 0 ? (
          <div className="text-secondary-500 text-sm">
            {cardNames.slice(0, 2).join(', ')}
            {cardNames.length > 2 && ` +${cardNames.length - 2} more`}
          </div>
        ) : (
          <p className="text-secondary-400 text-sm">No cards added yet</p>
        )}
        <button
          onClick={() => onNavigate('settings')}
          className="text-primary text-xs font-medium mt-2 cursor-pointer hover:underline"
        >
          Manage in Settings
        </button>
      </div>
    </div>
  );
}
