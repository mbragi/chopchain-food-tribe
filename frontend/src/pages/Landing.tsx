import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Coins,
  Users,
  TrendingUp,
  Smartphone,
  CheckCircle,
  Play,
  Star,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useUserOnboarding } from '@/hooks/useUserOnboarding';
import chopchainLogo from '@/assets/chopchain-logo.png';

export default function Landing() {
  const navigate = useNavigate();
  const { connected, connect } = useWallet();
  const { markLandingSeen, skipOnboarding } = useUserOnboarding();
  const [activeDemo, setActiveDemo] = useState('customer');

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Your funds are protected in smart contracts until delivery is confirmed',
      color: 'text-green-500'
    },
    {
      icon: Coins,
      title: 'Earn CHOP Tokens',
      description: 'Get rewarded with cryptocurrency for every order and activity',
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      title: 'Local Currency',
      description: 'See prices in Naira, pay with stablecoins, vendors cash out locally',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Lightning-fast blockchain transactions with low fees',
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '12,000+', icon: Users },
    { label: 'Orders Delivered', value: '45,000+', icon: CheckCircle },
    { label: 'CHOP Tokens Earned', value: '₦2.3M+', icon: Coins },
    { label: 'Partner Vendors', value: '800+', icon: TrendingUp }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Browse & Order',
      description: 'Browse local restaurants and place orders with prices shown in Naira',
      icon: Smartphone,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Pay with Crypto',
      description: 'Pay securely with USDT stablecoins - funds held in escrow until delivery',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      step: 3,
      title: 'Track Delivery',
      description: 'Real-time tracking with delivery agents and proof-of-delivery system',
      icon: MapPin,
      color: 'bg-orange-500'
    },
    {
      step: 4,
      title: 'Earn Rewards',
      description: 'Confirm delivery to release payment and earn CHOP tokens as rewards',
      icon: Coins,
      color: 'bg-yellow-500'
    }
  ];

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      role: 'Food Lover',
      location: 'Lagos',
      avatar: 'AJ',
      content: 'ChopChain revolutionized how I order food. The crypto rewards are amazing and I feel secure knowing my money is in escrow until delivery.',
      rating: 5
    },
    {
      name: 'Sarah Okafor',
      role: 'Restaurant Owner',
      location: 'Abuja',
      avatar: 'SO',
      content: 'As a vendor, I love the instant payments and the ability to cash out to my local bank account. ChopChain has increased my customer base significantly.',
      rating: 5
    },
    {
      name: 'Michael Eze',
      role: 'Delivery Agent',
      location: 'Port Harcourt',
      avatar: 'ME',
      content: 'The delivery tracking system is top-notch and the payment system is transparent. I earn more and serve customers better with ChopChain.',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    markLandingSeen();
  };

  const handleVendorSignup = () => {
    navigate('/vendor/register');
  };

  const handleDeliveryAgentSignup = () => {
    navigate('/delivery-agent/register');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={chopchainLogo} alt="ChopChain" className="w-8 h-8" />
              <span className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                ChopChain
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-sunset hover:shadow-glow"
              >
                {connected ? 'Open App' : 'Connect Wallet'}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            🚀 Africa's First Web3 Food Delivery Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-sunset bg-clip-text text-transparent">
            The Future of Food Delivery is Here
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Order food, pay with crypto, earn tokens. Experience secure, fast, and rewarding 
            food delivery powered by blockchain technology and designed for Africa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-sunset hover:shadow-glow text-lg px-8 py-6"
            >
              {connected ? 'Start Ordering' : 'Connect Wallet'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={handleVendorSignup}
              variant="outline" 
              size="lg"
              className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6"
            >
              Join as Vendor
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ChopChain?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for the African market with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="rounded-2xl border-border bg-background hover:shadow-card-hover transition-all">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-2xl bg-primary/10">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How ChopChain Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start earning with Web3 food delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform translate-x-2 z-0" />
                )}
                
                <div className="relative z-10">
                  <div className={`mx-auto mb-6 w-16 h-16 rounded-full ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-2 text-sm font-medium text-primary">
                    Step {step.step}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Button */}
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="border-primary/20 hover:bg-primary/5"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real experiences from customers, vendors, and delivery agents across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="rounded-2xl border-border bg-background">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-sunset flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Revolution?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're hungry for great food, looking to grow your restaurant business, 
            or want to earn as a delivery agent, ChopChain has something for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="rounded-2xl border-border bg-background hover:shadow-card-hover transition-all cursor-pointer" onClick={handleGetStarted}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">I'm Hungry</h3>
                <p className="text-muted-foreground text-sm">Order delicious food and earn CHOP tokens</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-background hover:shadow-card-hover transition-all cursor-pointer" onClick={handleVendorSignup}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">I Sell Food</h3>
                <p className="text-muted-foreground text-sm">Grow your restaurant with Web3 payments</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-background hover:shadow-card-hover transition-all cursor-pointer" onClick={handleDeliveryAgentSignup}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">I Deliver</h3>
                <p className="text-muted-foreground text-sm">Earn more with transparent delivery system</p>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-gradient-sunset hover:shadow-glow text-lg px-12 py-6"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={chopchainLogo} alt="ChopChain" className="w-8 h-8" />
                <span className="text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                  ChopChain
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Africa's first Web3 food delivery platform. Secure, fast, and rewarding.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Order Food</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Become Vendor</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Deliver</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Earn CHOP</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ChopChain. All rights reserved. Built for Africa with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}