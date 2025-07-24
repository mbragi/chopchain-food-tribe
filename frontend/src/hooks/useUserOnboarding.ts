import { useState, useEffect, useCallback } from 'react';

export type UserType = 'customer' | 'vendor' | 'delivery_agent' | null;
export type OnboardingStep = 'landing' | 'user_type_selection' | 'onboarding' | 'completed';

interface UserOnboardingState {
  isFirstTime: boolean;
  userType: UserType;
  currentStep: OnboardingStep;
  hasCompletedOnboarding: boolean;
  hasSeenLanding: boolean;
}

const STORAGE_KEY = 'chopchain_user_onboarding';

const defaultState: UserOnboardingState = {
  isFirstTime: true,
  userType: null,
  currentStep: 'landing',
  hasCompletedOnboarding: false,
  hasSeenLanding: false,
};

export function useUserOnboarding() {
  const [state, setState] = useState<UserOnboardingState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserOnboardingState;
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  const saveState = useCallback((newState: UserOnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, []);

  // Mark landing as seen
  const markLandingSeen = useCallback(() => {
    const newState: UserOnboardingState = {
      ...state,
      hasSeenLanding: true,
      currentStep: 'user_type_selection',
    };
    saveState(newState);
  }, [state, saveState]);

  // Set user type and move to onboarding
  const setUserType = useCallback((type: UserType) => {
    const newState: UserOnboardingState = {
      ...state,
      userType: type,
      currentStep: 'onboarding',
      isFirstTime: false,
    };
    saveState(newState);
  }, [state, saveState]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    const newState: UserOnboardingState = {
      ...state,
      currentStep: 'completed',
      hasCompletedOnboarding: true,
    };
    saveState(newState);
  }, [state, saveState]);

  // Reset onboarding (for testing/demo purposes)
  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    } catch (error) {
      console.error('Failed to reset onboarding state:', error);
    }
  }, []);

  // Skip onboarding (go directly to main app)
  const skipOnboarding = useCallback(() => {
    const newState: UserOnboardingState = {
      ...state,
      currentStep: 'completed',
      hasCompletedOnboarding: true,
      userType: 'customer', // Default to customer
      isFirstTime: false,
    };
    saveState(newState);
  }, [state, saveState]);

  // Get next step URL based on user type
  const getNextStepUrl = useCallback(() => {
    switch (state.currentStep) {
      case 'landing':
        return '/user-type-selection';
      case 'user_type_selection':
        return '/onboarding';
      case 'onboarding':
        if (state.userType === 'vendor') {
          return '/vendor/register';
        } else if (state.userType === 'delivery_agent') {
          return '/delivery-agent/register';
        }
        return '/browse';
      case 'completed':
        return '/browse';
      default:
        return '/';
    }
  }, [state]);

  // Check if user should see main app
  const shouldShowMainApp = useCallback(() => {
    return state.hasCompletedOnboarding && state.currentStep === 'completed';
  }, [state]);

  // Check if user should see landing
  const shouldShowLanding = useCallback(() => {
    return state.isFirstTime && !state.hasSeenLanding;
  }, [state]);

  return {
    // State
    ...state,
    isLoaded,

    // Actions
    markLandingSeen,
    setUserType,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,

    // Computed
    getNextStepUrl,
    shouldShowMainApp,
    shouldShowLanding,
  };
}