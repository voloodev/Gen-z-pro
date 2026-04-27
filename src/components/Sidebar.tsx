import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  BookOpen, 
  Wallet,
  Zap,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'scanner', label: 'Live Scanner', icon: Zap },
    { id: 'longterm', label: 'Long Term', icon: ShieldCheck },
    { id: 'search', label: 'Coin Search', icon: Search },
    { id: 'book', label: 'Trade Book', icon: BookOpen },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="w-64 bg-[#0A0B0D] border-r border-white/5 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tighter text-white italic">
          GEN-Z <span className="text-[#F3BA2F]">PRO</span>
        </h1>
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
          Neural Trading Terminal
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
              activeTab === item.id 
                ? 'bg-[#F3BA2F] text-black font-bold shadow-[0_0_20px_rgba(243,186,47,0.2)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'text-black scale-110' : 'text-gray-400 group-hover:text-[#F3BA2F] group-hover:scale-110'}`} />
            <span className="text-sm tracking-tight">{item.label}</span>
            
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebarActive"
                className="absolute left-0 w-1 h-6 bg-black rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Logout</span>
        </button>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#F3BA2F] flex items-center justify-center text-black font-bold text-xs">
            ZP
          </div>
          <div>
            <p className="text-xs font-bold text-white">Pro Member</p>
            <p className="text-[10px] text-gray-500">v2.4.0-alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
};
