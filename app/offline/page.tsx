"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WifiOff, Map, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    const checkIndexedDB = async () => {
      try {
        const dbRequest = indexedDB.open('wandra-offline-sync', 1);
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          if (db.objectStoreNames.contains('pending-moments')) {
            const transaction = db.transaction('pending-moments', 'readonly');
            const store = transaction.objectStore('pending-moments');
            const countRequest = store.count();
            countRequest.onsuccess = () => {
              setUnsyncedCount(countRequest.result);
            };
          }
        };
      } catch (e) {
        console.error("Failed to check offline storage", e);
      }
    };

    checkIndexedDB();
    
    // Check periodically
    const interval = setInterval(checkIndexedDB, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] text-sand-50 font-body flex flex-col items-center justify-center px-6 text-center">
      
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-teal-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-10">
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20"
          >
            <Map className="w-14 h-14 text-sand-300 opacity-60" />
            <div className="absolute -top-2 -right-2 bg-[#C4622D] p-2 rounded-xl shadow-lg">
              <WifiOff className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        <h1 className="font-serif text-[32px] font-medium leading-tight mb-4">
          You're offline.
        </h1>
        
        <p className="text-sand-300 text-[16px] leading-relaxed max-w-xs mb-10">
          Your journey is still being saved locally. We'll sync everything when you're back online.
        </p>

        {unsyncedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-white/10 border border-amber-500/30 px-5 py-3 rounded-2xl mb-10 backdrop-blur-md shadow-lg"
          >
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-[14px] font-medium text-amber-100">
              Waiting to sync {unsyncedCount} moment{unsyncedCount !== 1 ? 's' : ''}...
            </span>
          </motion.div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => window.location.reload()}
            className="h-[52px] bg-white text-[#0B3D4A] rounded-xl font-semibold text-[15px] hover:bg-sand-100 transition-colors"
          >
            Check connection
          </button>
          
          <Link 
            href="/home" 
            className="h-[52px] flex items-center justify-center border border-white/20 rounded-xl font-medium text-[15px] hover:bg-white/5 transition-colors"
          >
            View saved journeys
          </Link>
        </div>
      </motion.div>
      
      <div className="absolute bottom-10 left-0 w-full text-center">
        <p className="text-[12px] text-sand-400/60 uppercase tracking-widest font-medium">
          Wandra Offline Mode
        </p>
      </div>
    </div>
  );
}
