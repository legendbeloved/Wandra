"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseService";
import { MapPin, Sparkles, BookOpen, Navigation, Loader2 } from "lucide-react";

// ─── ANIMATION VARIANTS ───

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

const illustrationVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.2, duration: 0.5, ease: "easeOut" },
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Check if user is already onboarded
  useEffect(() => {
    const checkOnboardedStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", session.user.id)
        .single();

      if (profile?.onboarded) {
        router.push("/app");
      }
    };

    checkOnboardedStatus();
  }, [router]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setStep((prev) => prev + newDirection);
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const requestLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Permission granted, move to next step
        paginate(1);
      },
      (error) => {
        setLocationError("Location access denied. Some features won't work.");
      }
    );
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from("profiles")
        .update({ onboarded: true })
        .eq("id", session.user.id);

      router.push("/app");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
    } finally {
      setIsCompleting(false);
    }
  };

  // ─── STEP RENDERERS ───

  const renderStep0 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div
        variants={illustrationVariants}
        initial="hidden"
        animate="visible"
        className="relative w-64 h-64 mb-12"
      >
        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-3xl" />
        {/* Wanderer Silhouette Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-teal-500/30 flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <Navigation className="w-12 h-12 text-teal-300" />
          </div>
        </div>
      </motion.div>

      <h1 className="font-serif italic text-4xl text-sand-50 mb-6">
        Your journeys, written for you.
      </h1>
      <p className="text-sand-200 text-lg leading-relaxed max-w-sm mb-12">
        Wandra quietly captures every place you pass through, the weather, the moments — and turns it all into a beautiful journal entry.
      </p>

      <button
        onClick={() => paginate(1)}
        className="w-full max-w-xs h-14 rounded-xl bg-[#0F7490] hover:bg-[#0C5E75] text-white font-semibold shadow-[0_4px_16px_rgba(15,116,144,0.32)] transition-all"
      >
        Next
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div
        variants={illustrationVariants}
        initial="hidden"
        animate="visible"
        className="relative w-64 h-64 mb-12"
      >
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-amber-500/30 flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <MapPin className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          </div>
        </div>
      </motion.div>

      <h2 className="font-serif italic text-4xl text-sand-50 mb-6">
        We need to know where you are.
      </h2>
      <p className="text-sand-200 text-lg leading-relaxed max-w-sm mb-8">
        Location access lets Wandra track your route and name the places you visit. We never share your location data.
      </p>

      {locationError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
          {locationError}
        </div>
      )}

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={requestLocation}
          className="w-full h-14 rounded-xl bg-[#0F7490] hover:bg-[#0C5E75] text-white font-semibold shadow-[0_4px_16px_rgba(15,116,144,0.32)] transition-all"
        >
          Allow Location
        </button>
        {locationError && (
          <button
            onClick={() => paginate(1)}
            className="w-full h-14 rounded-xl bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
          >
            Continue anyway
          </button>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div
        variants={illustrationVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm mb-12 flex items-center justify-between relative"
      >
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] border-b-2 border-dashed border-teal-500/30 -translate-y-1/2 z-0" />

        {/* Mini Storyboard Steps */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#0F7490] shadow-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-sand-300">Set route</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#C4622D] shadow-lg flex items-center justify-center">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-sand-300">Travel</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#6B9E72] shadow-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-sand-300">Read</span>
        </div>
      </motion.div>

      <h2 className="font-serif italic text-4xl text-sand-50 mb-6">
        It's this simple.
      </h2>
      <p className="text-sand-200 text-lg leading-relaxed max-w-sm mb-12">
        Enter your destination, put your phone away, and let Wandra capture the memories.
      </p>

      <button
        onClick={completeOnboarding}
        disabled={isCompleting}
        className="w-full max-w-xs h-14 flex items-center justify-center rounded-xl bg-[#C4622D] hover:bg-[#A44F24] text-white font-semibold shadow-[0_4px_16px_rgba(196,98,45,0.32)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isCompleting ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing...</>
        ) : (
          "Start My First Journey"
        )}
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] overflow-hidden">

      {/* ─── HEADER ROW (Dots + Skip) ─── */}
      <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-center">
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                width: i === step ? 24 : 8,
                backgroundColor: i === step ? "#FFFFFF" : "rgba(255,255,255,0.3)",
              }}
              className="h-2 rounded-full transition-all duration-300"
            />
          ))}
        </div>

        {/* Skip Button */}
        {step < 2 && (
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-sand-200 hover:text-white transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* ─── SLIDES CONTAINER ─── */}
      <div className="relative w-full h-screen">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
