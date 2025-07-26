import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserOnboarding } from '@/hooks/useUserOnboarding';
import FoodBrowsing from '@/components/FoodBrowsing';
import Landing from './Landing';
import UserTypeSelection from '@/components/UserTypeSelection';

const Index = () => {
  const navigate = useNavigate();
  const {
    isLoaded,
    shouldShowLanding,
    shouldShowMainApp,
    currentStep,
    hasSeenLanding,
    userType
  } = useUserOnboarding();

  // Handle navigation for onboarding step
  useEffect(() => {
    if (isLoaded && currentStep === 'onboarding') {
      if (userType === 'vendor') {
        navigate('/vendor/register');
      } else if (userType === 'delivery_agent') {
        navigate('/delivery-agent/register');
      } else {
        // For customers, complete onboarding and go to main app
        navigate('/browse');
      }
    }
  }, [isLoaded, currentStep, userType, navigate]);

  // Wait for state to load from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ChopChain...</p>
        </div>
      </div>
    );
  }

  // Route based on onboarding state
  switch (currentStep) {
    case 'landing':
      return <Landing />;

    case 'user_type_selection':
      return <UserTypeSelection />;

    case 'onboarding':
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Setting up your ChopChain experience...</p>
          </div>
        </div>
      );

    case 'completed':
    default:
      return <FoodBrowsing />;
  }
};

export default Index;
