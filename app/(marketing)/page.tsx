"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Sparkles, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MarketingLandingPage() {
  // Parallax Setup
  const { scrollY } = useScroll();
  const heroY1 = useTransform(scrollY, [0, 500], [0, -100]);
  const heroY2 = useTransform(scrollY, [0, 500], [0, -180]);
  const heroY3 = useTransform(scrollY, [0, 500], [0, -60]);

  return (
    <div className="min-h-screen bg-[#042F2E] text-sand-50 font-body selection:bg-teal-500/30 overflow-hidden">
      {/* ─── NAVIGATION (Minimal) ─── */}
      <nav className="absolute top-0 w-full p-6 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Minimal Logo Mark */}
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Wandra compass logo">
              🧭
            </span>
            <span className="font-serif italic font-semibold text-xl tracking-wide">
              Wandra
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-sand-200 hover:text-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-24 pt-20 pb-16">
        {/* Deep teal-to-amber gradient & noise background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] opacity-80" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          {/* Subtle dark bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#042F2E] to-transparent" />
        </div>

        {/* Floating Journal Cards (Parallax) */}
        <div className="absolute inset-0 z-10 hidden lg:block pointer-events-none">
          {/* Card 1 */}
          <motion.div
            style={{ y: heroY1 }}
            className="absolute top-[15%] right-[10%] w-72 h-96 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden transform rotate-6"
          >
            <div className="h-32 bg-teal-900/40 relative">
              <div className="absolute bottom-4 left-4 text-xs font-mono text-teal-200/80">
                Kyoto, Japan
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-1/2 h-4 bg-white/20 rounded-full" />
              <div className="w-full h-2 bg-white/10 rounded-full" />
              <div className="w-5/6 h-2 bg-white/10 rounded-full" />
              <div className="w-4/6 h-2 bg-white/10 rounded-full" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            style={{ y: heroY2 }}
            className="absolute top-[40%] right-[25%] w-64 h-80 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden transform -rotate-3"
          >
            <div className="h-28 bg-amber-900/40 relative">
              <div className="absolute bottom-4 left-4 text-xs font-mono text-amber-200/80">
                Santorini, Greece
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-2/3 h-4 bg-white/20 rounded-full" />
              <div className="w-full h-2 bg-white/10 rounded-full" />
              <div className="w-3/4 h-2 bg-white/10 rounded-full" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            style={{ y: heroY3 }}
            className="absolute bottom-[10%] left-[5%] w-80 h-40 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 transform -rotate-2"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                <MapPin className="text-teal-300 w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="w-1/3 h-3 bg-white/20 rounded-full" />
                <div className="w-full h-2 bg-white/10 rounded-full" />
                <div className="w-4/5 h-2 bg-white/10 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-2xl mt-12 lg:mt-0 lg:ml-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-serif text-6xl md:text-7xl lg:text-[80px] leading-[1.05] tracking-tight mb-6">
              <span className="font-light italic text-[#D2F7ED]">
                Your journey,
              </span>
              <br />
              <span className="font-bold text-[#FDFAF5]">written for you.</span>
            </h1>

            <p className="text-lg md:text-xl text-sand-200 font-medium leading-relaxed max-w-lg mb-10">
              Wandra captures every mile automatically. No writing required. Just travel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#C4622D] text-white font-semibold text-lg shadow-[0_8px_24px_rgba(196,98,45,0.40)] hover:bg-[#A44F24] hover:-translate-y-1 transition-all duration-200"
              >
                Start for Free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold text-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-200"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs font-mono uppercase tracking-widest">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="relative py-32 px-6 lg:px-24 bg-[#042F2E]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="font-serif italic font-medium text-4xl md:text-5xl text-sand-50 mb-4">
              Focus on the moment, not the memory.
            </h2>
            <p className="text-sand-300 max-w-2xl mx-auto text-lg">
              Wandra works quietly in the background, listening to your location, your pace, and the world around you to stitch together a perfect record of your adventures.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="group rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#14B8A6]/20 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Set your destination</h3>
              <p className="text-sand-300 leading-relaxed">
                Just tell Wandra where you're headed. Whether it's a cross-country drive or a weekend city break, your journal starts the moment you leave.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="group rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">We capture everything</h3>
              <p className="text-sand-300 leading-relaxed">
                As you travel, we record the important moments — crossing borders, changes in weather, breathtaking speeds, and quiet stops.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="group rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#6B9E72]/20 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-[#6B9E72]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Read your story</h3>
              <p className="text-sand-300 leading-relaxed">
                When you arrive, your raw travel data is transformed by AI into a beautifully written, evocative chapter of your personal travelogue.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative py-32 px-6 lg:px-24 bg-[#062C38]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-24"
          >
            <h2 className="font-serif font-medium text-4xl md:text-5xl text-sand-50 mb-4">
              How it works
            </h2>
          </motion.div>

          {/* Stepper Flow */}
          <div className="relative">
            {/* Dashed line connector (Desktop) */}
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] border-b-2 border-dashed border-teal-500/30 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#0F7490] border-4 border-[#062C38] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-teal-900/50">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-2 text-sand-50">Enter where you're going</h4>
                <p className="text-sm text-sand-300 max-w-[250px]">
                  Drop a pin or search for your destination. It's the only manual step you'll take.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#C4622D] border-4 border-[#062C38] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-amber-900/50">
                  2
                </div>
                <h4 className="text-xl font-semibold mb-2 text-sand-50">Travel freely</h4>
                <p className="text-sm text-sand-300 max-w-[250px]">
                  Put your phone away. Wandra tracks your GPS, weather shifts, and speed automatically.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#6B9E72] border-4 border-[#062C38] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-green-900/50">
                  3
                </div>
                <h4 className="text-xl font-semibold mb-2 text-sand-50">Your journal is ready</h4>
                <p className="text-sm text-sand-300 max-w-[250px]">
                  End your trip, and our AI writes your personal travelogue in seconds.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#042F2E] py-12 px-6 lg:px-24 border-t border-white/10 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <span className="text-xl" role="img" aria-label="Wandra compass logo">
            🧭
          </span>
          <span className="font-serif italic font-semibold text-xl tracking-wide">
            Wandra
          </span>
        </div>
        <p className="text-sand-400 font-medium mb-8">
          Your journey, written for you.
        </p>
        <p className="text-sand-500/60 text-sm">
          &copy; {new Date().getFullYear()} Wandra App. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
