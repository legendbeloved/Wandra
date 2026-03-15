import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Map, Book, User, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSyncing?: boolean;
  hasPendingSync?: boolean;
}

export const Layout = ({ children, activeTab, onTabChange, isSyncing, hasPendingSync }: LayoutProps) => {
  const isOnline = useOnlineStatus();
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'journey', icon: Map, label: 'Journey' },
    { id: 'library', icon: Book, label: 'Library' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-sand-50 text-sand-500 font-sans">
      {/* Liquid Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[70%] bg-teal-600/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-amber-600/6 blur-[130px] rounded-full" />
        <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] bg-teal-400/4 blur-[100px] rounded-full" />
      </div>

      <main className="pb-28 max-w-md mx-auto min-h-screen relative z-10">
        {!isOnline && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 text-center flex items-center justify-center gap-2"
          >
            <WifiOff size={12} /> Offline Mode — Data will sync when reconnected
          </motion.div>
        )}
        {isOnline && isSyncing && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-teal-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 text-center flex items-center justify-center gap-2"
          >
            <RefreshCw size={12} className="animate-spin" /> Syncing memories...
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-5 left-5 right-5 z-50">
        <div className="max-w-md mx-auto glass-nav px-6 py-3.5 rounded-[2rem] shadow-2xl shadow-black/30 flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center gap-1 transition-all duration-500 relative px-3 py-1',
                  isActive ? 'text-teal-400 scale-105' : 'text-sand-400 hover:text-sand-300'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[8px] font-bold uppercase tracking-[0.15em]">
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
