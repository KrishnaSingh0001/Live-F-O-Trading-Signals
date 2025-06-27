import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { ChartData, TechnicalData } from '../services/marketDataService';
import { BarChart3, TrendingUp, Activity, Volume2 } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  data: ChartData[];
  technicalData: TechnicalData;
  height?: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  symbol, 
  data, 
  technicalData, 
  height = 400 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA20', 'SMA50']);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#1f2937' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#6b7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    volumeSeriesRef.current = volumeSeries;

    // Configure volume price scale
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    // Convert data for candlestick chart
    const candlestickData: CandlestickData[] = data.map(item => ({
      time: Math.floor(item.time / 1000) as any,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    // Convert data for volume chart
    const volumeData: HistogramData[] = data.map(item => ({
      time: Math.floor(item.time / 1000) as any,
      value: item.volume,
      color: item.close >= item.open ? '#10b98180' : '#ef444480',
    }));

    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);

    // Add technical indicators
    addTechnicalIndicators();
  }, [data, activeIndicators]);

  const addTechnicalIndicators = () => {
    if (!chartRef.current || !technicalData) return;

    // Remove existing indicator series (simplified approach)
    // In a production app, you'd want to manage these more carefully

    activeIndicators.forEach(indicator => {
      let indicatorData: LineData[] = [];
      let color = '#3b82f6';

      switch (indicator) {
        case 'SMA20':
          indicatorData = technicalData.sma20.map((value, index) => ({
            time: Math.floor(data[index + 19]?.time / 1000) as any,
            value,
          })).filter(item => item.time);
          color = '#f59e0b';
          break;
        case 'SMA50':
          indicatorData = technicalData.sma50.map((value, index) => ({
            time: Math.floor(data[index + 49]?.time / 1000) as any,
            value,
          })).filter(item => item.time);
          color = '#8b5cf6';
          break;
        case 'EMA20':
          indicatorData = technicalData.ema20.map((value, index) => ({
            time: Math.floor(data[index]?.time / 1000) as any,
            value,
          })).filter(item => item.time);
          color = '#06b6d4';
          break;
        case 'EMA50':
          indicatorData = technicalData.ema50.map((value, index) => ({
            time: Math.floor(data[index]?.time / 1000) as any,
            value,
          })).filter(item => item.time);
          color = '#ec4899';
          break;
      }

      if (indicatorData.length > 0) {
        const series = chartRef.current!.addLineSeries({
          color,
          lineWidth: 2,
          title: indicator,
        });
        series.setData(indicatorData);
      }
    });
  };

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const indicators = [
    { id: 'SMA20', label: 'SMA 20', color: '#f59e0b' },
    { id: 'SMA50', label: 'SMA 50', color: '#8b5cf6' },
    { id: 'EMA20', label: 'EMA 20', color: '#06b6d4' },
    { id: 'EMA50', label: 'EMA 50', color: '#ec4899' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">{symbol} Price Chart</h3>
        </div>
        <div className="flex items-center space-x-2">
          {indicators.map(indicator => (
            <button
              key={indicator.id}
              onClick={() => toggleIndicator(indicator.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeIndicators.includes(indicator.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: activeIndicators.includes(indicator.id) ? indicator.color : undefined
              }}
            >
              {indicator.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" />

      {/* Chart Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Bullish: {technicalData.rsi[technicalData.rsi.length - 1]?.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm">RSI: {technicalData.rsi[technicalData.rsi.length - 1]?.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm">Vol: {(technicalData.volume[technicalData.volume.length - 1] / 1000).toFixed(0)}K</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};