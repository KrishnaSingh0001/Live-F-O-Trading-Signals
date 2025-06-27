import { useState, useEffect, useCallback } from 'react';
import { MarketData, TechnicalIndicators, TradingSignal } from '../types/market';

const SYMBOLS = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFC', 'ICICIBANK', 'INFY', 'ITC'];

// Simulated market data generator
const generateMarketData = (symbol: string, basePrice: number): MarketData => {
  const change = (Math.random() - 0.5) * basePrice * 0.02;
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 1000000) + 100000,
    high: price * (1 + Math.random() * 0.01),
    low: price * (1 - Math.random() * 0.01),
    open: price * (1 + (Math.random() - 0.5) * 0.005),
    previousClose: basePrice,
    timestamp: Date.now()
  };
};

// Technical indicators calculation
const calculateIndicators = (data: MarketData): TechnicalIndicators => {
  const price = data.price;
  
  // Simulated RSI (0-100)
  const rsi = Math.random() * 100;
  
  // Simulated MACD
  const macd = (Math.random() - 0.5) * 20;
  const signal = (Math.random() - 0.5) * 15;
  
  // Moving averages
  const sma20 = price * (1 + (Math.random() - 0.5) * 0.02);
  const sma50 = price * (1 + (Math.random() - 0.5) * 0.05);
  const ema20 = price * (1 + (Math.random() - 0.5) * 0.015);
  const ema50 = price * (1 + (Math.random() - 0.5) * 0.04);
  
  // Bollinger Bands
  const middle = sma20;
  const upper = middle * 1.02;
  const lower = middle * 0.98;
  
  // Support and Resistance
  const support = [price * 0.95, price * 0.92, price * 0.88];
  const resistance = [price * 1.05, price * 1.08, price * 1.12];
  
  return {
    rsi,
    macd: { macd, signal, histogram: macd - signal },
    movingAverages: { sma20, sma50, ema20, ema50 },
    bollingerBands: { upper, middle, lower },
    supportResistance: { support, resistance }
  };
};

// Generate trading signals
const generateTradingSignal = (data: MarketData, indicators: TechnicalIndicators): TradingSignal => {
  const { rsi, macd, movingAverages } = indicators;
  const price = data.price;
  
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = 0;
  let reason = '';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  
  // RSI-based signals
  if (rsi < 30) {
    signal = 'BUY';
    confidence += 30;
    reason += 'RSI oversold. ';
    riskLevel = 'LOW';
  } else if (rsi > 70) {
    signal = 'SELL';
    confidence += 30;
    reason += 'RSI overbought. ';
    riskLevel = 'HIGH';
  }
  
  // MACD signals
  if (macd.macd > macd.signal && macd.histogram > 0) {
    if (signal !== 'SELL') {
      signal = 'BUY';
      confidence += 25;
      reason += 'MACD bullish. ';
    }
  } else if (macd.macd < macd.signal && macd.histogram < 0) {
    if (signal !== 'BUY') {
      signal = 'SELL';
      confidence += 25;
      reason += 'MACD bearish. ';
    }
  }
  
  // Moving average signals
  if (price > movingAverages.ema20 && movingAverages.ema20 > movingAverages.ema50) {
    if (signal !== 'SELL') {
      signal = 'BUY';
      confidence += 20;
      reason += 'Price above EMA. ';
    }
  } else if (price < movingAverages.ema20 && movingAverages.ema20 < movingAverages.ema50) {
    if (signal !== 'BUY') {
      signal = 'SELL';
      confidence += 20;
      reason += 'Price below EMA. ';
    }
  }
  
  // Ensure confidence is within 0-100
  confidence = Math.min(Math.max(confidence, 0), 100);
  
  // Calculate target and stop loss
  const targetPrice = signal === 'BUY' ? price * 1.03 : price * 0.97;
  const stopLoss = signal === 'BUY' ? price * 0.98 : price * 1.02;
  
  return {
    signal,
    confidence,
    reason: reason.trim(),
    riskLevel,
    targetPrice,
    stopLoss
  };
};

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map());
  const [indicators, setIndicators] = useState<Map<string, TechnicalIndicators>>(new Map());
  const [signals, setSignals] = useState<Map<string, TradingSignal>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const basePrices = {
    NIFTY: 19500,
    BANKNIFTY: 43000,
    RELIANCE: 2450,
    TCS: 3650,
    HDFC: 1580,
    ICICIBANK: 950,
    INFY: 1420,
    ITC: 420
  };

  const updateData = useCallback(() => {
    const newMarketData = new Map<string, MarketData>();
    const newIndicators = new Map<string, TechnicalIndicators>();
    const newSignals = new Map<string, TradingSignal>();

    SYMBOLS.forEach(symbol => {
      const data = generateMarketData(symbol, basePrices[symbol as keyof typeof basePrices]);
      const indicatorData = calculateIndicators(data);
      const signalData = generateTradingSignal(data, indicatorData);

      newMarketData.set(symbol, data);
      newIndicators.set(symbol, indicatorData);
      newSignals.set(symbol, signalData);
    });

    setMarketData(newMarketData);
    setIndicators(newIndicators);
    setSignals(newSignals);
  }, []);

  useEffect(() => {
    setIsConnected(true);
    updateData();

    const interval = setInterval(updateData, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [updateData]);

  return {
    marketData,
    indicators,
    signals,
    isConnected,
    symbols: SYMBOLS
  };
};