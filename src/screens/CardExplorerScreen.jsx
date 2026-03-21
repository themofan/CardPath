import React, { useState, useMemo } from 'react';
import cards from '../data/cards.json';
import cardCategories from '../data/cardCategories.json';
import CardTile from '../components/CardTile';
import CardDetailScreen from './CardDetailScreen';
import { useUser } from '../context/UserContext';

const TIER_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'starter', label: 'Starter' },
  { value: 'mid-tier', label: 'Mid-Tier' },
  { value: 'premium', label: 'Premium' },
  { value: 'ultra-premium', label: 'Ultra-Premium' },
];

export default function CardExplorerScreen() {
  const { profile } = useUser();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [issuerFilter, setIssuerFilter] = useState('all');
  const [selectedCardId, setSelectedCardId] = useState(null);

  const ownedIds = new Set(profile.currentCards || []);
  const dreamId = profile.dreamCard;

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (issuerFilter !== 'all' && c.issuer !== issuerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.issuer.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, tierFilter, issuerFilter]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2C2420' }}>
      {/* Search */}
      <div className="sticky top-0 z-10 p-4 pb-2" style={{ backgroundColor: '#2C2420' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards..."
          className="w-full bg-[#3A322C] border border-border rounded-xl px-4 py-3 text-secondary-700 text-sm placeholder-secondary-500 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tier Filter Chips */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {TIER_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTierFilter(f.value)}
            className={`
              px-3.5 py-1.5 rounded-2xl text-sm border cursor-pointer transition-colors
              ${tierFilter === f.value
                ? 'bg-primary border-primary text-white font-semibold'
                : 'bg-[#3A322C] border-border text-secondary-500 hover:border-primary'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Issuer Filter Chips */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        <button
          onClick={() => setIssuerFilter('all')}
          className={`
            px-3.5 py-1.5 rounded-2xl text-sm border cursor-pointer transition-colors
            ${issuerFilter === 'all'
              ? 'bg-primary border-primary text-white font-semibold'
              : 'bg-[#3A322C] border-border text-secondary-500 hover:border-primary'
            }
          `}
        >
          All Issuers
        </button>
        {cardCategories.issuers.map((issuer) => (
          <button
            key={issuer}
            onClick={() => setIssuerFilter(issuer)}
            className={`
              px-3.5 py-1.5 rounded-2xl text-sm border cursor-pointer transition-colors
              ${issuerFilter === issuer
                ? 'bg-primary border-primary text-white font-semibold'
                : 'bg-[#3A322C] border-border text-secondary-500 hover:border-primary'
              }
            `}
          >
            {issuer}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="px-4 text-secondary-500 text-xs mb-1">
        {filtered.length === 0 ? 'No cards match — try broadening your filters' : `${filtered.length} cards`}
      </p>

      {/* Card Grid */}
      <div
        className="px-4 pb-5 overflow-y-auto grid gap-2.5 content-start"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}
      >
        {filtered.map((item) => (
          <CardTile
            key={item.id}
            card={item}
            isOwned={ownedIds.has(item.id)}
            isDream={dreamId === item.id}
            onPress={() => setSelectedCardId(item.id)}
          />
        ))}
      </div>

      {/* Card Detail Modal */}
      {selectedCardId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCardId(null)}
        >
          <div
            className="bg-[#3A322C] rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCardId(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-secondary-500 hover:text-secondary-700 cursor-pointer transition-colors"
            >
              {'\u2715'}
            </button>
            <CardDetailScreen cardId={selectedCardId} onClose={() => setSelectedCardId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
