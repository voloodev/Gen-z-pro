import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, Target, ShieldAlert, Zap } from 'lucide-react';
import axios from 'axios';
import { analyzeMarket, TradingSignal } from '../services/taEngine';
import { motion } from 'motion/react';

interface CoinSearchProps {
  onBookTrade: (trade: any) => void;
}

export const CoinSearch: React.FC<CoinSearchProps> = ({ onBookTrade }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [signal, setSignal] = useState<TradingSignal | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setResult(null);
    setSignal(null);
    
    try {
      const symbol = query.toUpperCase().endsWith('USDT') ? query.toUpperCase() : `${query.toUpperCase()}USDT`;
      const response = await axios.get(`/api/market-data?symbol=${symbol}`);
      setResult(response.data);
      
      const aiSignal = analyzeMarket(response.data);
      setSignal(aiSignal);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH COIN (e.g. BTC, ETH, SOL)..."
          className="w-full bg-[#151619] border-2 border-white/5 rounded-3xl py-6 px-16 text-xl font-black text-white focus:border-[#F3BA2F] transition-all outline-none italic tracking-tight uppercase"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6 group-focus-within:text-[#F3BA2F] transition-colors" />
        <button 
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#F3BA2F] text-black px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          Analyze
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-[#F3BA2F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">Deep Scanning Network...</p>
        </div>
      )}

      {result && signal && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Market Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#151619] border border-white/5 rounded-3xl p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Activity className="text-[#F3BA2F] w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white italic">{result.symbol}</h3>
                  <p className="text-4xl font-mono text-[#F3BA2F] font-bold">${result.currentPrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-2 justify-end ${signal.action === 'LONG' ? 'text-green-500' : signal.action === 'SHORT' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {signal.action === 'LONG' ? <TrendingUp /> : signal.action === 'SHORT' ? <TrendingDown /> : <Activity />}
                  <span className="text-2xl font-black italic">{signal.action}</span>
                </div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Neural Recommendation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#151619] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">RSI (14)</p>
                <p className="text-xl font-mono text-white">{result.indicators.rsi.toFixed(2)}</p>
              </div>
              <div className="bg-[#151619] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">EMA 20</p>
                <p className="text-xl font-mono text-white">${result.indicators.ema20.toFixed(2)}</p>
              </div>
              <div className="bg-[#151619] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Win Rate</p>
                <p className="text-xl font-mono text-green-500">{signal.winRate}%</p>
              </div>
              <div className="bg-[#151619] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Confidence</p>
                <p className="text-xl font-mono text-yellow-500">{signal.confidence}%</p>
              </div>
            </div>

            <div className="bg-[#151619] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-2 text-[#F3BA2F]">
                <Zap className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-widest">Technical Reasoning</h4>
              </div>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                {signal.reasoning}
              </p>
              <div className="flex flex-wrap gap-2 pt-4">
                {signal.patterns.map((p, i) => (
                  <span key={i} className="px-4 py-2 bg-white/5 rounded-xl text-xs text-gray-300 border border-white/5">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Setup */}
          <div className="space-y-6">
            <div className="bg-[#F3BA2F] rounded-3xl p-8 text-black space-y-6 shadow-[0_0_40px_rgba(243,186,47,0.1)]">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-center border-b border-black/10 pb-4">Setup Configuration</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Leverage</span>
                  <span className="text-sm font-black italic">{signal.leverage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Entry</span>
                  <span className="text-sm font-black font-mono">${signal.entry.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Stop Loss</span>
                  <span className="text-sm font-black font-mono text-red-700">${signal.sl.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                  <span className="text-[10px] font-bold">TP 1</span>
                  <span className="text-sm font-black font-mono">${signal.tp1.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                  <span className="text-[10px] font-bold">TP 2</span>
                  <span className="text-sm font-black font-mono">${signal.tp2.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                  <span className="text-[10px] font-bold">TP 3</span>
                  <span className="text-sm font-black font-mono">${signal.tp3.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => onBookTrade({ symbol: result.symbol, action: signal.action, entry: signal.entry, tp1: signal.tp1, sl: signal.sl })}
                className="w-full py-5 bg-black text-[#F3BA2F] rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
              >
                Book This Trade
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
              <ShieldAlert className="text-red-500 w-6 h-6 shrink-0" />
              <div>
                <h5 className="text-red-500 text-[10px] font-black uppercase tracking-widest">Risk Warning</h5>
                <p className="text-red-500/60 text-[10px] leading-tight mt-1">
                  Neural analysis is based on historical data. Always use proper risk management.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
