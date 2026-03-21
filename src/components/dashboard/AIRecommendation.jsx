import React from 'react';
import { Sparkles } from 'lucide-react';
import Markdown from '../Markdown';

export default function AIRecommendation({ recommendation, isLoading, onFetch, onNavigate }) {
  return (
    <div className="bg-[#3A322C] rounded-2xl p-5 border border-border border-l-4 border-l-primary shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-[#F0EBE3] font-semibold text-sm">Your Recommendation</h3>
      </div>

      {recommendation ? (
        <Markdown text={recommendation} className="text-[#F0EBE3]" />
      ) : isLoading ? (
        <p className="text-primary text-sm animate-pulse">Thinking...</p>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-secondary-500 text-sm">Get a personalized analysis of your credit card journey.</p>
          <button
            onClick={onFetch}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors shrink-0 ml-4"
          >
            Get Advice
          </button>
        </div>
      )}

      {recommendation && (
        <div
          onClick={() => onNavigate && onNavigate('advisor')}
          className="mt-3 flex items-center gap-2 bg-[#3A322C] border border-[#1a1a1a] rounded-xl px-4 py-2.5 cursor-pointer hover:border-primary transition-colors"
        >
          <span className="text-[#888888] text-sm flex-1">Ask a follow-up question...</span>
          <span className="text-[#888888] text-sm font-semibold">&rarr;</span>
        </div>
      )}
    </div>
  );
}
