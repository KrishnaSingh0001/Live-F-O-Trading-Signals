import { useState, useEffect, useCallback } from 'react';
import { marketDataService, LiveMarketData, ChartData, TechnicalData } from '../services/marketDataService';
import { TradingSignal } from '../types/market';

const SYMBOLS = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFC', 'ICICIBANK', 'INFY', 'ITC'];

export const useLiveMarketData = () => {
  const [marketData, setMarketData] = useState<Map<string, LiveMarketData>>(new Map());
  const [chartData, setChartData] = useState<Map<string, ChartData[]>>(new Map());
  const [technicalData, setTechnicalData] = useState<Map<string, TechnicalData>>(new Map());
  const [signals, setSignals] = useState<Map<string, TradingSignal>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateTradingSignal = useCallback((data: LiveMarketData, technical: TechnicalData): TradingSignal => {
    const rsi = technical.rsi[technical.rsi.length - 1] || 50;
    const macd = technical.macd.histogram[technical.macd.histogram.length - 1] || 0;
    const price = data.price;
    const sma20 = technical.sma20[technical.sma20.length - 1] || price;
    const sma50 = technical.sma50[technical.sma50.length - 1] || price;
    
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reason = '';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    // RSI-based signals
    if (rsi < 30) {
      signal = 'BUY';
      confidence += 35;
      reason += 'RSI oversold (bullish). ';
      riskLevel = 'LOW';
    } else if (rsi > 70) {
      signal = 'SELL';
      confidence += 35;
      reason += 'RSI overbought (bearish). ';
      riskLevel = 'HIGH';
    }
    
    // MACD signals
    if (macd > 0) {
      if (signal !== 'SELL') {
        signal = 'BUY';
        confidence += 25;
        reason += 'MACD bullish crossover. ';
      }
    } else if (macd < 0) {
      if (signal !== 'BUY') {
        signal = 'SELL';
        confidence += 25;
        reason += 'MACD bearish crossover. ';
      }
    }
    
    // Moving average signals
    if (price > sma20 && sma20 > sma50) {
      if (signal !== 'SELL') {
        signal = 'BUY';
        confidence += 20;
        reason += 'Price above moving averages. ';
      }
    } else if (price < sma20 && sma20 < sma50) {
      if (signal !== 'BUY') {
        signal = 'SELL';
        confidence += 20;
        reason += 'Price below moving averages. ';
      }
    }

    // Volume confirmation
    if (data.volume > (data.volume * 1.2)) {
      confidence += 10;
      reason += 'High volume confirmation. ';
    }
    
    // Ensure confidence is within 0-100
    confidence = Math.min(Math.max(confidence, 0), 100);
    
    // Calculate target and stop loss based on volatility
    const volatility = Math.abs(data.changePercent) / 100;
    const targetMultiplier = Math.max(0.02, volatility * 1.5);
    const stopLossMultiplier = Math.max(0.015, volatility);
    
    const targetPrice = signal === 'BUY' ? price * (1 + targetMultiplier) : price * (1 - targetMultiplier);
    const stopLoss = signal === 'BUY' ? price * (1 - stopLossMultiplier) : price * (1 + stopLossMultiplier);
    
    return {
      signal,
      confidence,
      reason: reason.trim() || 'Technical analysis based on multiple indicators.',
      riskLevel,
      targetPrice,
      stopLoss
    };
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const newMarketData = new Map<string, LiveMarketData>();
    const newChartData = new Map<string, ChartData[]>();
    const newTechnicalData = new Map<string, TechnicalData>();
    const newSignals = new Map<string, TradingSignal>();

    for (const symbol of SYMBOLS) {
      try {
        // Fetch live market data
        const liveData = await marketDataService.fetchLiveData(symbol);
        if (liveData) {
          newMarketData.set(symbol, liveData);
        }

        // Fetch chart data
        const chartDataArray = await marketDataService.fetchChartData(symbol, '5m', '1d');
        if (chartDataArray.length > 0) {
          newChartData.set(symbol, chartDataArray);
          
          // Calculate technical indicators
          const technical = marketDataService.calculateTechnicalIndicators(chartDataArray);
          newTechnicalData.set(symbol, technical);
          
          // Generate trading signal
          if (liveData) {
            const signal = generateTradingSignal(liveData, technical);
            newSignals.set(symbol, signal);
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    setMarketData(newMarketData);
    setChartData(newChartData);
    setTechnicalData(newTechnicalData);
    setSignals(newSignals);
    setIsConnected(true);
    setLoading(false);
  }, [generateTradingSignal]);

  const setupWebSocketConnections = useCallback(() => {
    SYMBOLS.forEach(symbol => {
      marketDataService.connectWebSocket(symbol, (data: LiveMarketData) => {
        setMarketData(prev => new Map(prev.set(symbol, data)));
        
        // Update signals when new data arrives
        const technical = technicalData.get(symbol);
        if (technical) {
          const signal = generateTradingSignal(data, technical);
          setSignals(prev => new Map(prev.set(symbol, signal)));
        }
      });
    });
  }, [technicalData, generateTradingSignal]);

  useEffect(() => {
    fetchInitialData();
    
    return () => {
      // Cleanup WebSocket connections
      SYMBOLS.forEach(symbol => {
        marketDataService.disconnectWebSocket(symbol);
      });
    };
  }, [fetchInitialData]);

  useEffect(() => {
    if (!loading && isConnected) {
      setupWebSocketConnections();
    }
  }, [loading, isConnected, setupWebSocketConnections]);

  const refreshData = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    marketData,
    chartData,
    technicalData,
    signals,
    isConnected,
    loading,
    symbols: SYMBOLS,
    refreshData
  };
};