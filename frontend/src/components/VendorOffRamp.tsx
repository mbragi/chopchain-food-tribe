import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  Banknote, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Building,
  Smartphone
} from 'lucide-react';
import { useOneRamp } from '@/hooks/useOneRamp';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

interface BankDetails {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

interface MobileWalletDetails {
  phoneNumber: string;
  provider: 'mtn' | 'airtel' | 'glo' | '9mobile';
}

export default function VendorOffRamp() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile_wallet'>('bank');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    bankName: '',
    accountName: ''
  });
  const [mobileWalletDetails, setMobileWalletDetails] = useState<MobileWalletDetails>({
    phoneNumber: '',
    provider: 'mtn'
  });
  const [calculation, setCalculation] = useState<any>(null);

  const { 
    isLoading, 
    error, 
    transactions, 
    initiateOffRamp, 
    calculateOffRamp, 
    getPaymentMethods, 
    isAvailable,
    clearError 
  } = useOneRamp();

  const { connected } = useWallet();
  const { toast } = useToast();

  // Mock vendor balance - in production, this would come from smart contract
  const vendorBalance = 125.50; // USDT

  const paymentMethods = getPaymentMethods(currency);

  // Calculate off-ramp details when amount or currency changes
  useEffect(() => {
    const calculateDetails = async () => {
      if (amount && parseFloat(amount) > 0) {
        const calc = await calculateOffRamp(parseFloat(amount), currency);
        setCalculation(calc);
      } else {
        setCalculation(null);
      }
    };

    calculateDetails();
  }, [amount, currency, calculateOffRamp]);

  const handleOffRamp = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to continue',
        variant: 'destructive'
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    if (amountNum > vendorBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Amount exceeds your available balance',
        variant: 'destructive'
      });
      return;
    }

    const request = {
      amount: amountNum,
      currency: currency as 'NGN' | 'USD',
      ...(paymentMethod === 'bank' ? { bankAccount: bankDetails } : { mobileWallet: mobileWalletDetails })
    };

    await initiateOffRamp(request);
    
    // Reset form on success
    setAmount('');
    setCalculation(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'processing':
        return 'bg-blue-500/10 text-blue-700';
      case 'completed':
        return 'bg-green-500/10 text-green-700';
      case 'failed':
        return 'bg-red-500/10 text-red-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  if (!isAvailable(currency)) {
    return (
      <Card className="rounded-2xl border-border">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Off-ramp Not Available</h3>
          <p className="text-muted-foreground">
            OneRamp off-ramp is not available in your region yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">
            {vendorBalance.toFixed(2)} USDT
          </div>
          <p className="text-sm text-muted-foreground">
            ≈ ₦{(vendorBalance * 1650).toLocaleString()} at current rate
          </p>
        </CardContent>
      </Card>

      {/* Off-ramp Form */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle>Convert to Local Currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={vendorBalance}
                step="0.01"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Max: {vendorBalance.toFixed(2)} USDT
              </p>
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <Label htmlFor="currency">Receive Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Card
                  key={method.type}
                  className={`cursor-pointer border-2 transition-colors ${
                    paymentMethod === method.type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPaymentMethod(method.type as 'bank' | 'mobile_wallet')}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    {method.type === 'bank' ? (
                      <Building className="w-5 h-5 text-primary" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.type === 'bank' ? 'Bank transfer' : 'Mobile money'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'bank' && (
            <div className="space-y-4">
              <Label>Bank Account Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select 
                    value={bankDetails.bankName} 
                    onValueChange={(value) => setBankDetails(prev => ({ ...prev, bankName: value }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTBank">GTBank</SelectItem>
                      <SelectItem value="Access Bank">Access Bank</SelectItem>
                      <SelectItem value="First Bank">First Bank</SelectItem>
                      <SelectItem value="UBA">UBA</SelectItem>
                      <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'mobile_wallet' && (
            <div className="space-y-4">
              <Label>Mobile Wallet Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select 
                    value={mobileWalletDetails.provider} 
                    onValueChange={(value) => setMobileWalletDetails(prev => ({ ...prev, provider: value as any }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                      <SelectItem value="glo">Glo Mobile Money</SelectItem>
                      <SelectItem value="9mobile">9mobile Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+2348012345678"
                    value={mobileWalletDetails.phoneNumber}
                    onChange={(e) => setMobileWalletDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Calculation Summary */}
          {calculation && (
            <Card className="bg-muted/30 rounded-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You send</span>
                  <span className="font-medium">{calculation.amount} USDT</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span className="font-medium">1 USDT = {calculation.exchangeRate.toLocaleString()} {calculation.currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gross amount</span>
                  <span className="font-medium">{calculation.grossAmount.toLocaleString()} {calculation.currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">OneRamp fee (1.5%)</span>
                  <span className="font-medium">-{calculation.feesInLocal.toLocaleString()} {calculation.currency}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>You receive</span>
                  <span className="text-primary">{calculation.netAmount.toLocaleString()} {calculation.currency}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto h-6 px-2"
              >
                ×
              </Button>
            </div>
          )}

          <Button
            onClick={handleOffRamp}
            disabled={!amount || !calculation || isLoading || !connected}
            className="w-full h-12 bg-gradient-sunset hover:shadow-glow text-lg font-semibold rounded-xl"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Convert to {calculation?.currency || currency}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle>Recent Off-ramp Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-medium">
                        {transaction.amount} USDT → {transaction.localAmount.toLocaleString()} {transaction.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}