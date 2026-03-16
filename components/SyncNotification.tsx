'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CloudSync } from 'lucide-react';

export const SyncNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 5000);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-4 right-4 z-[100] flex justify-center"
        >
          <div className="bg-teal-900/90 backdrop-blur-xl border border-teal-500/30 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 text-sand-100">
            <div className="bg-teal-500/20 p-2 rounded-full text-teal-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Adventure Synced</p>
              <p className="text-xs text-sand-400">Your offline moments are now safe in the cloud.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
