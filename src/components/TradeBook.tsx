import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Target, TrendingUp, TrendingDown, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface BookedTrade {
  id: string;
  symbol: string;
  action: 'LONG' | 'SHORT';
  entry: number;
  currentPrice: number;
  tp1: number;
  sl: number;
  status: 'ONGOING' | 'TP_HIT' | 'SL_HIT';
  timestamp: number;
}

interface TradeBookProps {
  trades: any[];
}

export const TradeBook: React.FC<TradeBookProps> = ({ trades }) => {

  const calculatePnL = (trade: BookedTrade) => {
    const diff = trade.action === 'LONG' 
      ? (trade.currentPrice - trade.entry) / trade.entry 
      : (trade.entry - trade.currentPrice) / trade.entry;
    return (diff * 100).toFixed(2);
  };

  const stats = {
    weeklyPnL: trades.reduce((acc, trade) => {
      if (trade.status === 'ONGOING') return acc;
      const pnl = parseFloat(calculatePnL(trade));
      return acc + pnl;
    }, 0).toFixed(1),
    winRate: trades.length > 0 
      ? Math.round((trades.filter(t => t.status === 'TP_HIT').length / trades.filter(t => t.status !== 'ONGOING').length || 0) * 100)
      : 0,
    totalTrades: trades.length,
    activePositions: trades.filter(t => t.status === 'ONGOING').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">TRADE BOOK</h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Historical Performance & Active Positions</p>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className={`text-2xl font-black italic ${parseFloat(stats.weeklyPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(stats.weeklyPnL) >= 0 ? '+' : ''}{stats.weeklyPnL}%
            </p>
            <p className="text-[10px] font-mono text-gray-500 uppercase">Total PnL</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white italic">{stats.winRate}%</p>
            <p className="text-[10px] font-mono text-gray-500 uppercase">Win Rate</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-yellow-500 italic">{stats.activePositions}</p>
            <p className="text-[10px] font-mono text-gray-500 uppercase">Active</p>
          </div>
        </div>
      </div>

      <div className="bg-[#151619] border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset / Time</th>
              <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
              <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry / Live</th>
              <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">PnL</th>
              <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#F3BA2F] font-black text-xs">
                      {trade.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{trade.symbol}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{format(trade.timestamp, 'MMM dd, HH:mm')}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black italic ${trade.action === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trade.action}
                  </span>
                </td>
                <td className="p-4 text-xs font-mono">
                  <p className="text-gray-400">E: ${trade.entry.toLocaleString()}</p>
                  <p className="text-white font-bold">L: ${trade.currentPrice.toLocaleString()}</p>
                </td>
                <td className="p-4">
                  <p className={`text-sm font-black italic ${parseFloat(calculatePnL(trade)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(calculatePnL(trade)) >= 0 ? '+' : ''}{calculatePnL(trade)}%
                  </p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {trade.status === 'ONGOING' && <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />}
                    {trade.status === 'TP_HIT' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {trade.status === 'SL_HIT' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      trade.status === 'ONGOING' ? 'text-yellow-500' : 
                      trade.status === 'TP_HIT' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {trade.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
