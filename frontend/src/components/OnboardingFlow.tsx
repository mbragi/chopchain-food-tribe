import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Wallet, 
  Shield, 
  Coins,
  Smartphone,
  Globe,
  BookOpen,
  Play,
  ExternalLink,
  AlertCircle,
  Info,
  Zap,
  DollarSign
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { useUserOnboarding } from '@/hooks/useUserOnboarding';
import { useNavigate } from 'react-router-dom';

interface OnboardingFlowProps {
  userType: 'customer' | 'vendor' | 'delivery_agent';
  onComplete?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: string;
  canSkip?: boolean;
}

export default function OnboardingFlow({ userType, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState({
    hasWallet: false,
    understoodCrypto: false,
    completedTutorial: false
  });

  const { connected, connect, address } = useWallet();
  const { toast } = useToast();
  const { completeOnboarding } = useUserOnboarding();
  const navigate = useNavigate();

  const cryptoTutorialSteps = [
    {
      title: 'What is a Cryptocurrency Wallet?',
      content: 'Think of a crypto wallet like your mobile banking app, but for digital currencies. It stores your digital money securely and lets you send and receive payments.',
      icon: Wallet,
      color: 'text-blue-500'
    },
    {
      title: 'What are Stablecoins?',
      content: 'Stablecoins like USDT are digital currencies that maintain stable value (1 USDT ≈ $1 ≈ ₦1,650). They\'re perfect for payments because their value doesn\'t fluctuate.',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'What are CHOP Tokens?',
      content: 'CHOP tokens are rewards you earn for using ChopChain. Like loyalty points, but these can be traded or saved. The more you use ChopChain, the more you earn!',
      icon: Coins,
      color: 'text-yellow-500'
    },
    {
      title: 'Smart Contracts & Escrow',
      content: 'Smart contracts automatically hold your payment until delivery is confirmed. This protects both customers and vendors - no one can run away with your money!',
      icon: Shield,
      color: 'text-purple-500'
    }
  ];

  const walletGuides = [
    {
      name: 'MetaMask',
      description: 'Most popular wallet, works on mobile and desktop',
      steps: ['Download MetaMask app', 'Create new wallet', 'Save your secret phrase', 'Add USDT to wallet'],
      downloadLink: 'https://metamask.io/download/',
      difficulty: 'Easy'
    },
    {
      name: 'Trust Wallet',
      description: 'Mobile-first wallet, very user-friendly',
      steps: ['Download Trust Wallet', 'Create wallet', 'Backup recovery phrase', 'Buy USDT with card'],
      downloadLink: 'https://trustwallet.com/',
      difficulty: 'Easy'
    },
    {
      name: 'Coinbase Wallet',
      description: 'Connected to Coinbase exchange for easy funding',
      steps: ['Download Coinbase Wallet', 'Link to Coinbase account', 'Transfer USDT from exchange', 'Connect to ChopChain'],
      downloadLink: 'https://wallet.coinbase.com/',
      difficulty: 'Medium'
    }
  ];

  const getStepsForUserType = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: `Welcome to ChopChain${userType === 'customer' ? '!' : userType === 'vendor' ? ', Vendor!' : ', Delivery Agent!'}`,
        description: 'Let\'s get you set up in just a few minutes',
        content: (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-sunset flex items-center justify-center mx-auto">
              {userType === 'customer' && <Smartphone className="w-10 h-10 text-white" />}
              {userType === 'vendor' && <DollarSign className="w-10 h-10 text-white" />}
              {userType === 'delivery_agent' && <Zap className="w-10 h-10 text-white" />}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {userType === 'customer' && 'Ready to Order with Crypto?'}
                {userType === 'vendor' && 'Ready to Accept Crypto Payments?'}
                {userType === 'delivery_agent' && 'Ready to Earn with Delivery?'}
              </h3>
              <p className="text-muted-foreground">
                {userType === 'customer' && 'Order food, pay with stablecoins, earn CHOP tokens'}
                {userType === 'vendor' && 'Accept payments, cash out to your bank, grow your business'}
                {userType === 'delivery_agent' && 'Deliver orders, get paid instantly, track your earnings'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">100% Secure</p>
                <p className="text-muted-foreground">Protected by blockchain</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium">Instant Payments</p>
                <p className="text-muted-foreground">No waiting for transfers</p>
              </div>
              <div className="text-center">
                <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium">Earn Rewards</p>
                <p className="text-muted-foreground">CHOP tokens for activity</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'crypto-basics',
        title: 'Understanding Cryptocurrency',
        description: 'Don\'t worry - we\'ll explain everything in simple terms',
        content: (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                New to crypto? No problem! Let's cover the basics in simple, everyday language.
              </p>
            </div>

            <div className="space-y-4">
              {cryptoTutorialSteps.map((step, index) => (
                <Card key={index} className="rounded-xl border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <step.icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700">Why ChopChain Uses Crypto</p>
                  <p className="text-blue-600 mt-1">
                    Crypto payments are faster, cheaper, and more secure than traditional payment methods. 
                    Plus, you earn rewards for every transaction!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
        action: 'I Understand Crypto Basics'
      },
      {
        id: 'wallet-setup',
        title: 'Set Up Your Wallet',
        description: 'Choose and set up a cryptocurrency wallet',
        content: (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                A wallet is like your digital bank account. Choose one that works best for you:
              </p>
            </div>

            <div className="space-y-4">
              {walletGuides.map((wallet, index) => (
                <Card key={index} className="rounded-xl border-border hover:shadow-card-hover transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{wallet.name}</h4>
                          <Badge variant={wallet.difficulty === 'Easy' ? 'default' : 'secondary'}>
                            {wallet.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(wallet.downloadLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium mb-2">Setup Steps:</p>
                      <ol className="space-y-1 text-muted-foreground">
                        {wallet.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="inline-block w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mr-2 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-orange-500/10 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-700">Important Security Tips</p>
                  <ul className="text-orange-600 mt-1 space-y-1">
                    <li>• Never share your secret recovery phrase with anyone</li>
                    <li>• Write down your recovery phrase and store it safely</li>
                    <li>• Only download wallets from official sources</li>
                    <li>• Start with small amounts while learning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        action: 'Connect My Wallet'
      }
    ];

    // Add user-type specific steps
    if (userType === 'customer') {
      baseSteps.push({
        id: 'first-order',
        title: 'Ready for Your First Order!',
        description: 'You\'re all set to start ordering with ChopChain',
        content: (
          <div className="text-center space-y-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-600">
                Congratulations! 🎉
              </h3>
              <p className="text-muted-foreground">
                Your wallet is connected and you're ready to start ordering delicious food while earning CHOP tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-primary/5 rounded-xl">
                <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Browse Restaurants</p>
                <p className="text-muted-foreground">Explore local vendors and their menus</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl">
                <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium">Earn CHOP Tokens</p>
                <p className="text-muted-foreground">Get rewards for every order you place</p>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-700">
                  Pro Tip: Your first order earns 2x CHOP tokens!
                </p>
              </div>
            </div>
          </div>
        ),
        action: 'Start Ordering'
      });
    }

    return baseSteps;
  };

  const steps = getStepsForUserType();
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (connected && address) {
      setUserProgress(prev => ({ ...prev, hasWallet: true }));
      if (steps[currentStep]?.id === 'wallet-setup') {
        toast({
          title: 'Wallet Connected!',
          description: 'Great job! Your wallet is now connected to ChopChain.',
        });
      }
    }
  }, [connected, address, currentStep, steps, toast]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, steps[currentStep].id]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = async () => {
    const step = steps[currentStep];
    
    if (step.id === 'crypto-basics') {
      setUserProgress(prev => ({ ...prev, understoodCrypto: true }));
      handleNext();
    } else if (step.id === 'wallet-setup') {
      if (!connected) {
        try {
          await connect();
        } catch (error) {
          toast({
            title: 'Connection Failed',
            description: 'Please try connecting your wallet again.',
            variant: 'destructive'
          });
          return;
        }
      }
      handleNext();
    } else if (step.id === 'first-order') {
      setUserProgress(prev => ({ ...prev, completedTutorial: true }));
      completeOnboarding();
      onComplete?.();
      
      // Navigate to appropriate page based on user type
      if (userType === 'customer') {
        navigate('/browse');
      } else if (userType === 'vendor') {
        navigate('/vendor/register');
      } else if (userType === 'delivery_agent') {
        navigate('/delivery-agent/register');
      }
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    onComplete?.();
    
    // Navigate to appropriate page based on user type
    if (userType === 'customer') {
      navigate('/browse');
    } else if (userType === 'vendor') {
      navigate('/vendor/register');
    } else if (userType === 'delivery_agent') {
      navigate('/delivery-agent/register');
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Getting Started</h1>
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="rounded-2xl border-border mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {currentStepData.content}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-4">
            {currentStepData.canSkip && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            )}

            <Button
              onClick={currentStepData.action ? handleStepAction : handleNext}
              className="bg-gradient-sunset hover:shadow-glow"
              disabled={
                currentStepData.id === 'wallet-setup' && !connected
              }
            >
              {currentStepData.action || 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@chopchain.com" className="text-primary hover:underline">
              support@chopchain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}