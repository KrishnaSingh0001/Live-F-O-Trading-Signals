import React, { useState } from 'react';
import { Calculator, DollarSign, Shield, TrendingUp } from 'lucide-react';

export const RiskCalculator: React.FC = () => {
  const [capital, setCapital] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(1000);
  const [stopLoss, setStopLoss] = useState<number>(950);
  const [target, setTarget] = useState<number>(1100);

  const calculatePosition = () => {
    const riskAmount = (capital * riskPercent) / 100;
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const quantity = Math.floor(riskAmount / riskPerShare);
    const totalInvestment = quantity * entryPrice;
    const potentialLoss = quantity * riskPerShare;
    const potentialProfit = quantity * Math.abs(target - entryPrice);
    const riskRewardRatio = potentialProfit / potentialLoss;

    return {
      quantity,
      totalInvestment,
      potentialLoss,
      potentialProfit,
      riskRewardRatio
    };
  };

  const position = calculatePosition();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">Position Size Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Total Capital (₹)
            </label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              step="0.1"
              min="0.1"
              max="10"
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Entry Price (₹)
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Stop Loss (₹)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Target Price (₹)
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm font-medium">Position Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white font-medium">{position.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Investment:</span>
                <span className="text-white font-medium">₹{position.totalInvestment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-gray-400 text-sm font-medium">Risk Analysis</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Loss:</span>
                <span className="text-red-400 font-medium">₹{position.potentialLoss.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk %:</span>
                <span className="text-red-400 font-medium">{riskPercent}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm font-medium">Profit Potential</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Profit:</span>
                <span className="text-green-400 font-medium">₹{position.potentialProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk:Reward:</span>
                <span className={`font-medium ${
                  position.riskRewardRatio >= 2 ? 'text-green-400' : 
                  position.riskRewardRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  1:{position.riskRewardRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {position.riskRewardRatio < 1 && (
            <div className="bg-red-900/20 border border-red-400/20 rounded p-2">
              <p className="text-red-400 text-xs">
                ⚠️ Risk-reward ratio is unfavorable. Consider adjusting your target or stop loss.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};