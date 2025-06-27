import React from 'react';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '../types/market';

interface TechnicalIndicatorsProps {
  symbol: string;
  indicators: TechnicalIndicatorsType;
  currentPrice: number;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ 
  symbol, 
  indicators, 
  currentPrice 
}) => {
  const getRSIColor = (rsi: number) => {
    if (rsi <= 30) return 'text-green-400';
    if (rsi >= 70) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getRSISignal = (rsi: number) => {
    if (rsi <= 30) return 'Oversold';
    if (rsi >= 70) return 'Overbought';
    return 'Neutral';
  };

  const getMACDColor = (histogram: number) => {
    return histogram > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Technical Analysis - {symbol}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RSI */}
        <div className="bg-gray-900 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">RSI (14)</span>
            <span className={`text-sm font-bold ${getRSIColor(indicators.rsi)}`}>
              {getRSISignal(indicators.rsi)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  indicators.rsi <= 30 ? 'bg-green-400' :
                  indicators.rsi >= 70 ? 'bg-red-400' : 'bg-yellow-400'
                }`}
                style={{ width: `${indicators.rsi}%` }}
              />
            </div>
            <span className="text-white font-medium text-sm">{indicators.rsi.toFixed(1)}</span>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-gray-900 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">MACD</span>
            <span className={`text-sm font-bold ${getMACDColor(indicators.macd.histogram)}`}>
              {indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">MACD:</span>
              <span className="text-white">{indicators.macd.macd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Signal:</span>
              <span className="text-white">{indicators.macd.signal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="bg-gray-900 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm font-medium">Moving Averages</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">SMA 20:</span>
              <span className={`ml-1 ${currentPrice > indicators.movingAverages.sma20 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{indicators.movingAverages.sma20.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">SMA 50:</span>
              <span className={`ml-1 ${currentPrice > indicators.movingAverages.sma50 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{indicators.movingAverages.sma50.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">EMA 20:</span>
              <span className={`ml-1 ${currentPrice > indicators.movingAverages.ema20 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{indicators.movingAverages.ema20.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">EMA 50:</span>
              <span className={`ml-1 ${currentPrice > indicators.movingAverages.ema50 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{indicators.movingAverages.ema50.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div className="bg-gray-900 rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm font-medium">Bollinger Bands</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Upper:</span>
              <span className="text-red-400">₹{indicators.bollingerBands.upper.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Middle:</span>
              <span className="text-yellow-400">₹{indicators.bollingerBands.middle.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lower:</span>
              <span className="text-green-400">₹{indicators.bollingerBands.lower.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support and Resistance */}
      <div className="mt-4 bg-gray-900 rounded p-3">
        <h4 className="text-gray-400 text-sm font-medium mb-2">Support & Resistance Levels</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-green-400 text-xs font-medium">Support Levels:</span>
            <div className="space-y-1 mt-1">
              {indicators.supportResistance.support.map((level, index) => (
                <div key={index} className="text-green-400 text-xs">
                  S{index + 1}: ₹{level.toFixed(0)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-red-400 text-xs font-medium">Resistance Levels:</span>
            <div className="space-y-1 mt-1">
              {indicators.supportResistance.resistance.map((level, index) => (
                <div key={index} className="text-red-400 text-xs">
                  R{index + 1}: ₹{level.toFixed(0)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};