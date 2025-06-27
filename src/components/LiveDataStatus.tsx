import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface LiveDataStatusProps {
  isConnected: boolean;
  loading: boolean;
  onRefresh: () => void;
  lastUpdate?: number;
}

export const LiveDataStatus: React.FC<LiveDataStatusProps> = ({
  isConnected,
  loading,
  onRefresh,
  lastUpdate
}) => {
  const getStatusColor = () => {
    if (loading) return 'text-yellow-400';
    if (isConnected) return 'text-green-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (loading) return 'Connecting...';
    if (isConnected) return 'Live Data';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <p className={`font-medium text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-400">
                Updated: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {!isConnected && !loading && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-400/20 rounded text-xs text-red-400">
          ⚠️ Using fallback data. Check your internet connection for live market data.
        </div>
      )}
      
      {isConnected && (
        <div className="mt-2 p-2 bg-green-900/20 border border-green-400/20 rounded text-xs text-green-400">
          ✓ Connected to live market data feeds
        </div>
      )}
    </div>
  );
};