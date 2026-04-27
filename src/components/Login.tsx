import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Zap, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'alex' && password === '1234') {
      onLogin(username);
    } else {
      setError('Invalid Neural Credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="h-screen bg-[#0A0B0D] flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#151619] border border-white/5 p-10 rounded-[2.5rem] max-w-md w-full space-y-8 shadow-2xl relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
            <Zap className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">GEN-Z <span className="text-yellow-500">PRO</span></h1>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.3em]">Neural Terminal Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-yellow-500 transition-all outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Key"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-yellow-500 transition-all outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest justify-center"
            >
              <ShieldAlert className="w-3 h-3" />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Access Terminal
          </button>
        </form>

        <p className="text-[10px] text-gray-600 text-center font-mono uppercase tracking-widest">
          Secure Encrypted Connection Active
        </p>
      </motion.div>
    </div>
  );
};
