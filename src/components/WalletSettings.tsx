import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck, Zap } from 'lucide-react';

interface WalletSettingsProps {
  balance: number;
  setBalance: (balance: number) => void;
}

export const WalletSettings: React.FC<WalletSettingsProps> = ({ balance, setBalance }) => {
  const [riskPerTrade, setRiskPerTrade] = useState(2); // 2% risk

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#F3BA2F] to-[#d4a017] rounded-[2rem] p-8 text-black relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/10 rounded-xl">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Available Balance</span>
              </div>
              <CreditCard className="w-8 h-8 opacity-20" />
            </div>
            
            <div>
              <p className="text-6xl font-black italic tracking-tighter">${balance.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2 text-black/60 font-bold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                <span>+14.2% from last month</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 py-4 bg-black/5 text-black/40 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center border border-black/10">
                External Wallet Linked
              </div>
            </div>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-black/5 rounded-full" />
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-black/5 rounded-full" />
        </div>

        <div className="bg-[#151619] border border-white/5 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-2 text-yellow-500">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-widest">Risk Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                <span>Risk Per Trade</span>
                <span className="text-white">{riskPerTrade}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(parseInt(e.target.value))}
                className="w-full accent-[#F3BA2F] bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Max Loss Per Trade</p>
              <p className="text-2xl font-black text-red-500 italic">${(balance * (riskPerTrade / 100)).toFixed(2)}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Recommended Leverage</p>
              <p className="text-2xl font-black text-green-500 italic">10x - 20x</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#151619] border border-white/5 rounded-[2rem] p-8 space-y-6">
        <div className="flex items-center gap-2 text-yellow-500">
          <Zap className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-widest">Auto-Leverage Engine</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          Our engine automatically calculates the optimal leverage and position size based on your wallet balance and the specific signal's stop-loss distance. This ensures you never risk more than your defined percentage.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Safe Mode Active
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            Configure Advanced Rules
          </button>
        </div>
      </div>
    </div>
  );
};
