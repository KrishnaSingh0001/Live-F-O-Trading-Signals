import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketData } from '../types/market';

interface MarketTickerProps {
  data: Map<string, MarketData>;
  symbols: string[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ data, symbols }) => {
  return (
    <div className="bg-gray-900 border-b border-gray-700 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap py-2">
        {symbols.map(symbol => {
          const marketData = data.get(symbol);
          if (!marketData) return null;

          const isPositive = marketData.change >= 0;
          const isNeutral = marketData.change === 0;

          return (
            <div key={symbol} className="flex items-center space-x-2 px-6 text-sm">
              <span className="text-gray-300 font-medium">{symbol}</span>
              <span className="text-white font-bold">₹{marketData.price.toLocaleString()}</span>
              <div className="flex items-center space-x-1">
                {isNeutral ? (
                  <Minus className="w-3 h-3 text-gray-400" />
                ) : isPositive ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={`font-medium ${
                  isNeutral ? 'text-gray-400' : 
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};