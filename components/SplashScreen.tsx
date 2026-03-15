import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0D1117] flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          {/* Liquid Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-teal-500 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-amber-500 blur-[130px] rounded-full animate-pulse [animation-delay:1.5s]" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-8 text-center relative z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 8, -8, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="text-8xl drop-shadow-2xl"
              >
                🧭
              </motion.div>
            </div>
            <div className="space-y-3">
              <h1 className="text-6xl font-serif font-medium tracking-tight text-white">
                Wandra
              </h1>
              <p className="text-teal-400 font-bold tracking-[0.3em] uppercase text-[11px] opacity-80">
                Your journey, written for you
              </p>
            </div>
          </motion.div>
          
          <div className="absolute bottom-16 w-16 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-teal-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
