import React, { useMemo, useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import cards from '../data/cards.json';
import { getReadiness, rankCards } from '../utils/eligibility';
import { askGemini, isAPIConfigured } from '../api/gemini';
import { buildAdvicePrompt } from '../api/aiPromptBuilder';

import AIRecommendation from '../components/dashboard/AIRecommendation';
import StatsCards from '../components/dashboard/StatsCards';
import RecommendedCards from '../components/dashboard/RecommendedCards';
import PathPreview from '../components/dashboard/PathPreview';

const activeCards = cards.filter((c) => c.active !== false);

function getScoreInfo(score) {
  if (!score) return { label: 'Not Set', color: '#7A7067' };
  if (score >= 800) return { label: 'Excellent', color: '#6EE7B7' };
  if (score >= 740) return { label: 'Very Good', color: '#6EE7B7' };
  if (score >= 670) return { label: 'Good', color: '#D4A017' };
  if (score >= 580) return { label: 'Fair', color: '#D4A017' };
  return { label: 'Needs Work', color: '#B91C1C' };
}

export default function DashboardScreen({ onNavigate }) {
  const { profile } = useUser();

  // AI recommendation state
  const [recommendation, setRecommendation] = useState('');
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  // Computed data from profile
  const currentCards = useMemo(
    () => (profile.currentCards || []).map((id) => cards.find((c) => c.id === id)).filter(Boolean),
    [profile.currentCards]
  );

  const topRecommendations = useMemo(
    () => rankCards(profile, activeCards).slice(0, 3),
    [profile]
  );

  const dreamCard = useMemo(
    () => (profile.dreamCard ? cards.find((c) => c.id === profile.dreamCard) : null),
    [profile.dreamCard]
  );

  const dreamReadiness = useMemo(
    () => (dreamCard ? getReadiness(profile, dreamCard) : 0),
    [profile, dreamCard]
  );

  const greetingSubtitle = useMemo(() => {
    const spending = profile.monthlySpending || {};
    const entries = Object.entries(spending).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);

    if (profile.dreamCard) {
      const dream = cards.find(c => c.id === profile.dreamCard);
      if (dream && dreamReadiness >= 80) return `You're almost ready for the ${dream.name} — keep it up!`;
      if (dream) return `Working toward the ${dream.name} — let's get you there.`;
    }

    if (entries.length > 0) {
      const topCat = entries[0][0].replace(/([A-Z])/g, ' $1').toLowerCase();
      const topAmount = entries[0][1];
      return `You spend $${topAmount}/mo on ${topCat} — let's optimize that.`;
    }

    if (profile.creditScore && profile.creditScore >= 740) return "Your credit score is strong — new doors are opening.";
    if (profile.creditScore && profile.creditScore >= 670) return "Your score is climbing — keep building.";

    return "What are you looking for today?";
  }, [profile, dreamReadiness]);

  const totalSpend = Object.values(profile.monthlySpending || {}).reduce((s, v) => s + (v || 0), 0);
  const topCategory = Object.entries(profile.monthlySpending || {})
    .sort(([, a], [, b]) => b - a)[0];
  const scoreInfo = getScoreInfo(profile.creditScore);

  // Fetch AI recommendation
  const fetchRecommendation = async () => {
    if (!isAPIConfigured()) {
      setRecommendation(
        "Add your Gemini API key to get personalized AI advice! For now, check out the Card Explorer and Path Planner for recommendations based on your profile."
      );
      return;
    }
    setIsLoadingRec(true);
    try {
      const prompt = buildAdvicePrompt(profile);
      const response = await askGemini(prompt);
      setRecommendation(response);
    } catch (e) {
      setRecommendation("Couldn't connect to AI advisor. Check your API key and try again.");
    } finally {
      setIsLoadingRec(false);
    }
  };

  useEffect(() => {
    if (!recommendation && !isLoadingRec) {
      fetchRecommendation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: '#2C2420' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-secondary-700">
              Hello, {profile.name || 'CardPath User'}!
            </h1>
            <p className="text-secondary-500 mt-1">
              {greetingSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Profile active
            </span>
          </div>
        </div>

        {/* Row 1: AI Recommendation */}
        <AIRecommendation
          recommendation={recommendation}
          isLoading={isLoadingRec}
          onFetch={fetchRecommendation}
          onNavigate={onNavigate}
        />

        {/* Row 2: Stats Cards */}
        <StatsCards
          creditScore={profile.creditScore}
          scoreInfo={scoreInfo}
          totalSpend={totalSpend}
          topCategory={topCategory}
          cardsOwned={currentCards.length}
          cardNames={currentCards.map((c) => c.name)}
          onNavigate={onNavigate}
        />

        {/* Row 3: Recommended Cards */}
        <RecommendedCards
          recommendations={topRecommendations}
          onNavigate={onNavigate}
        />

        {/* Row 4: Path Preview */}
        <PathPreview
          currentCards={currentCards}
          dreamCard={dreamCard}
          dreamReadiness={dreamReadiness}
          onNavigate={onNavigate}
        />

      </div>
    </div>
  );
}
