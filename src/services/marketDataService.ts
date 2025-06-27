import axios from 'axios';

// Multiple data sources for redundancy
const DATA_SOURCES = {
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  FINNHUB: 'https://finnhub.io/api/v1',
  YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart',
  TWELVE_DATA: 'https://api.twelvedata.com'
};

// Indian stock symbols mapping
const INDIAN_SYMBOLS = {
  'NIFTY': '^NSEI',
  'BANKNIFTY': '^NSEBANK',
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'HDFC': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'INFY': 'INFY.NS',
  'ITC': 'ITC.NS',
  'SBIN': 'SBIN.NS',
  'LT': 'LT.NS'
};

export interface LiveMarketData {
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
  marketCap?: number;
  pe?: number;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalData {
  rsi: number[];
  macd: { macd: number[]; signal: number[]; histogram: number[] };
  sma20: number[];
  sma50: number[];
  ema20: number[];
  ema50: number[];
  bollingerBands: { upper: number[]; middle: number[]; lower: number[] };
  volume: number[];
}

class MarketDataService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private dataCache: Map<string, LiveMarketData> = new Map();
  private chartCache: Map<string, ChartData[]> = new Map();
  
  // Fallback to Yahoo Finance for real data
  async fetchLiveData(symbol: string): Promise<LiveMarketData | null> {
    try {
      const yahooSymbol = INDIAN_SYMBOLS[symbol as keyof typeof INDIAN_SYMBOLS] || symbol;
      const response = await axios.get(
        `${DATA_SOURCES.YAHOO_FINANCE}/${yahooSymbol}?interval=1m&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: quote.open[0] || currentPrice,
        previousClose,
        timestamp: Date.now(),
        marketCap: meta.marketCap,
        pe: meta.trailingPE
      };
    } catch (error) {
      console.warn(`Failed to fetch live data for ${symbol}:`, error);
      return this.generateFallbackData(symbol);
    }
  }

  async fetchChartData(symbol: string, interval: string = '5m', range: string = '1d'): Promise<ChartData[]> {
    try {
      const yahooSymbol = INDIAN_SYMBOLS[symbol as keyof typeof INDIAN_SYMBOLS] || symbol;
      const response = await axios.get(
        `${DATA_SOURCES.YAHOO_FINANCE}/${yahooSymbol}?interval=${interval}&range=${range}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      return timestamps.map((time: number, index: number) => ({
        time: time * 1000, // Convert to milliseconds
        open: quote.open[index] || 0,
        high: quote.high[index] || 0,
        low: quote.low[index] || 0,
        close: quote.close[index] || 0,
        volume: quote.volume[index] || 0
      })).filter((data: ChartData) => data.close > 0);
    } catch (error) {
      console.warn(`Failed to fetch chart data for ${symbol}:`, error);
      return this.generateFallbackChartData(symbol);
    }
  }

  // WebSocket connection for real-time updates (fallback simulation)
  connectWebSocket(symbol: string, onData: (data: LiveMarketData) => void): void {
    // Since we can't establish real WebSocket connections to exchanges directly,
    // we'll simulate real-time updates with periodic API calls
    const intervalId = setInterval(async () => {
      const data = await this.fetchLiveData(symbol);
      if (data) {
        this.dataCache.set(symbol, data);
        onData(data);
      }
    }, 2000); // Update every 2 seconds

    // Store the interval ID for cleanup
    this.wsConnections.set(symbol, { close: () => clearInterval(intervalId) } as any);
  }

  disconnectWebSocket(symbol: string): void {
    const connection = this.wsConnections.get(symbol);
    if (connection) {
      connection.close();
      this.wsConnections.delete(symbol);
    }
  }

  // Calculate technical indicators
  calculateTechnicalIndicators(chartData: ChartData[]): TechnicalData {
    const closes = chartData.map(d => d.close);
    const volumes = chartData.map(d => d.volume);
    
    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema20: this.calculateEMA(closes, 20),
      ema50: this.calculateEMA(closes, 50),
      bollingerBands: this.calculateBollingerBands(closes, 20),
      volume: volumes
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  private calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12.map((val, i) => val - ema26[i]);
    const signal = this.calculateEMA(macd, 9);
    const histogram = macd.map((val, i) => val - signal[i]);

    return { macd, signal, histogram };
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateBollingerBands(prices: number[], period: number): { upper: number[]; middle: number[]; lower: number[] } {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(mean + (stdDev * 2));
      lower.push(mean - (stdDev * 2));
    }

    return { upper, middle: sma, lower };
  }

  // Fallback data generation for when APIs fail
  private generateFallbackData(symbol: string): LiveMarketData {
    const basePrices: { [key: string]: number } = {
      'NIFTY': 19500,
      'BANKNIFTY': 43000,
      'RELIANCE': 2450,
      'TCS': 3650,
      'HDFC': 1580,
      'ICICIBANK': 950,
      'INFY': 1420,
      'ITC': 420
    };

    const basePrice = basePrices[symbol] || 1000;
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
  }

  private generateFallbackChartData(symbol: string): ChartData[] {
    const data: ChartData[] = [];
    const basePrice = 1000;
    let currentPrice = basePrice;
    const now = Date.now();

    for (let i = 100; i >= 0; i--) {
      const change = (Math.random() - 0.5) * currentPrice * 0.01;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);

      data.push({
        time: now - (i * 5 * 60 * 1000), // 5-minute intervals
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 100000) + 10000
      });

      currentPrice = close;
    }

    return data;
  }
}

export const marketDataService = new MarketDataService();