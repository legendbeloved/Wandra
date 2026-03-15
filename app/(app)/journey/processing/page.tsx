"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles, RefreshCw, Edit3, Bookmark, AlertCircle, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/services/supabaseService";
import { streamJournalEntry } from "@/lib/gemini";
import { Journey, Moment } from "@/types";

const MOTIVATIONAL_MESSAGES = [
  "Collecting your waypoints...",
  "Weaving the weather into your story...",
  "Giving voice to your journey...",
  "Almost ready..."
];

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)]" />}>
      <ProcessingContent />
    </Suspense>
  );
}

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const journeyId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // AI Response State
  const [journalTitle, setJournalTitle] = useState("");
  const [journalProse, setJournalProse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProse, setEditableProse] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Journey Data State
  const [journeyData, setJourneyData] = useState<any>(null);
  const [momentsData, setMomentsData] = useState<any[]>([]);
  
  // UI States
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle motivational messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Initial Fetch & Generate
  useEffect(() => {
    if (!journeyId) {
      router.push("/home");
      return;
    }

    const fetchAndGenerate = async () => {
      try {
        setIsError(false);
        setIsLoading(true);
        
        // 1. Fetch Journey + Moments
        const { data: journey, error: jErr } = await supabase
          .from("journeys")
          .select("*")
          .eq("id", journeyId)
          .single();
        if (jErr || !journey) throw new Error("Journey not found");
        
        const { data: moments, error: mErr } = await supabase
          .from("moments")
          .select("*")
          .eq("journey_id", journeyId)
          .order("created_at", { ascending: true });
        
        setJourneyData(journey);
        setMomentsData(moments || []);

        // 2. Format Data for Gemini Prompt
        const formattedData = formatJourneyForPrompt(journey, moments || []);
        
        // 3. Start Streaming
        await generateJournal(journey, moments || []);
        
      } catch (err) {
        console.error(err);
        setIsError(true);
      }
    };

    fetchAndGenerate();
  }, [journeyId, router]);

  const formatJourneyForPrompt = (journey: any, moments: any[]) => {
    const started = new Date(journey.started_at);
    const ended = journey.ended_at ? new Date(journey.ended_at) : new Date();
    const durationMs = ended.getTime() - started.getTime();
    const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    const momentsStr = moments.map(m => {
      const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `At ${time} I was in ${m.place_name || 'an unknown place'}. The weather was ${m.weather_condition || 'clear'}. ${m.is_key_moment ? 'This was a significant stop.' : ''}`;
    }).join("\n");

    const firstWeather = moments[0]?.weather_condition || "clear";
    const lastWeather = moments[moments.length - 1]?.weather_condition || "clear";
    const photos = moments.filter(m => m.photo_url).length;

    return `Destination: ${journey.destination_name}
Journey started: ${started.toLocaleDateString()} at ${started.toLocaleTimeString()}
Journey ended: ${ended.toLocaleDateString()} at ${ended.toLocaleTimeString()}
Total duration: ${durationHrs} hours and ${durationMins} minutes
Opening note from the traveler: ${journey.note || 'None'}
Places passed through (in order):
${momentsStr}
Weather at departure: ${firstWeather}
Weather on arrival: ${lastWeather}
Photos taken: ${photos} photos during the journey
`;
  };

  const generateJournal = async (journey: Journey, moments: Moment[]) => {
    setIsLoading(true);
    setIsStreaming(true);
    setJournalTitle("A Journey to Remember"); 
    setJournalProse("");
    
    try {
      let accumulatedProse = "";
      const generator = streamJournalEntry(journey, moments);
      for await (const chunk of generator) {
        setIsLoading(false); 
        accumulatedProse += chunk;
        setJournalProse((prev) => prev + chunk);
      }
      
      setIsStreaming(false);

      // Save to Supabase
      if (journeyId) {
        await supabase
          .from("journeys")
          .update({ journal_text: accumulatedProse })
          .eq("id", journeyId);
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleRegenerate = () => {
    if (!journeyData) return;
    setIsRegenerating(true);
    generateJournal(journeyData, momentsData).then(() => setIsRegenerating(false));
  };

  const handleSave = async () => {
    if (!journeyId) return;
    setIsSaving(true);
    try {
      await supabase
        .from("journeys")
        .update({ journal_text: isEditing ? editableProse : journalProse })
        .eq("id", journeyId);
        
      router.push("/home");
    } catch (err) {
      console.error(err);
      alert("Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setEditableProse(journalProse);
    } else {
      setJournalProse(editableProse);
    }
    setIsEditing(!isEditing);
  };

  const renderProse = () => {
    if (isEditing) {
      return (
        <textarea
          value={editableProse}
          onChange={(e) => setEditableProse(e.target.value)}
          className="w-full min-h-[400px] bg-transparent outline-none border border-amber-900/10 rounded-xl p-4 font-serif text-[18px] leading-[1.8] text-[#1E1C1A] resize-none"
        />
      );
    }

    const paragraphs = journalProse.split('\n\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map((paragraph, idx) => (
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isStreaming ? 0 : 0.6 + (idx * 0.2), duration: 0.8 }}
        className="font-serif text-[18px] leading-[1.8] text-[#1E1C1A] mb-6"
      >
        {paragraph}
      </motion.p>
    ));
  };

  // ERROR STATE
  if (isError && !isStreaming && !journalProse) {
    return (
      <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] text-sand-50 font-body flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-[#C0392B] mx-auto mb-4" />
          <h2 className="font-serif text-[24px] mb-2">Something went wrong</h2>
          <p className="text-sand-300 text-[15px] mb-8">
            Your story couldn't be written right now. Your journey data is safe — tap to try again.
          </p>
          <button 
            onClick={handleRegenerate}
            className="w-full h-12 rounded-xl bg-[#C4622D] text-white font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] text-sand-50 font-body relative overflow-hidden flex flex-col pt-safe">
      
      <AnimatePresence>
        {isLoading && !journalProse && (
          <motion.div
            key="processing-state"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                className="w-20 h-20 rounded-full border border-sand-50/20 flex items-center justify-center bg-white/5 backdrop-blur-md"
              >
                <Compass className="w-8 h-8 text-sand-50" />
              </motion.div>
            </div>

            <h2 className="font-serif italic text-[28px] mb-2 relative z-10 wandra-text-glow">
              Writing your story...
            </h2>
            <p className="text-sand-300 text-[15px] mb-12">
              This takes just a moment.
            </p>

            {/* Progress Dots */}
            <div className="flex gap-3 mb-12">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: i <= messageIndex ? 1 : 0.3 }}
                  className="w-2 h-2 rounded-full bg-amber-400"
                />
              ))}
            </div>

            <div className="h-6 relative w-full flex justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="text-sand-200 text-sm absolute"
                >
                  {MOTIVATIONAL_MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(!isLoading || journalProse) && (
          <motion.div
            key="journal-state"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }} // Journal easing
            className="flex-1 flex flex-col p-4 md:p-6 lg:max-w-3xl mx-auto w-full z-10 h-full overflow-hidden"
          >
            {/* ─── JOURNAL CARD ─── */}
            <div className="flex-1 bg-[#F9F7F4] rounded-[24px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_12px_40px_rgba(0,0,0,0.3)] border border-[#E8E2D9] overflow-hidden flex flex-col relative wandra-paper-texture">
              
              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center gap-2 text-amber-600/60 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Generating...
                </div>
              )}

              <div className="p-6 md:p-10 flex-1 overflow-y-auto wandra-scrollbar scroll-smooth">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-serif italic text-[13px] text-[#8C837A] mb-1">
                      {journeyData?.destination_name || "Destination"}
                    </h3>
                    <p className="text-outfit text-[12px] text-[#A89E92] uppercase tracking-wider font-medium">
                      {journeyData?.started_at ? new Date(journeyData.started_at).toLocaleDateString() : "Today"} • 
                      {momentsData.length} stops
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E8E2D9] flex flex-col items-center justify-center text-lg">
                    {journeyData?.mood_tag && journeyData.mood_tag === 'good' ? '☀️' : '🍃'}
                  </div>
                </div>

                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="font-serif font-bold text-[24px] text-[#1E1C1A] mb-6 leading-tight"
                >
                  {journalTitle || "A Journey to Remember"}
                </motion.h1>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4622D]/30 to-transparent mb-8" />

                {/* Prose */}
                <div className="relative">
                  {renderProse()}
                </div>
              </div>

              {/* Moments Strip (Bottom of card) */}
              <div className="bg-[#1E1C1A]/5 border-t border-[#1E1C1A]/5 p-4 overflow-x-auto no-scrollbar pb-6 rounded-b-[24px]">
                <div className="flex gap-3 min-w-max">
                  {momentsData.filter(m => m.photo_url || m.is_key_moment).map((m, idx) => (
                    <motion.div 
                      key={m.id || idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: isStreaming ? 0 : 1 + (idx * 0.1) }}
                      className="w-24 h-24 rounded-xl overflow-hidden shadow-sm relative border border-white/50 bg-[#E8E2D9]"
                    >
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="Moment" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center">
                          <MapPin size={16} className="text-[#C4622D] mb-1 opacity-60" />
                          <span className="text-[10px] text-[#8C837A] font-medium leading-tight truncate w-full">
                            {m.place_name?.split(',')[0]}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {momentsData.length === 0 && (
                    <div className="text-[12px] text-[#8C837A]/60 italic py-8 px-4 w-full text-center">
                      No key moments documented.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ─── ACTION ROW ─── */}
            <div className="flex items-center gap-3 mt-4 shrink-0 px-2 lg:px-0 pb-safe">
              <button
                onClick={handleSave}
                disabled={isStreaming || isRegenerating || isSaving}
                className="flex-1 h-[52px] bg-[#C4622D] hover:bg-[#A44F24] rounded-xl text-white font-semibold text-[15px] shadow-[0_8px_24px_rgba(196,98,45,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className="w-5 h-5" />}
                Save Journal
              </button>
              
              <button
                onClick={handleRegenerate}
                disabled={isStreaming || isRegenerating || isSaving}
                className="w-[52px] h-[52px] rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all disabled:opacity-50"
                aria-label="Regenerate"
              >
                <RefreshCw className={`w-5 h-5 ${isRegenerating ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={toggleEdit}
                disabled={isStreaming || isRegenerating || isSaving}
                className={`flex items-center justify-center h-[52px] px-5 rounded-xl border transition-all text-[15px] font-medium ${isEditing ? 'bg-white text-[#0A1A20] border-transparent' : 'bg-transparent text-white border-white/20 hover:bg-white/10'}`}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
