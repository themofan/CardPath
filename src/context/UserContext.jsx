import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { supabase } from '../api/supabase';

const STORAGE_KEY = '@cardpath_user';

const defaultProfile = {
  onboarded: false,
  name: '',
  age: null,
  income: null,
  employmentStatus: '',       // student, employed, self-employed, unemployed
  monthlyHousingCost: 0,
  creditScore: null,
  creditScoreAwareness: '',   // 'yes' | 'roughly' | 'no-idea'
  creditHistoryMonths: 0,
  numCreditCards: 0,
  currentCards: [],            // array of card IDs
  oldestCardAge: '',           // 'none' | '<6mo' | '6-12mo' | '1-2yr' | '2-5yr' | '5+yr'
  recentApplications: 0,
  monthlySpending: {
    dining: 0,
    groceries: 0,
    travel: 0,
    gas: 0,
    onlineShopping: 0,
    entertainment: 0,
    subscriptions: 0,
    transportation: 0,
  },
  spendingSource: '',          // 'gmail' | 'manual'
  futureSpendingIntent: '',    // 'same' | 'changing'
  futureSpendingDescription: '',
  projectedSpending: null,     // Gemini-adjusted spending or null
  preferredCreditLimit: null,  // minimum credit limit user wants, or null (no preference)
  priorities: [],              // Ordered array of priority keys
  dreamCard: null,             // card ID
};

// Convert oldestCardAge string to approximate months
function oldestCardAgeToMonths(ageStr) {
  const map = {
    'none': 0,
    '<6mo': 3,
    '6-12mo': 9,
    '1-2yr': 18,
    '2-5yr': 42,
    '5+yr': 72,
  };
  return map[ageStr] || 0;
}

function userReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PROFILE':
      return { ...state, ...action.payload };
    case 'UPDATE_PROFILE': {
      const updates = { ...action.payload };
      if (updates.oldestCardAge && !updates.creditHistoryMonths) {
        updates.creditHistoryMonths = oldestCardAgeToMonths(updates.oldestCardAge);
      }
      return { ...state, ...updates };
    }
    case 'SET_ONBOARDED':
      return { ...state, onboarded: true };
    case 'SET_SPENDING_PROJECTION':
      return { ...state, projectedSpending: action.payload };
    case 'ADD_CARD':
      return {
        ...state,
        currentCards: [...state.currentCards, action.payload],
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        currentCards: state.currentCards.filter((id) => id !== action.payload),
      };
    case 'SET_DREAM_CARD':
      return { ...state, dreamCard: action.payload };
    case 'RESET':
      return { ...defaultProfile };
    default:
      return state;
  }
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, dispatch] = useReducer(userReducer, defaultProfile);
  const [user, setUser] = useState(null);       // Supabase auth user
  const [authLoading, setAuthLoading] = useState(true);

  // Load profile from Supabase for a given user ID
  const loadProfileFromSupabase = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('data')
      .eq('id', userId)
      .single();

    if (data?.data) {
      dispatch({ type: 'LOAD_PROFILE', payload: data.data });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
    } else {
      // No profile yet — check localStorage as fallback
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          dispatch({ type: 'LOAD_PROFILE', payload: JSON.parse(stored) });
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Save profile to Supabase
  const saveProfileToSupabase = useCallback(async (userId, profileData) => {
    await supabase
      .from('profiles')
      .upsert({ id: userId, data: profileData, updated_at: new Date().toISOString() });
  }, []);

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfileFromSupabase(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        dispatch({ type: 'RESET' });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfileFromSupabase]);

  // Persist profile on every change
  useEffect(() => {
    if (profile.onboarded || profile.age) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) { /* ignore */ }

      // Sync to Supabase if authenticated
      if (user) {
        saveProfileToSupabase(user.id, profile);
      }
    }
  }, [profile, user, saveProfileToSupabase]);

  // Auth helpers
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await loadProfileFromSupabase(data.user.id);
    if (data.user.user_metadata?.name) {
      dispatch({ type: 'UPDATE_PROFILE', payload: { name: data.user.user_metadata.name } });
    }
    return data;
  }, [loadProfileFromSupabase]);

  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    setUser(data.user);
    dispatch({ type: 'UPDATE_PROFILE', payload: { name } });
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    dispatch({ type: 'RESET' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <UserContext.Provider value={{ profile, dispatch, user, authLoading, signIn, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
