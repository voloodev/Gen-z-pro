import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Target, Shield, Percent, X, ChevronRight, Info, BarChart3, TrendingUp as TrendIcon, History } from 'lucide-react';
import axios from 'axios';
import { analyzeMarket, TradingSignal } from '../services/taEngine';
import { TradingViewChart } from './TradingViewChart';

interface MarketScannerProps {
  onBookTrade: (trade: any) => void;
}

export const MarketScanner: React.FC<MarketScannerProps> = ({ onBookTrade }) => {
  const [scannedCoins, setScannedCoins] = useState<any[]>([]);
  const [btcTrend, setBtcTrend] = useState<'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'>('SIDEWAYS');
  const [signals, setSignals] = useState<Record<string, TradingSignal>>({});
  const [loadingSignals, setLoadingSignals] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [timeframe, setTimeframe] = useState('1h');

  const fetchScannerData = async () => {
    setLoading(true);
    try {
      // Fetch BTC data first to satisfy correlation check
      const btcResponse = await axios.get(`/api/market-data?symbol=BTCUSDT&interval=${timeframe}`);
      const btcSignal = analyzeMarket(btcResponse.data, "LIVE");
      const currentBtcTrend = btcSignal.action === 'LONG' ? 'UPTREND' : btcSignal.action === 'SHORT' ? 'DOWNTREND' : 'SIDEWAYS';
      setBtcTrend(currentBtcTrend);

      const response = await axios.get(`/api/scanner?interval=${timeframe}`);
      if (response.data.length === 0) {
        // Fallback to demo mode if no data
        setIsDemoMode(true);
      } else {
        setScannedCoins(response.data);
        setIsDemoMode(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Scanner fetch error:', error);
      setIsDemoMode(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      const demoCoins = [
        { symbol: 'BTCUSDT', currentPrice: 65432.10, trend: 'UPTREND' },
        { symbol: 'ETHUSDT', currentPrice: 3456.78, trend: 'UPTREND' },
        { symbol: 'SOLUSDT', currentPrice: 145.67, trend: 'DOWNTREND' },
        { symbol: 'BNBUSDT', currentPrice: 589.45, trend: 'UPTREND' },
      ];
      setScannedCoins(demoCoins);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchScannerData();
    const interval = setInterval(fetchScannerData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scannedCoins.length > 0) {
      // Auto-generate signals for the first few coins
      scannedCoins.slice(0, 6).forEach(coin => {
        if (!signals[coin.symbol]) {
          generateSignal(coin);
        }
      });
    }
  }, [scannedCoins]);

  const generateSignal = async (coin: any) => {
    setLoadingSignals(prev => ({ ...prev, [coin.symbol]: true }));
    try {
      if (isDemoMode) {
        // Mock signal for demo
        const mockHistory = Array.from({ length: 100 }, (_, i) => ({
          time: Date.now() - (100 - i) * 3600000,
          open: coin.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
          high: coin.currentPrice * (1 + Math.random() * 0.02),
          low: coin.currentPrice * (1 - Math.random() * 0.02),
          close: coin.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        }));
        
        const signal = analyzeMarket({
          symbol: coin.symbol,
          currentPrice: coin.currentPrice,
          indicators: { rsi: 45, macd: { MACD: 0.1, signal: 0.05 }, ema20: coin.currentPrice * 0.99, ema50: coin.currentPrice * 0.98 },
          history: mockHistory
        }, "LIVE");
        
        // Update coin trend to match signal for consistency
        setScannedCoins(prev => prev.map(c => 
          c.symbol === coin.symbol ? { ...c, trend: signal.action === 'LONG' ? 'UPTREND' : signal.action === 'SHORT' ? 'DOWNTREND' : c.trend } : c
        ));

        // Force some patterns for demo
        signal.patterns = ['BOS Bullish', 'Bullish FVG', 'Double Bottom', 'Cup Pattern', 'Bullish Order Block'];
        signal.patternDetails = [
          { name: 'BOS', type: 'line', price: coin.currentPrice * 0.98, timeStart: mockHistory[80].time/1000, timeEnd: mockHistory[99].time/1000, color: '#22c55e', label: 'BOS' },
          { name: 'FVG', type: 'box', priceUpper: coin.currentPrice * 0.995, priceLower: coin.currentPrice * 0.99, timeStart: mockHistory[90].time/1000, timeEnd: mockHistory[99].time/1000, color: 'rgba(34, 197, 94, 0.2)', label: 'FVG' },
          { name: 'OB', type: 'box', priceUpper: coin.currentPrice * 0.97, priceLower: coin.currentPrice * 0.96, timeStart: mockHistory[70].time/1000, timeEnd: mockHistory[99].time/1000, color: 'rgba(59, 130, 246, 0.2)', label: 'Bullish OB' }
        ];
        signal.reasoning = "Demo Mode: Multiple SMC/ICT confluences detected. BOS confirmed trend shift, FVG provides liquidity, and Double Bottom indicates strong support.";
        
        setSignals(prev => ({ ...prev, [coin.symbol]: signal }));
        return;
      }

      const marketDataResponse = await axios.get(`/api/market-data?symbol=${coin.symbol}&interval=${timeframe}`);
      const signal = analyzeMarket(marketDataResponse.data, "LIVE", btcTrend);
      
      // Update coin trend to match signal for consistency
      setScannedCoins(prev => prev.map(c => 
        c.symbol === coin.symbol ? { ...c, trend: signal.action === 'LONG' ? 'UPTREND' : signal.action === 'SHORT' ? 'DOWNTREND' : c.trend } : c
      ));

      setSignals(prev => ({ ...prev, [coin.symbol]: signal }));
    } catch (error) {
      console.error('Signal generation error:', error);
    } finally {
      setLoadingSignals(prev => ({ ...prev, [coin.symbol]: false }));
    }
  };

  const sortedCoins = [...scannedCoins]
    .filter(coin => {
      const signal = signals[coin.symbol];
      return signal ? signal.action !== 'NEUTRAL' : true; // Keep coins without signals yet
    })
    .sort((a, b) => {
      const signalA = signals[a.symbol];
      const signalB = signals[b.symbol];
      if (signalA && signalB) return signalB.winRate - signalA.winRate;
      if (signalA) return -1;
      if (signalB) return 1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">LIVE MARKET SCANNER</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Scanning SMC/ICT Confirmations</p>
            <span className="text-[10px] bg-white/5 text-yellow-500 px-2 py-0.5 rounded border border-white/5 font-mono font-bold">{timeframe.toUpperCase()} TF</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {['15m', '1h', '4h'].map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); fetchScannerData(); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${timeframe === tf ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${isDemoMode ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
            title="Toggle Demo Mode to see how patterns look even without live signals"
          >
            {isDemoMode ? 'Demo Mode: ON' : 'Demo Mode: OFF'}
          </button>
          <button 
            onClick={fetchScannerData}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-yellow-500"
            title="Refresh Scanner"
          >
            <Clock className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-yellow-500 font-bold uppercase">Engine Active</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${btcTrend === 'UPTREND' ? 'bg-green-500/10 border-green-500/20 text-green-500' : btcTrend === 'DOWNTREND' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
            <span className="text-[10px] font-mono font-bold">BTC: {btcTrend}</span>
          </div>
        </div>
      </div>

      {!loading && sortedCoins.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#151619] border border-white/5 rounded-[2.5rem] space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">No High-Probability Signals</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              The neural engine is currently scanning the market but hasn't found any setups that meet our strict SMC/ICT criteria.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsDemoMode(false);
              fetchScannerData();
            }}
            className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
          >
            Force Re-Scan
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))
        ) : (
          sortedCoins.map((coin) => (
            <motion.div
              key={coin.symbol}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#151619] border border-white/5 rounded-2xl p-5 hover:border-yellow-500/30 transition-all group relative overflow-hidden cursor-pointer"
              onClick={() => signals[coin.symbol] && setSelectedSignal(signals[coin.symbol])}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{coin.symbol}</h3>
                  <p className="text-xl font-mono text-yellow-500">${coin.currentPrice.toLocaleString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold ${coin.trend === 'UPTREND' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {coin.trend}
                </div>
              </div>

              {!signals[coin.symbol] ? (
                <button
                  onClick={(e) => { e.stopPropagation(); generateSignal(coin); }}
                  disabled={loadingSignals[coin.symbol]}
                  className="w-full py-3 bg-white/5 hover:bg-yellow-500 hover:text-black text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSignals[coin.symbol] ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {loadingSignals[coin.symbol] ? 'Analyzing...' : 'Analyze Patterns'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-2 rounded-lg ${signals[coin.symbol].action === 'LONG' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <span className={`text-xs font-black ${signals[coin.symbol].action === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                      {signals[coin.symbol].action} SIGNAL
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); generateSignal(coin); }}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      title="Re-Analyze"
                    >
                      <Clock className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-mono text-gray-400">{signals[coin.symbol].confidence}% Confidence</span>
                    <span className="text-[10px] font-mono text-green-500 font-bold">{signals[coin.symbol].winRate}% Win Rate</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Entry</p>
                      <p className="text-xs font-mono text-white">{signals[coin.symbol].entry}</p>
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Stop Loss</p>
                      <p className="text-xs font-mono text-red-500">{signals[coin.symbol].sl}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-yellow-500 font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Full Analysis <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedSignal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#151619] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedSignal.action === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {selectedSignal.action === 'LONG' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic">{selectedSignal.symbol} <span className="text-yellow-500">ANALYSIS</span></h3>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                      {isDemoMode ? 'Demo Mode: Mock Data Visualization' : 'Neural Confirmation Engine v3.0'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSignal(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Visual Chart Simulation */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-yellow-500" />
                      Pattern Visualization
                    </h4>
                    <div className="flex gap-4 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-500">ENTRY</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-gray-500">SL</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[350px] w-full bg-black/40 rounded-3xl border border-white/5 p-4 relative overflow-hidden">
                    <TradingViewChart 
                      data={selectedSignal.history} 
                      projection={selectedSignal.projection}
                      patterns={selectedSignal.patternDetails}
                      entry={selectedSignal.entry}
                      sl={selectedSignal.sl}
                      tp1={selectedSignal.tp1}
                      timeframe={timeframe}
                    />

                    {/* Pattern Overlay Text */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                      {selectedSignal.patterns.map((p, i) => (
                          <motion.div 
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-xl"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${p.toLowerCase().includes('bullish') || p.toLowerCase().includes('bms') ? 'bg-blue-500' : 'bg-red-500'}`} />
                            {p}
                          </motion.div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 flex gap-3 pointer-events-none">
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-white/5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">EMA 20</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-white/5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">EMA 50</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-white/5">
                        <div className="w-2 h-0.5 bg-white/20 border-t border-dashed border-white/40" />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">BB Bands</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Trade Reasoning
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed italic">
                        "{selectedSignal.reasoning}"
                      </p>
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Market Projection</p>
                        <p className="text-xs text-gray-400">
                          Based on the identified {selectedSignal.patterns[0]}, we expect a strong {selectedSignal.action === 'LONG' ? 'bullish continuation' : 'bearish rejection'} from the current liquidity zone. The entry is optimized for the best risk-to-reward ratio.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Risk Parameters
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Leverage</p>
                          <p className="text-lg font-black text-white italic">{selectedSignal.leverage}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Win Rate</p>
                          <p className="text-lg font-black text-green-500 italic">{selectedSignal.winRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <History className="w-4 h-4 text-purple-500" />
                        Historical Pattern Success
                      </h4>
                      {selectedSignal.historicalSuccess ? (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-400">
                            The Neural Engine scanned the last 300 candles for similar pattern combinations.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-gray-500 uppercase font-bold">Occurrences</p>
                              <p className="text-lg font-black text-white">{selectedSignal.historicalSuccess.totalOccurrences} Times</p>
                            </div>
                            <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-gray-500 uppercase font-bold">Hist. Win Rate</p>
                              <p className="text-lg font-black text-purple-500">{selectedSignal.historicalSuccess.winRate}%</p>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                            <p className="text-[10px] text-purple-400 font-bold uppercase">Strategy Verdict</p>
                            <p className="text-xs text-gray-300 mt-1">
                              Historically, this setup has yielded an average profit ratio of <span className="text-purple-400 font-bold">{selectedSignal.historicalSuccess.avgProfit}x</span> per trade.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Insufficient historical data for this specific pattern combination.</p>
                      )}
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Active Indicators
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['RSI', 'Stoch RSI', 'MFI', 'ADX', 'EMA 20/50', 'MACD', 'Bollinger Bands', 'Volume Profile'].map((ind) => (
                          <div key={ind} className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-mono text-gray-400">
                            {ind}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Execution Levels</h4>
                        <div className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {selectedSignal.confidence}% Confidence
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-black text-xs">E</div>
                            <span className="text-sm font-bold text-gray-400">ENTRY</span>
                          </div>
                          <span className="text-xl font-mono font-black text-white">${selectedSignal.entry}</span>
                        </div>
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-black text-xs">S</div>
                            <span className="text-sm font-bold text-gray-400">STOP LOSS</span>
                          </div>
                          <span className="text-xl font-mono font-black text-red-500">${selectedSignal.sl}</span>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          {[selectedSignal.tp1, selectedSignal.tp2, selectedSignal.tp3].map((tp, i) => (
                            <div key={i} className="flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">TARGET {i + 1}</span>
                              <span className="text-sm font-mono font-bold text-green-500">${tp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => { onBookTrade(selectedSignal); setSelectedSignal(null); }}
                      className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 shadow-xl"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Book This Trade
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
