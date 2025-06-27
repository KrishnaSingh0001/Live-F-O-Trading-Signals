import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { MarketData, TradingSignal } from '../types/market';

interface MarketOverviewProps {
  marketData: Map<string, MarketData>;
  signals: Map<string, TradingSignal>;
  isConnected: boolean;
  symbols: string[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ 
  marketData, 
  signals, 
  isConnected, 
  symbols 
}) => {
  const getSignalCounts = () => {
    const counts = { BUY: 0, SELL: 0, HOLD: 0 };
    signals.forEach(signal => {
      counts[signal.signal]++;
    });
    return counts;
  };

  const signalCounts = getSignalCounts();
  const totalSymbols = symbols.length;
  const averageChange = symbols.reduce((acc, symbol) => {
    const data = marketData.get(symbol);
    return acc + (data?.changePercent || 0);
  }, 0) / totalSymbols;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Connection Status */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Market Status</p>
            <p className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Disconnected'}
            </p>
          </div>
          {isConnected ? (
            <Wifi className="w-6 h-6 text-green-400" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-400" />
          )}
        </div>
      </div>

      {/* Average Market Change */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Market Avg</p>
            <p className={`font-semibold text-lg ${
              averageChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
            </p>
          </div>
          <Clock className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Buy Signals */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Buy Signals</p>
            <p className="text-green-400 font-semibold text-lg">
              {signalCounts.BUY}/{totalSymbols}
            </p>
          </div>
          <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
            <span className="text-green-400 font-bold text-sm">{signalCounts.BUY}</span>
          </div>
        </div>
      </div>

      {/* Sell Signals */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Sell Signals</p>
            <p className="text-red-400 font-semibold text-lg">
              {signalCounts.SELL}/{totalSymbols}
            </p>
          </div>
          <div className="w-8 h-8 bg-red-400/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm">{signalCounts.SELL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};