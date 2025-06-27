import React, { useState } from 'react';
import { BarChart3, Calculator, Activity, Bell, Settings, TrendingUp } from 'lucide-react';
import { useLiveMarketData } from './hooks/useLiveMarketData';
import { MarketTicker } from './components/MarketTicker';
import { MarketOverview } from './components/MarketOverview';
import { TradingSignalCard } from './components/TradingSignalCard';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { RiskCalculator } from './components/RiskCalculator';
import { TradingChart } from './components/TradingChart';
import { LiveDataStatus } from './components/LiveDataStatus';

function App() {
  const { 
    marketData, 
    chartData, 
    technicalData, 
    signals, 
    isConnected, 
    loading, 
    symbols, 
    refreshData 
  } = useLiveMarketData();
  
  const [activeTab, setActiveTab] = useState<'signals' | 'charts' | 'analysis' | 'calculator'>('signals');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NIFTY');

  const tabs = [
    { id: 'signals', label: 'Trading Signals', icon: BarChart3 },
    { id: 'charts', label: 'Live Charts', icon: TrendingUp },
    { id: 'analysis', label: 'Technical Analysis', icon: Activity },
    { id: 'calculator', label: 'Risk Calculator', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Live F&O Trading Signals</h1>
                <p className="text-gray-400 text-sm">Real-time Market Analysis with Live Data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveDataStatus 
                isConnected={isConnected}
                loading={loading}
                onRefresh={refreshData}
                lastUpdate={Date.now()}
              />
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <Bell className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Market Ticker */}
      <div className="bg-gray-900 border-b border-gray-700 overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap py-2">
          {symbols.map(symbol => {
            const data = marketData.get(symbol);
            if (!data) return null;

            const isPositive = data.change >= 0;
            const isNeutral = data.change === 0;

            return (
              <div key={symbol} className="flex items-center space-x-2 px-6 text-sm">
                <span className="text-gray-300 font-medium">{symbol}</span>
                <span className="text-white font-bold">₹{data.price.toLocaleString()}</span>
                <div className="flex items-center space-x-1">
                  <span className={`font-medium ${
                    isNeutral ? 'text-gray-400' : 
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Connection Status */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Market Status</p>
                <p className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            </div>
          </div>

          {/* Active Signals */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Buy Signals</p>
                <p className="text-green-400 font-semibold text-lg">
                  {Array.from(signals.values()).filter(s => s.signal === 'BUY').length}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>

          {/* Sell Signals */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sell Signals</p>
                <p className="text-red-400 font-semibold text-lg">
                  {Array.from(signals.values()).filter(s => s.signal === 'SELL').length}
                </p>
              </div>
              <Activity className="w-6 h-6 text-red-400" />
            </div>
          </div>

          {/* Market Trend */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Market Trend</p>
                <p className="text-blue-400 font-semibold text-lg">
                  {Array.from(signals.values()).filter(s => s.signal === 'BUY').length > 
                   Array.from(signals.values()).filter(s => s.signal === 'SELL').length ? 'Bullish' : 'Bearish'}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'signals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {symbols.map(symbol => {
              const data = marketData.get(symbol);
              const signal = signals.get(symbol);
              
              if (!data || !signal) return null;
              
              return (
                <TradingSignalCard
                  key={symbol}
                  symbol={symbol}
                  marketData={data}
                  signal={signal}
                />
              );
            })}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Symbol Selector */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3">Select Symbol for Chart Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {symbols.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSymbol === symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Trading Chart */}
            {(() => {
              const data = chartData.get(selectedSymbol);
              const technical = technicalData.get(selectedSymbol);
              
              if (!data || !technical) {
                return (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                    <div className="text-gray-400">Loading chart data for {selectedSymbol}...</div>
                  </div>
                );
              }
              
              return (
                <TradingChart
                  symbol={selectedSymbol}
                  data={data}
                  technicalData={technical}
                  height={500}
                />
              );
            })()}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Symbol Selector */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3">Select Symbol for Technical Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {symbols.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSymbol === symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Analysis */}
            {(() => {
              const data = marketData.get(selectedSymbol);
              const technical = technicalData.get(selectedSymbol);
              
              if (!data || !technical) return null;
              
              return (
                <TechnicalIndicators
                  symbol={selectedSymbol}
                  indicators={{
                    rsi: technical.rsi[technical.rsi.length - 1] || 50,
                    macd: {
                      macd: technical.macd.macd[technical.macd.macd.length - 1] || 0,
                      signal: technical.macd.signal[technical.macd.signal.length - 1] || 0,
                      histogram: technical.macd.histogram[technical.macd.histogram.length - 1] || 0
                    },
                    movingAverages: {
                      sma20: technical.sma20[technical.sma20.length - 1] || data.price,
                      sma50: technical.sma50[technical.sma50.length - 1] || data.price,
                      ema20: technical.ema20[technical.ema20.length - 1] || data.price,
                      ema50: technical.ema50[technical.ema50.length - 1] || data.price
                    },
                    bollingerBands: {
                      upper: technical.bollingerBands.upper[technical.bollingerBands.upper.length - 1] || data.price * 1.02,
                      middle: technical.bollingerBands.middle[technical.bollingerBands.middle.length - 1] || data.price,
                      lower: technical.bollingerBands.lower[technical.bollingerBands.lower.length - 1] || data.price * 0.98
                    },
                    supportResistance: {
                      support: [data.price * 0.95, data.price * 0.92, data.price * 0.88],
                      resistance: [data.price * 1.05, data.price * 1.08, data.price * 1.12]
                    }
                  }}
                  currentPrice={data.price}
                />
              );
            })()}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-4xl mx-auto">
            <RiskCalculator />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              Professional F&O Trading Signals Tool • Real-time Live Market Data • Advanced Risk Management
            </p>
            <p className="text-xs mt-2">
              ⚠️ Trading involves risk. This tool provides analysis based on technical indicators. 
              Please consult with a financial advisor and do your own research before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;