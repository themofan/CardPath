import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useUser } from '../context/UserContext';
import ProgressBar from '../components/onboarding/ProgressBar';
import Step1BasicInfo from '../components/onboarding/Step1BasicInfo';
import Step2CreditProfile from '../components/onboarding/Step2CreditProfile';
import Step3SpendingChoice from '../components/onboarding/Step3SpendingChoice';
import Step3BManualSpending from '../components/onboarding/Step3BManualSpending';
import Step4GmailResults from '../components/onboarding/Step4GmailResults';
import Step6Priorities from '../components/onboarding/Step6Priorities';
import LoadingScreen from '../components/onboarding/LoadingScreen';

// All possible steps
const STEP_KEYS = [
  'basic',       // Step 1
  'credit',      // Step 2
  'spending-choice', // Step 3
  'manual-spending', // Step 3B
  'gmail-results',   // Step 4 (placeholder)
  'priorities',  // Step 5
];

function getVisibleSteps(spendingSource) {
  // Gmail path: choice → gmail-results → future → priorities
  // Manual path: choice → manual-spending → future → priorities
  // Default (before choice): show up to spending-choice
  if (spendingSource === 'gmail') {
    return ['basic', 'credit', 'spending-choice', 'gmail-results', 'priorities'];
  }
  // Manual or default
  return ['basic', 'credit', 'spending-choice', 'manual-spending', 'priorities'];
}

export default function OnboardingScreen() {
  const { dispatch } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [form, setForm] = useState({
    age: 18,
    income: 30000,
    employmentStatus: '',
    monthlyHousingCost: 0,
    creditScoreAwareness: '',
    creditScore: null,
    numCreditCards: 0,
    currentCards: [],
    oldestCardAge: '',
    recentApplications: 0,
    spendingSource: '',
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
    priorities: [],
  });

  const visibleSteps = getVisibleSteps(form.spendingSource);
  const stepKey = visibleSteps[currentStep];

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const updateSpending = (cat, val) =>
    setForm((prev) => ({
      ...prev,
      monthlySpending: { ...prev.monthlySpending, [cat]: val },
    }));

  const canAdvance = () => {
    switch (stepKey) {
      case 'basic':
        return form.employmentStatus && form.age;
      case 'credit':
        return form.creditScoreAwareness;
      case 'spending-choice':
        return false; // Advance handled by choice callback
      case 'manual-spending':
        return true;
      case 'gmail-results':
        return false; // Advance handled by button
      case 'priorities':
        return form.priorities.length >= 1;
      default:
        return true;
    }
  };

  const handleSpendingChoice = (source) => {
    update('spendingSource', source);
    // Jump to next step after choice
    const newSteps = getVisibleSteps(source);
    const nextIndex = newSteps.indexOf(source === 'gmail' ? 'gmail-results' : 'manual-spending');
    setCurrentStep(nextIndex);
  };

  const handleGmailGoManual = () => {
    update('spendingSource', 'manual');
    const newSteps = getVisibleSteps('manual');
    const nextIndex = newSteps.indexOf('manual-spending');
    setCurrentStep(nextIndex);
  };

  const goNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step — show loading
      setShowLoading(true);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      // If going back from manual-spending or gmail-results, go to spending-choice
      if (stepKey === 'manual-spending' || stepKey === 'gmail-results') {
        const choiceIndex = visibleSteps.indexOf('spending-choice');
        setCurrentStep(choiceIndex);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const finish = (projectedSpending) => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        age: form.age,
        income: form.income,
        employmentStatus: form.employmentStatus,
        monthlyHousingCost: form.monthlyHousingCost,
        creditScoreAwareness: form.creditScoreAwareness,
        creditScore: form.creditScore,
        numCreditCards: form.numCreditCards,
        currentCards: form.currentCards,
        oldestCardAge: form.oldestCardAge,
        recentApplications: form.recentApplications,
        spendingSource: form.spendingSource,
        monthlySpending: form.monthlySpending,
        projectedSpending: projectedSpending,
        priorities: form.priorities,
      },
    });
    dispatch({ type: 'SET_ONBOARDED' });
  };

  if (showLoading) {
    return <LoadingScreen form={form} onComplete={finish} />;
  }

  const renderStep = () => {
    switch (stepKey) {
      case 'basic':
        return <Step1BasicInfo form={form} update={update} />;
      case 'credit':
        return <Step2CreditProfile form={form} update={update} />;
      case 'spending-choice':
        return <Step3SpendingChoice onChoose={handleSpendingChoice} />;
      case 'manual-spending':
        return <Step3BManualSpending form={form} updateSpending={updateSpending} />;
      case 'gmail-results':
        return <Step4GmailResults onGoManual={handleGmailGoManual} />;
      case 'priorities':
        return <Step6Priorities form={form} update={update} />;
      default:
        return null;
    }
  };

  // Hide nav buttons for choice/gmail steps (they have their own navigation)
  const hideNav = stepKey === 'spending-choice' || stepKey === 'gmail-results';
  const isLast = currentStep === visibleSteps.length - 1;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ProgressBar current={currentStep} total={visibleSteps.length} />
        {renderStep()}
      </ScrollView>

      {!hideNav && (
        <View style={styles.navRow}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance() && styles.nextBtnDisabled]}
            onPress={goNext}
            disabled={!canAdvance()}
          >
            <Text style={styles.nextText}>
              {isLast ? "Let's Go!" : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40, paddingTop: 50 },
  navRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  backText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
