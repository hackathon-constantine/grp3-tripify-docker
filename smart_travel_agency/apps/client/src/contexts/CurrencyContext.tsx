"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'points' | 'USD' | 'EUR' | 'DZD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertCredits: (credits: number) => string;
  getCurrencySymbol: () => string;
  getCurrencyLabel: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates - you can update these with real API data
const EXCHANGE_RATES = {
  USD: 0.0074, // 1 point = 0.0074 USD
  EUR: 0.0069, // 1 point = 0.0069 EUR
  DZD: 1,      // 1 point = 1 DZD
  points: 1    // 1 point = 1 point
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  DZD: 'DZD',
  points: 'pts'
};

const CURRENCY_LABELS = {
  USD: 'US Dollar',
  EUR: 'Euro',
  DZD: 'Algerian Dinar',
  points: 'Points'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('points');

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency') as Currency;
    if (savedCurrency && Object.keys(EXCHANGE_RATES).includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const convertCredits = (credits: number): string => {
    const convertedAmount = credits * EXCHANGE_RATES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];
    
    if (currency === 'points') {
      return `${convertedAmount.toLocaleString()} ${symbol}`;
    }
    
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  const getCurrencySymbol = () => CURRENCY_SYMBOLS[currency];
  
  const getCurrencyLabel = () => CURRENCY_LABELS[currency];

  return (
    <CurrencyContext.Provider 
      value={{
        currency,
        setCurrency: handleSetCurrency,
        convertCredits,
        getCurrencySymbol,
        getCurrencyLabel
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export { CURRENCY_LABELS, CURRENCY_SYMBOLS };
