export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  supportResistance: {
    support: number[];
    resistance: number[];
  };
}

export interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice?: number;
  stopLoss?: number;
}

export interface WatchlistItem {
  symbol: string;
  alertPrice?: number;
  alertType?: 'ABOVE' | 'BELOW';
  notes?: string;
}