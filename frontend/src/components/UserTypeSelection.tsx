import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserOnboarding, UserType } from '@/hooks/useUserOnboarding';
import chopchainLogo from '@/assets/chopchain-logo.png';

interface UserTypeOption {
  type: UserType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  benefits: string[];
  color: string;
  bgGradient: string;
  popular?: boolean;
}

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const { setUserType } = useUserOnboarding();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const userTypes: UserTypeOption[] = [
    {
      type: 'customer',
      title: 'I Want to Order Food',
      subtitle: 'Customer',
      description: 'Browse restaurants, order food, and earn CHOP tokens with every purchase.',
      icon: ShoppingBag,
      features: [
        'Browse local restaurants',
        'Secure crypto payments',
        'Real-time order tracking',
        'Earn CHOP rewards'
      ],
      benefits: [
        'See prices in Naira, pay with crypto',
        'Funds held in escrow until delivery',
        'Get rewarded for every order',
        'Build loyalty levels for better rewards'
      ],
      color: 'text-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      popular: true
    },
    {
      type: 'vendor',
      title: 'I Want to Sell Food',
      subtitle: 'Restaurant/Vendor',
      description: 'List your restaurant, manage orders, and grow your business with blockchain technology.',
      icon: Store,
      features: [
        'List your restaurant',
        'Manage orders & inventory', 
        'Instant crypto payments',
        'Cash out to local currency'
      ],
      benefits: [
        'Reach crypto-savvy customers',
        'No payment delays or chargebacks',
        'Advanced analytics dashboard',
        'Convert earnings to NGN easily'
      ],
      color: 'text-green-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      type: 'delivery_agent',
      title: 'I Want to Deliver Food',
      subtitle: 'Delivery Agent',
      description: 'Join our delivery network, earn crypto, and build your reputation on-chain.',
      icon: Truck,
      features: [
        'Accept delivery requests',
        'Earn crypto per delivery',
        'Build on-chain reputation',
        'Flexible working hours'
      ],
      benefits: [
        'Transparent earnings system',
        'Get paid instantly after delivery',
        'Build verifiable work history',
        'Access to high-paying areas'
      ],
      color: 'text-orange-600',
      bgGradient: 'from-orange-50 to-amber-50'
    }
  ];

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    setUserType(selectedType);
    
    // Navigate based on user type
    switch (selectedType) {
      case 'customer':
        navigate('/onboarding/customer');
        break;
      case 'vendor':
        navigate('/onboarding/vendor');
        break;
      case 'delivery_agent':
        navigate('/onboarding/delivery-agent');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={chopchainLogo} alt="ChopChain" className="w-8 h-8" />
              <span className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                ChopChain
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/browse')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Join 12,000+ ChopChain Users
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent">
            How do you want to use ChopChain?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to get personalized onboarding and start earning with Africa's first Web3 food delivery platform.
          </p>
        </div>

        {/* User Type Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {userTypes.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            
            return (
              <Card
                key={option.type}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-card-hover ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'hover:scale-102'
                } ${
                  option.popular ? 'border-primary/30' : ''
                }`}
                onClick={() => handleTypeSelect(option.type)}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-sunset text-white shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center pb-4 bg-gradient-to-br ${option.bgGradient} rounded-t-lg`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center ${option.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <CardTitle className="text-xl mb-2">
                    {option.title}
                  </CardTitle>
                  
                  <Badge variant="secondary" className="mx-auto">
                    {option.subtitle}
                  </Badge>
                </CardHeader>

                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6 text-center">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-primary" />
                      What you can do:
                    </h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-secondary" />
                      Key benefits:
                    </h4>
                    <ul className="space-y-2">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                      <p className="text-primary font-medium text-sm">
                        Selected! Click Continue to proceed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="bg-gradient-sunset hover:shadow-glow text-lg px-12 py-6"
          >
            Continue as {selectedType && userTypes.find(t => t.type === selectedType)?.subtitle}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            Don't worry, you can always change this later in your profile settings.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Local Focus</h3>
            <p className="text-sm text-muted-foreground">
              Built specifically for the African market with local payment solutions
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Crypto Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Earn CHOP tokens with every interaction and build your Web3 portfolio
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Quick Setup</h3>
            <p className="text-sm text-muted-foreground">
              Get started in minutes with our guided onboarding process
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}