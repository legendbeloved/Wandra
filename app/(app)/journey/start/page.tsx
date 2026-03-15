"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Compass, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/services/supabaseService";
import { useJourneyStore } from "@/store/journeyStore";

interface Suggestion {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
}

export default function JourneyStartPage() {
  const router = useRouter();
  const startJourneyAction = useJourneyStore((state) => state.startJourney);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Suggestion | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [note, setNote] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions from Nominatim
  useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedQuery.trim() || selectedDestination) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      setSearchError("");

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedQuery
          )}&format=json&limit=5`
        );
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        setSuggestions(data);
        if (data.length === 0) {
          setSearchError("No places found. Try a different search.");
        }
      } catch (err) {
        setSearchError("Search isn't working right now. Type your destination and continue.");
      } finally {
        setIsSearching(false);
      }
    };

    searchPlaces();
  }, [debouncedQuery]);

  const handleSelect = (place: Suggestion) => {
    setSelectedDestination(place);
    setQuery(place.display_name.split(",")[0]); // Set just the main name in input
    setSuggestions([]);
  };

  const handleClear = () => {
    setSelectedDestination(null);
    setQuery("");
    inputRef.current?.focus();
  };

  const startJourney = async () => {
    if (!selectedDestination && !query.trim()) return;
    
    setIsStarting(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        router.push("/login");
        return;
      }

      // Create journey entry natively in Supabase
      const destinationName = selectedDestination ? selectedDestination.display_name.split(",")[0] : query;
      
      const { data, error } = await supabase
        .from("journeys")
        .insert({
          user_id: userId,
          destination_name: destinationName,
          // note: note -> Optional if supported by backend interface
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Save into Zustand for tracking state globally
      startJourneyAction({
        name: destinationName,
        lat: selectedDestination ? parseFloat(selectedDestination.lat) : 0,
        lng: selectedDestination ? parseFloat(selectedDestination.lon) : 0
      }, data.id);
      
      router.push("/journey/active");
    } catch (err: any) {
      console.error(err);
      alert("Failed to start journey. Please try again.");
      setIsStarting(false);
    }
  };

  const formatPlaceName = (displayName: string) => {
    const parts = displayName.split(",");
    const main = parts[0];
    const rest = parts.slice(1).join(",").trim();
    return { main, rest };
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] text-sand-50 font-body relative overflow-hidden">
      
      {/* ─── AMBIENT BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-teal-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[25rem] h-[25rem] rounded-full bg-amber-500/10 blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 pt-safe h-full flex flex-col min-h-screen">
        
        {/* ─── HEADER ─── */}
        <header className="flex items-center mb-10">
          <Link 
            href="/home"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-md"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1"
        >
          <div className="mb-8">
            <h1 className="font-serif text-[28px] font-medium leading-tight mb-2">
              Where are you headed?
            </h1>
            <p className="text-[#DAE2E5] text-[15px]">
              Enter your destination to begin.
            </p>
          </div>

          {/* ─── SEARCH INPUT ─── */}
          <div className="relative z-20">
            <div className={`relative flex items-center bg-white/[0.06] border transition-all duration-200 backdrop-blur-xl rounded-[14px] ${selectedDestination ? "border-[#35CAAB] shadow-[0_0_0_2px_rgba(53,202,171,0.2)]" : "border-white/15 focus-within:border-white/30 focus-within:bg-white/10"}`}>
              <div className="pl-4 pr-3 text-sand-300">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedDestination) setSelectedDestination(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggestions.length > 0 && !selectedDestination) {
                    handleSelect(suggestions[0]);
                  }
                }}
                placeholder="Search destination..."
                className="w-full h-[52px] bg-transparent outline-none text-[16px] text-white placeholder:text-sand-400/60"
                autoFocus
              />
              {query && (
                <button 
                  onClick={handleClear}
                  className="px-4 text-sand-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* ─── SUGGESTIONS DROPDOWN ─── */}
            <AnimatePresence>
              {(suggestions.length > 0 || isSearching || searchError) && !selectedDestination && query && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#082229]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.4)] z-50 py-2"
                >
                  {isSearching ? (
                    <div className="px-5 py-4 flex items-center gap-3 text-sand-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </div>
                  ) : searchError ? (
                    <div className="px-5 py-4 text-[#DAE2E5] text-sm">
                      {searchError}
                    </div>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto wandra-scrollbar">
                      {suggestions.map((place) => {
                        const { main, rest } = formatPlaceName(place.display_name);
                        return (
                          <li key={place.place_id}>
                            <button
                              onClick={() => handleSelect(place)}
                              className="w-full text-left px-5 py-3 hover:bg-white/[0.08] transition-colors focus:bg-white/[0.08] focus:outline-none flex flex-col"
                            >
                              <span className="font-semibold text-white truncate max-w-full">
                                {main}
                              </span>
                              {rest && (
                                <span className="text-[13px] text-sand-400 truncate max-w-full mt-0.5">
                                  {rest}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── OPTIONAL NOTE ─── */}
          <AnimatePresence>
            {(selectedDestination || (query && !suggestions.length && !isSearching)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 overflow-hidden"
              >
                <div className="bg-white/[0.04] border border-white/10 rounded-[14px] p-4 backdrop-blur-md">
                  <label className="block text-[13px] font-medium text-[#DAE2E5] mb-2 uppercase tracking-wide">
                    Add a note before you go <span className="text-sand-500 normal-case">(Optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={140}
                    rows={3}
                    placeholder="How are you feeling about this trip?"
                    className="w-full bg-transparent outline-none text-[15px] text-white placeholder:text-sand-400/50 resize-none"
                  />
                  <div className="text-right text-xs text-sand-500 mt-2">
                    {note.length}/140
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* ─── START JOURNEY BUTTON (Floats at bottom) ─── */}
        <div className="mt-8">
          <AnimatePresence>
            {(selectedDestination || (query.length > 2 && suggestions.length === 0 && !isSearching)) && (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                onClick={startJourney}
                disabled={isStarting}
                className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#C4622D] hover:bg-[#A44F24] text-white font-semibold text-[16px] shadow-[0_8px_32px_rgba(196,98,45,0.40)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Compass className="w-5 h-5" />
                )}
                <span>Begin Journey</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
