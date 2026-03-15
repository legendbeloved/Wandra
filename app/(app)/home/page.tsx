"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Compass, User, BookOpen, Navigation, Map } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/services/supabaseService";
import { JournalCard, JournalCardSkeleton } from "@/components/ui/JournalCard";
import { Journey } from "@/types";

export default function HomeLibraryPage() {
  
  // ─── DATA FETCHING ───
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: journeys, isLoading } = useQuery<Journey[]>({
    queryKey: ["journeys", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFAF5] font-body selection:bg-teal-500/30 overflow-hidden pb-24">
      
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[rgba(253,250,245,0.92)] backdrop-blur-xl border-b border-[#EDE9E4] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#0F7490]/10 flex items-center justify-center text-[#0F7490]">
                <Compass className="w-6 h-6" />
             </div>
             <div>
                <h1 className="font-serif font-semibold text-2xl text-[#1E1C1A] leading-none">
                  My Journeys
                </h1>
                <p className="text-sm font-medium text-[#8A8078] mt-1">
                  {isLoading ? "Loading..." : `${journeys?.length || 0} entries`}
                </p>
             </div>
          </div>
          
          <Link 
            href="/profile" 
            className="w-10 h-10 rounded-full bg-[#EDE9E4] flex items-center justify-center text-[#534D47] hover:bg-[#DAD4CB] transition-colors focus-visible:ring-2 focus-visible:ring-[#0F7490] focus-visible:ring-offset-2"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
           // LOADING STATE 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <JournalCardSkeleton key={i} index={i} />
              ))}
           </div>
        ) : journeys && journeys.length > 0 ? (
           // LIBRARY GRID 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journeys.map((journey, i) => (
                <JournalCard key={journey.id} journey={journey} index={i} />
              ))}
           </div>
        ) : (
           // EMPTY STATE
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
             className="flex flex-col items-center justify-center text-center py-24 px-4 max-w-lg mx-auto"
           >
             <div className="w-48 h-48 mb-8 relative">
               <div className="absolute inset-0 bg-[#C4622D]/10 rounded-full blur-2xl" />
               <div className="w-full h-full rounded-full border border-[#C2BAB0] bg-[#F8F0E3] flex items-center justify-center relative overflow-hidden shadow-inner">
                  <Map className="w-16 h-16 text-[#A68552]" />
               </div>
             </div>
             
             <h2 className="font-serif italic text-4xl text-[#1E1C1A] mb-4">
                Your first journey is waiting.
             </h2>
             <p className="text-[#534D47] text-lg leading-relaxed mb-8">
                Tell us where you're headed and we'll take it from here. Wandra will automatically document your travels.
             </p>
             
             <Link 
               href="/journey/start"
               className="inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-[#C4622D] text-white font-semibold shadow-[0_4px_16px_rgba(196,98,45,0.32)] hover:bg-[#A44F24] hover:shadow-[0_6px_24px_rgba(196,98,45,0.40)] hover:-translate-y-1 transition-all duration-200"
             >
               Start a Journey
             </Link>
           </motion.div>
        )}
      </main>

      {/* ─── FLOATING ACTION BUTTON (FAB) ─── */}
      <Link href="/journey/start">
        <div className="fixed bottom-24 md:bottom-8 right-6 z-50 group">
          <motion.div 
            animate={{ scale: [1, 1.12, 1] }} 
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#C4622D] rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"
          />
          <button
            className="relative w-14 h-14 rounded-full bg-[#C4622D] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(196,98,45,0.40)] hover:scale-105 transition-transform"
            aria-label="Start a Journey"
          >
            <Compass className="w-6 h-6" />
          </button>
        </div>
      </Link>

      {/* ─── BOTTOM NAVIGATION (MOBILE ONLY) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[rgba(253,250,245,0.88)] backdrop-blur-xl border-t border-[#EDE9E4] pb-safe">
        <div className="flex items-center justify-around h-16 px-4">
          <Link href="/home" className="flex flex-col items-center gap-1 text-[#0F7490]">
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">Library</span>
          </Link>
          <Link href="/journey/start" className="flex flex-col items-center gap-1 text-[#C2BAB0] hover:text-[#8A8078] transition-colors">
            <Navigation className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">Travel</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#C2BAB0] hover:text-[#8A8078] transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
