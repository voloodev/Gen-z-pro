import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, Target, Clock, BookMarked, Info } from 'lucide-react';
import axios from 'axios';
import { analyzeMarket, TradingSignal } from '../services/taEngine';

interface LongTermScannerProps {
  onBookTrade: (trade: any) => void;
}

export const LongTermScanner: React.FC<LongTermScannerProps> = ({ onBookTrade }) => {
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<TradingSignal | null>(null);

  const findLongTermOpportunity = async () => {
    setLoading(true);
    try {
      const marketDataResponse = await axios.get(`/api/market-data?symbol=BTCUSDT&interval=1d`);
      const result = analyzeMarket(marketDataResponse.data, "LONG_TERM");
      if (result.action === 'NEUTRAL') {
        setSignal(null);
        alert("No high-probability long term signals found at this moment.");
      } else {
        setSignal(result);
      }
    } catch (error) {
      console.error('Long term analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white italic tracking-tighter">LONG TERM ALPHA</h2>
        <p className="text-sm font-mono text-gray-500 uppercase tracking-[0.4em]">Elliot Wave & Macro Analysis</p>
      </div>

      {!signal ? (
        <div className="bg-[#151619] border border-white/5 rounded-3xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
            <Shield className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Active Macro Signals</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Long-term signals require high confirmation. Our neural engine scans for 200%+ gain opportunities.
            </p>
          </div>
          <button
            onClick={findLongTermOpportunity}
            disabled={loading}
            className="px-8 py-4 bg-[#F3BA2F] text-black font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto uppercase tracking-widest"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {loading ? 'Analyzing Macro...' : 'Initiate Macro Scan'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151619] border border-yellow-500/20 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="bg-yellow-500 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                <Shield className="text-yellow-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-black font-black text-2xl italic tracking-tight">{signal.symbol} MACRO</h3>
                <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">High Accuracy Confirmation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-black font-black text-3xl italic">{signal.winRate}%</p>
              <p className="text-black/60 text-[10px] font-bold uppercase">Win Rate</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6 col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Entry Zone</span>
                  </div>
                  <p className="text-2xl font-mono text-white font-bold">${signal.entry.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Est. Duration</span>
                  </div>
                  <p className="text-2xl font-mono text-white font-bold">{signal.estimatedDays} Days</p>
                </div>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Neural Analysis</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed italic font-mono">
                  "{signal.reasoning}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {signal.patterns.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400 border border-white/5">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-green-500/10 rounded-3xl border border-green-500/20 space-y-4">
                <h4 className="text-green-500 text-xs font-black uppercase tracking-widest text-center">Take Profit Targets</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold">TP 1</span>
                    <span className="text-green-500 font-mono font-bold">${signal.tp1.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold">TP 2</span>
                    <span className="text-green-500 font-mono font-bold">${signal.tp2.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold">TP 3</span>
                    <span className="text-green-500 font-mono font-bold">${signal.tp3.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => onBookTrade({ symbol: signal.symbol, action: signal.action, entry: signal.entry, tp1: signal.tp1, sl: signal.sl })}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/5"
              >
                <BookMarked className="w-4 h-4" />
                Book Macro Trade
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
