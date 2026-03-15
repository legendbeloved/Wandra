import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Compass, Map, Bell, ArrowRight, Camera, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface OnboardingViewProps {
  onComplete: (profile: any) => void;
  isLoading?: boolean;
}

export const OnboardingView = ({ onComplete, isLoading }: OnboardingViewProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    displayName: '',
    travelStyle: 'Adventurous',
    notifications: true,
  });

  const travelStyles = [
    { id: 'Adventurous', name: 'Adventurous', emoji: '🏔️', description: 'Seeking peaks and paths less traveled.' },
    { id: 'Calm', name: 'Calm', emoji: '🌊', description: 'Slow mornings and peaceful horizons.' },
    { id: 'Vibrant', name: 'Vibrant', emoji: '🌆', description: 'Electric cities and cultural pulses.' },
    { id: 'Reflective', name: 'Reflective', emoji: '✨', description: 'Solo walks and quiet discoveries.' },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  } as const;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-teal-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-900/20">
                <User size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-serif font-medium text-sand-100">Who shall we write for?</h1>
              <p className="text-sand-400 font-medium italic">Your journal will be addressed to you.</p>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Your Name"
                value={data.displayName}
                onChange={(e) => setData({ ...data, displayName: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all text-2xl font-medium placeholder:text-sand-400/40 shadow-xl shadow-black/10 text-center text-sand-100"
              />
            </div>

            <Button
              className="w-full py-6 text-xl rounded-[2rem]"
              disabled={!data.displayName.trim()}
              onClick={handleNext}
              size="lg"
            >
              Continue
              <ArrowRight size={22} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-medium text-sand-100">Your Travel Essence</h1>
              <p className="text-sand-400 font-medium italic">This helps Gemini set the tone of your entries.</p>
            </div>

            <div className="grid gap-4">
              {travelStyles.map((style) => (
                <Card
                  key={style.id}
                  variant={data.travelStyle === style.id ? 'glass' : 'elevated'}
                  className={`p-6 flex items-center gap-6 cursor-pointer border-2 transition-all duration-300 rounded-[2rem] ${
                    data.travelStyle === style.id ? 'border-teal-500 bg-teal-500/5' : 'border-transparent'
                  }`}
                  onClick={() => setData({ ...data, travelStyle: style.id })}
                >
                  <div className="text-4xl">{style.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-sand-100">{style.name}</h3>
                    <p className="text-sand-400 text-sm font-medium">{style.description}</p>
                  </div>
                  {data.travelStyle === style.id && (
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
                      <Sparkles size={16} />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Button
              className="w-full py-6 text-xl rounded-[2rem]"
              onClick={handleNext}
              size="lg"
            >
              Set My Style
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md space-y-12 text-center"
          >
            <div className="space-y-6">
              <div className="relative">
                <div className="w-32 h-32 bg-amber-100 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
                  <Bell size={48} className="text-amber-600" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 right-1/4 w-8 h-8 bg-amber-400 rounded-full blur-xl"
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-serif font-medium text-sand-100">Stay in the moment.</h1>
                <p className="text-sand-400 font-medium leading-relaxed italic">
                  We'll gently nudge you to capture photos or notes when we sense a "Key Moment" during your journey.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full py-6 text-xl rounded-[2rem]"
                onClick={handleNext}
                isLoading={isLoading}
                size="lg"
              >
                Enable Notifications
              </Button>
              <button
                onClick={handleNext}
                className="text-stone-400 font-bold uppercase tracking-widest text-xs hover:text-teal-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
