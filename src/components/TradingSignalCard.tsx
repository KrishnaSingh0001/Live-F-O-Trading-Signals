import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Shield } from 'lucide-react';
import { MarketData, TradingSignal } from '../types/market';

interface TradingSignalCardProps {
  symbol: string;
  marketData: MarketData;
  signal: TradingSignal;
}

export const TradingSignalCard: React.FC<TradingSignalCardProps> = ({ 
  symbol, 
  marketData, 
  signal 
}) => {
  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const isPositive = marketData.change >= 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{symbol}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">₹{marketData.price.toLocaleString()}</span>
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getSignalColor(signal.signal)}`}>
          {getSignalIcon(signal.signal)}
          <span className="font-bold text-sm">{signal.signal}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  signal.confidence >= 70 ? 'bg-green-400' :
                  signal.confidence >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">{signal.confidence}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Risk Level</span>
          <span className={`text-sm font-medium ${getRiskColor(signal.riskLevel)}`}>
            {signal.riskLevel}
          </span>
        </div>
      </div>

      {signal.targetPrice && signal.stopLoss && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Target className="w-3 h-3 text-green-400" />
              <span className="text-gray-400 text-xs">Target</span>
            </div>
            <span className="text-green-400 font-medium text-sm">₹{signal.targetPrice.toFixed(2)}</span>
          </div>
          <div className="bg-gray-900 rounded p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Shield className="w-3 h-3 text-red-400" />
              <span className="text-gray-400 text-xs">Stop Loss</span>
            </div>
            <span className="text-red-400 font-medium text-sm">₹{signal.stopLoss.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="text-gray-400 text-xs bg-gray-900 rounded p-2">
        <span className="font-medium">Analysis:</span> {signal.reason}
      </div>
    </div>
  );
};