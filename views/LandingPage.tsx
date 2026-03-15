import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { MapPin, Sparkles, BookOpen, ChevronDown, ArrowRight, Compass, Globe } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

/* ─── Floating Journal Card ─── */
const FloatingCard = ({ 
  delay, x, y, rotation, children, className = '' 
}: { 
  delay: number; x: number; y: number; rotation: number; children: React.ReactNode; className?: string 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ 
      opacity: [0, 0.6, 0.6],
      y: [y + 40, y, y - 15, y],
      x: [x, x + 8, x - 5, x],
      rotate: [rotation, rotation + 2, rotation - 1, rotation],
    }}
    transition={{ 
      duration: 12, 
      delay, 
      repeat: Infinity, 
      repeatType: 'mirror',
      ease: 'linear'
    }}
    className={`absolute pointer-events-none ${className}`}
  >
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] p-6 shadow-2xl shadow-black/20 w-56">
      {children}
    </div>
  </motion.div>
);

/* ─── Section Reveal Wrapper ─── */
const Reveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon: Icon, title, description, color, delay }: {
  icon: any; title: string; description: string; color: string; delay: number;
}) => {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sage: 'bg-sage-500/10 text-sage-500 border-sage-500/20',
  };
  return (
    <Reveal delay={delay}>
      <div className="group relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] p-8 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 hover:border-white/10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-3">{title}</h3>
        <p className="text-neutral-500 leading-relaxed font-medium text-sm">{description}</p>
      </div>
    </Reveal>
  );
};

/* ─── Step Item ─── */
const StepItem = ({ number, title, description, delay }: {
  number: number; title: string; description: string; delay: number;
}) => (
  <Reveal delay={delay} className="flex-1 text-center relative">
    <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-5">
      <span className="text-2xl font-serif font-bold text-teal-400">{number}</span>
    </div>
    <h4 className="text-lg font-bold text-neutral-800 mb-2">{title}</h4>
    <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-[200px] mx-auto">{description}</p>
  </Reveal>
);

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0D1117] text-neutral-600 overflow-x-hidden">

      {/* ━━━ HERO ━━━ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#042F2E] via-[#0A9484]/60 to-[#D97706]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent" />
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* Liquid Blobs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-teal-500/10 blur-[180px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-amber-500/8 blur-[150px] rounded-full"
          />
        </div>

        {/* Floating Journal Cards */}
        <div className="absolute inset-0 z-[1] hidden md:block">
          <FloatingCard delay={0} x={-80} y={120} rotation={-6} className="top-[10%] left-[5%]">
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/70">March 2025</div>
              <div className="font-serif text-sm text-neutral-600 italic leading-relaxed">"The train pulled into Kyoto at golden hour…"</div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400/70 rounded-full text-[8px] font-bold uppercase">Calm</span>
              </div>
            </div>
          </FloatingCard>
          <FloatingCard delay={2} x={60} y={80} rotation={4} className="top-[15%] right-[8%]">
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400/70">January 2025</div>
              <div className="font-serif text-sm text-neutral-600 italic leading-relaxed">"The cobblestones of Lisbon sang under the rain…"</div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400/70 rounded-full text-[8px] font-bold uppercase">Reflective</span>
              </div>
            </div>
          </FloatingCard>
          <FloatingCard delay={4} x={-40} y={-30} rotation={3} className="bottom-[25%] left-[12%]">
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-sage-500/70">November 2024</div>
              <div className="font-serif text-sm text-neutral-600 italic leading-relaxed">"Snow-capped peaks greeted us at dawn…"</div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-white/5 text-neutral-500 rounded-full text-[8px] font-bold uppercase">Adventurous</span>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Hero Content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="text-5xl">🧭</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.05] tracking-tight">
              <span className="font-light italic text-teal-300/90">Your journey,</span>
              <br />
              <span className="font-bold text-white">written for you.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-neutral-500 font-medium max-w-xl mx-auto leading-relaxed"
          >
            Wandra captures every mile automatically. No writing required. Just travel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg rounded-[2rem] shadow-2xl shadow-amber-900/30 transition-colors flex items-center gap-3 relative overflow-hidden group"
            >
              {/* Pulse ring */}
              <motion.span
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-[2rem] border-2 border-amber-400"
              />
              Start for Free
              <ArrowRight size={20} />
            </motion.button>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-neutral-600 hover:text-white hover:border-white/20 font-bold rounded-[2rem] transition-all text-sm flex items-center gap-2"
            >
              See How It Works
              <ChevronDown size={16} />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={24} className="text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          <Reveal className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Effortless by design</p>
            <h2 className="text-4xl sm:text-5xl font-serif font-medium text-neutral-800 tracking-tight">
              Three things. That's it.
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto font-medium">
              Wandra does the heavy lifting so you stay present in the moment.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={MapPin}
              title="Set your destination"
              description="Tell Wandra where you're headed. That's the only input required. One tap, and the journey begins."
              color="teal"
              delay={0}
            />
            <FeatureCard
              icon={Sparkles}
              title="We capture everything"
              description="GPS waypoints, local weather, time of day, place names — all captured silently in the background as you travel."
              color="amber"
              delay={0.15}
            />
            <FeatureCard
              icon={BookOpen}
              title="Read your story"
              description="When you arrive, AI composes a warm, personal journal entry. Like a letter from yourself at the height of the trip."
              color="sage"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="relative py-32 px-6">
        {/* Ambient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-teal-600/4 blur-[200px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-20 relative z-10">
          <Reveal className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Your first journey</p>
            <h2 className="text-4xl sm:text-5xl font-serif font-medium text-neutral-800 tracking-tight">
              How Wandra works
            </h2>
          </Reveal>

          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-4 relative">
            {/* Dashed connector line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px border-t-2 border-dashed border-white/10" />

            <StepItem
              number={1}
              title="Enter your destination"
              description="Type where you're going — a city, a trail, a café across town."
              delay={0}
            />
            <StepItem
              number={2}
              title="Travel freely"
              description="Live your journey. Wandra silently collects moments in the background."
              delay={0.15}
            />
            <StepItem
              number={3}
              title="Your journal is ready"
              description="Arrive, and find a beautiful, AI-written story waiting for you."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ━━━ PULL QUOTE ━━━ */}
      <section className="py-24 px-6">
        <Reveal className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-20 h-20 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] flex items-center justify-center mx-auto text-4xl">
            ✨
          </div>
          <blockquote className="text-3xl sm:text-4xl font-serif italic text-neutral-700 leading-relaxed">
            "Every journey has a story. <br className="hidden sm:block" />
            <span className="text-teal-400">Wandra writes yours.</span>"
          </blockquote>
        </Reveal>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="py-24 px-6">
        <Reveal className="max-w-lg mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-serif font-medium text-neutral-800 tracking-tight">
            Ready to wander?
          </h2>
          <p className="text-neutral-500 font-medium text-lg">
            Your first journal entry is waiting.
          </p>
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg rounded-[2rem] shadow-2xl shadow-amber-900/30 transition-colors inline-flex items-center gap-3 mx-auto"
          >
            Start for Free
            <ArrowRight size={20} />
          </motion.button>
        </Reveal>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <span className="text-2xl font-serif font-medium text-neutral-700">Wandra</span>
          </div>
          <p className="text-neutral-400 text-xs font-medium italic">Your journey, written for you.</p>
          <p className="text-neutral-400/50 text-[10px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Wandra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
