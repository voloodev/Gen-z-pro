import React from 'react';
import { motion } from 'motion/react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0A0B0D] z-50 flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated Candles */}
        <div className="flex items-end gap-2 h-32">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ height: 20 }}
              animate={{ 
                height: [20, 60, 30, 80, 40],
                backgroundColor: i % 2 === 0 ? '#F3BA2F' : '#FFFFFF'
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className="w-3 rounded-t-sm relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-600" />
            </motion.div>
          ))}
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full animate-pulse" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-black tracking-tighter text-white italic">
          Z-PRO <span className="text-[#F3BA2F]">ALPHA</span>
        </h1>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-[#F3BA2F] rounded-full animate-bounce" />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">
            Initializing Neural Engine...
          </p>
        </div>
      </motion.div>
    </div>
  );
};
