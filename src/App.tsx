import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MarketScanner } from './components/MarketScanner';
import { LongTermScanner } from './components/LongTermScanner';
import { CoinSearch } from './components/CoinSearch';
import { TradeBook } from './components/TradeBook';
import { WalletSettings } from './components/WalletSettings';
import { LoadingScreen } from './components/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Zap, LogOut } from 'lucide-react';
import { Login } from './components/Login';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [bookedTrades, setBookedTrades] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [tempBalance, setTempBalance] = useState('');
  const [user, setUser] = useState<string | null>(null);

  const bookTrade = (trade: any) => {
    const newTrade = {
      ...trade,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: 'ONGOING',
      currentPrice: trade.entry,
      initialBalance: walletBalance
    };
    setBookedTrades(prev => [newTrade, ...prev]);
  };

  // Simulate price movement and TP/SL hits
  useEffect(() => {
    if (bookedTrades.length === 0) return;

    const interval = setInterval(() => {
      setBookedTrades(prev => prev.map(trade => {
        if (trade.status !== 'ONGOING') return trade;

        // Random price movement
        const volatility = 0.001; // 0.1%
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        const newPrice = trade.currentPrice * change;

        let newStatus = trade.status;
        let balanceChange = 0;

        if (trade.action === 'LONG') {
          if (newPrice >= trade.tp1) {
            newStatus = 'TP_HIT';
            balanceChange = (trade.tp1 - trade.entry) * 10; // Simulated leverage
          } else if (newPrice <= trade.sl) {
            newStatus = 'SL_HIT';
            balanceChange = (trade.sl - trade.entry) * 10;
          }
        } else {
          if (newPrice <= trade.tp1) {
            newStatus = 'TP_HIT';
            balanceChange = (trade.entry - trade.tp1) * 10;
          } else if (newPrice >= trade.sl) {
            newStatus = 'SL_HIT';
            balanceChange = (trade.entry - trade.sl) * 10;
          }
        }

        if (newStatus !== 'ONGOING' && walletBalance !== null) {
          setWalletBalance(prev => (prev || 0) + balanceChange);
        }

        return { ...trade, currentPrice: newPrice, status: newStatus };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [bookedTrades, walletBalance]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (walletBalance === null) {
    return (
      <div className="h-screen bg-[#0A0B0D] flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#151619] border border-white/5 p-10 rounded-[2.5rem] max-w-md w-full space-y-8 shadow-2xl relative z-10"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
              <Wallet className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">GEN-Z <span className="text-yellow-500">PRO</span></h1>
            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.3em]">Neural Terminal Initialization</p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center px-4">
              Enter your initial wallet balance to calibrate the Neural Risk Engine.
            </p>
            <div className="relative">
              <input 
                type="number"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 px-6 text-2xl font-black text-white focus:border-yellow-500 transition-all outline-none text-center"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-500 font-black">USDT</span>
            </div>
            <button 
              onClick={() => tempBalance && setWalletBalance(parseFloat(tempBalance))}
              className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Initialize Terminal
            </button>
            <button 
              onClick={() => setWalletBalance(10000)}
              className="w-full py-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Quick Start (10,000 USDT)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0B0D] text-white overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUser(null)} />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'scanner' && <MarketScanner onBookTrade={bookTrade} />}
              {activeTab === 'longterm' && <LongTermScanner onBookTrade={bookTrade} />}
              {activeTab === 'search' && <CoinSearch onBookTrade={bookTrade} />}
              {activeTab === 'book' && <TradeBook trades={bookedTrades} />}
              {activeTab === 'wallet' && <WalletSettings balance={walletBalance} setBalance={setWalletBalance} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 right-0 left-64 bg-[#0A0B0D]/80 backdrop-blur-md border-t border-white/5 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Binance API Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              <span>Deterministic Engine v3.0.0</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Latency: 18ms</span>
            <span>Uptime: 100%</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
