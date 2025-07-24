import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface ExchangeRates {
  USDT_NGN: number;
  NGN_USDT: number;
  lastUpdated: number;
}

interface CurrencyConfig {
  displayCurrency: 'NGN' | 'USD';
  paymentCurrency: 'USDT' | 'USDC';
  region: 'NG' | 'US' | 'GLOBAL';
}

export function useCurrency() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USDT_NGN: 1650, // 1 USDT = 1650 NGN (mock rate)
    NGN_USDT: 0.000606, // 1 NGN = 0.000606 USDT
    lastUpdated: Date.now()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Currency configuration based on user location/preference
  const [currencyConfig] = useState<CurrencyConfig>({
    displayCurrency: 'NGN',
    paymentCurrency: 'USDT',
    region: 'NG'
  });

  // Fetch live exchange rates (in production, this would call a real API)
  const fetchExchangeRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - in production, use CoinGecko, Binance, or similar
      // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn');
      // const data = await response.json();
      
      // For now, use mock data with slight randomization to simulate market movement
      const baseRate = 1650;
      const fluctuation = (Math.random() - 0.5) * 20; // ±10 NGN fluctuation
      const currentRate = Math.round(baseRate + fluctuation);

      const newRates: ExchangeRates = {
        USDT_NGN: currentRate,
        NGN_USDT: 1 / currentRate,
        lastUpdated: Date.now()
      };

      setExchangeRates(newRates);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = 'Failed to fetch exchange rates';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Exchange Rate Error',
        description: 'Using cached rates. Prices may not be current.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Convert NGN amount to USDT for payment
  const convertNgnToUsdt = useCallback((ngnAmount: number): number => {
    return ngnAmount * exchangeRates.NGN_USDT;
  }, [exchangeRates.NGN_USDT]);

  // Convert USDT amount to NGN for display
  const convertUsdtToNgn = useCallback((usdtAmount: number): number => {
    return usdtAmount * exchangeRates.USDT_NGN;
  }, [exchangeRates.USDT_NGN]);

  // Format currency for display
  const formatNGN = useCallback((amount: number, showDecimals: boolean = true): string => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
    return formatter.format(amount);
  }, []);

  const formatUSDT = useCallback((amount: number, showDecimals: boolean = true): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 6 : 2
    });
    return `${formatter.format(amount)} USDT`;
  }, []);

  // Get display price (what user sees)
  const getDisplayPrice = useCallback((baseUsdtPrice: number): { 
    display: string; 
    raw: number; 
    currency: string 
  } => {
    if (currencyConfig.displayCurrency === 'NGN') {
      const ngnPrice = convertUsdtToNgn(baseUsdtPrice);
      return {
        display: formatNGN(ngnPrice),
        raw: ngnPrice,
        currency: 'NGN'
      };
    } else {
      return {
        display: formatUSDT(baseUsdtPrice),
        raw: baseUsdtPrice,
        currency: 'USDT'
      };
    }
  }, [currencyConfig.displayCurrency, convertUsdtToNgn, formatNGN, formatUSDT]);

  // Get payment amount (what user actually pays in USDT)
  const getPaymentAmount = useCallback((displayAmount: number, displayCurrency: string): {
    usdt: number;
    formatted: string;
  } => {
    let usdtAmount: number;
    
    if (displayCurrency === 'NGN') {
      usdtAmount = convertNgnToUsdt(displayAmount);
    } else {
      usdtAmount = displayAmount;
    }

    return {
      usdt: usdtAmount,
      formatted: formatUSDT(usdtAmount)
    };
  }, [convertNgnToUsdt, formatUSDT]);

  // Calculate price breakdown for transparency
  const getPriceBreakdown = useCallback((items: Array<{ price: number; quantity: number }>) => {
    const subtotalUsdt = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFeeUsdt = 1.5; // Fixed USDT delivery fee
    const serviceFeeUsdt = subtotalUsdt * 0.025; // 2.5% service fee
    const totalUsdt = subtotalUsdt + deliveryFeeUsdt + serviceFeeUsdt;

    // Display prices
    const subtotalDisplay = getDisplayPrice(subtotalUsdt);
    const deliveryFeeDisplay = getDisplayPrice(deliveryFeeUsdt); 
    const serviceFeeDisplay = getDisplayPrice(serviceFeeUsdt);
    const totalDisplay = getDisplayPrice(totalUsdt);

    // Payment amounts
    const paymentAmount = getPaymentAmount(totalDisplay.raw, totalDisplay.currency);

    return {
      subtotal: {
        display: subtotalDisplay.display,
        usdt: subtotalUsdt
      },
      deliveryFee: {
        display: deliveryFeeDisplay.display,
        usdt: deliveryFeeUsdt
      },
      serviceFee: {
        display: serviceFeeDisplay.display,
        usdt: serviceFeeUsdt
      },
      total: {
        display: totalDisplay.display,
        usdt: totalUsdt
      },
      payment: paymentAmount,
      exchangeRate: exchangeRates.USDT_NGN
    };
  }, [getDisplayPrice, getPaymentAmount, exchangeRates.USDT_NGN]);

  // Check if rates are stale (older than 5 minutes)
  const areRatesStale = useCallback((): boolean => {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - exchangeRates.lastUpdated > fiveMinutes;
  }, [exchangeRates.lastUpdated]);

  // Auto-refresh rates
  useEffect(() => {
    // Fetch rates on mount
    fetchExchangeRates();

    // Set up auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchExchangeRates]);

  const clearError = useCallback(() => setError(null), []);

  return {
    // Exchange rates
    exchangeRates,
    isLoading,
    error,
    areRatesStale: areRatesStale(),
    
    // Configuration
    currencyConfig,
    
    // Conversion functions
    convertNgnToUsdt,
    convertUsdtToNgn,
    
    // Formatting functions
    formatNGN,
    formatUSDT,
    getDisplayPrice,
    getPaymentAmount,
    getPriceBreakdown,
    
    // Utility functions
    fetchExchangeRates,
    clearError
  };
}