"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MoreVertical, Edit3, Trash2, MapPin, Share2, Eye, Sun, Cloud, CloudRain, Clock, Calendar, Compass } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import dynamic from "next/dynamic";
import { supabase } from "@/services/supabaseService";
import { format } from "date-fns";
import { Journey, Moment } from "@/types";

// Dynamic import for Leaflet
const StaticMap = dynamic(() => import("@/components/StaticMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#E8E2D9] animate-pulse" />
});

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editableProse, setEditableProse] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Map modal
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Delete modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!journeyId) return;

    const loadData = async () => {
      try {
        const { data: jData, error: jErr } = await supabase
          .from("journeys")
          .select("*")
          .eq("id", journeyId)
          .single();
        
        if (jErr) throw jErr;
        setJourney(jData);
        setEditableProse(jData.journal_text || "");

        const { data: mData, error: mErr } = await supabase
          .from("moments")
          .select("*")
          .eq("journey_id", journeyId)
          .order("created_at", { ascending: true });
          
        if (mErr) throw mErr;
        setMoments(mData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [journeyId]);

  const handleSave = async () => {
    if (!journeyId) return;
    setIsSaving(true);
    try {
      await supabase
        .from("journeys")
        .update({ journal_text: editableProse })
        .eq("id", journeyId);
      setJourney(prev => prev ? { ...prev, journal_text: editableProse } : null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save journal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!journeyId) return;
    setIsDeleting(true);
    try {
      // Supabase cascade rules should handle moments, but if not we should delete those too
      await supabase.from("moments").delete().eq("journey_id", journeyId);
      await supabase.from("journeys").delete().eq("id", journeyId);
      router.push("/home");
      // Add a simple toast via context if implemented, else alert for now
      alert("Journey deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete journey.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#C4622D] border-t-transparent animate-spin" />
    </div>;
  }

  if (!journey) {
    return <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center text-[#1E1C1A]">
      <h2 className="font-serif text-[24px]">Journey not found.</h2>
      <button onClick={() => router.push("/home")} className="mt-4 text-[#C4622D] underline">Return to Library</button>
    </div>;
  }

  // Derived data
  const startedAtDate = new Date(journey.started_at);
  const endedAtDate = journey.ended_at ? new Date(journey.ended_at) : new Date();
  const durationMs = endedAtDate.getTime() - startedAtDate.getTime();
  const hrs = Math.floor(durationMs / 3600000);
  const mins = Math.floor((durationMs % 3600000) / 60000);
  
  const formattedDate = format(startedAtDate, "EEEE, d MMMM yyyy");
  const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  
  // Calculate total distance (rough approximation using Haversine)
  let totalDistanceKm = 0;
  const pathCoordinates: [number, number][] = moments
    .filter(m => m.lat && (m as any).lon)
    .map(m => [m.lat, (m as any).lon]);

  for (let i = 1; i < pathCoordinates.length; i++) {
    const lat1 = pathCoordinates[i-1][0] * Math.PI / 180;
    const lon1 = pathCoordinates[i-1][1] * Math.PI / 180;
    const lat2 = pathCoordinates[i][0] * Math.PI / 180;
    const lon2 = pathCoordinates[i][1] * Math.PI / 180;
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2),2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const r = 6371; // earth radius in km
    totalDistanceKm += c * r;
  }

  const distanceStr = totalDistanceKm > 0 ? `${totalDistanceKm.toFixed(1)} km` : '';
  const weatherSummary = moments.length > 0 ? `${(moments[0] as any).weather_condition || 'Clear'} · ${(moments[0] as any).weather_temp || 20}°C` : 'Clear · 20°C';

  // Prose formatting
  const paragraphs = (isEditing ? editableProse : (journey.journal_text || "")).split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1E1C1A] font-body pb-24 relative wandra-paper-texture">
      
      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#F9F7F4]/80 backdrop-blur-xl border-b border-[#E8E2D9] px-4 py-3 pt-safe flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white transition-colors border border-[#E8E2D9]">
          <ChevronLeft className="w-5 h-5 text-[#8C837A]" />
        </button>
        <h1 className="font-serif text-[16px] font-medium text-[#1E1C1A] truncate max-w-[200px]">
          {journey.destination_name}
        </h1>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white transition-colors border border-[#E8E2D9] outline-none">
              <MoreVertical className="w-5 h-5 text-[#8C837A]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[180px] bg-white rounded-xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E8E2D9] animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
              <DropdownMenu.Item onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#1E1C1A] rounded-lg hover:bg-[#F9F7F4] cursor-pointer outline-none">
                <Edit3 className="w-4 h-4 text-[#8C837A]" /> Edit Journal
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#1E1C1A] rounded-lg hover:bg-[#F9F7F4] cursor-pointer outline-none">
                <Share2 className="w-4 h-4 text-[#8C837A]" /> Share Story
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[#E8E2D9] my-1" />
              <DropdownMenu.Item onClick={() => setIsDeleteDialogOpen(true)} className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#C0392B] rounded-lg hover:bg-[#C0392B]/10 cursor-pointer outline-none font-medium">
                <Trash2 className="w-4 h-4" /> Delete Journey
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-[680px] mx-auto pt-6 px-4 md:px-8">
        
        {/* COVER AREA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-video rounded-2xl overflow-hidden relative mb-8 shadow-sm border border-[#E8E2D9]"
        >
          {(journey as any).cover_image_url ? (
            <>
              <img src={(journey as any).cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              {/* Amber duotone overlay */}
              <div className="absolute inset-0 bg-[#C4622D] mix-blend-color opacity-20" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A6B7C]/20 to-[#C4622D]/20 flex items-center justify-center">
              <Compass className="w-12 h-12 text-[#8C837A]/50" />
            </div>
          )}
        </motion.div>

        {/* METADATA */}
        <div className="mb-10 text-center">
          <h2 className="font-serif text-[36px] font-bold text-[#1E1C1A] mb-3 leading-tight">{journey.destination_name}</h2>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-outfit text-[14px] text-[#8C837A] tracking-wide">
              {formattedDate}
            </p>
            <div className="flex items-center justify-center gap-2 text-[13px] text-[#8C837A] font-medium">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{durationStr}</span>
              {distanceStr && <><span>·</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{distanceStr}</span></>}
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E8E2D9] text-[#1E1C1A] text-[12px] font-medium">
                {journey.mood_tag === 'good' ? '✨ Joyful' : journey.mood_tag === 'neutral' ? '🍃 Calm' : '🍂 Reflective'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8E2D9] text-[#1E1C1A] text-[12px] font-medium">
                <Cloud className="w-3.5 h-3.5 text-[#8C837A]" /> {weatherSummary}
              </span>
            </div>
          </div>
        </div>

        {/* DECORATIVE DIVIDER */}
        <div className="flex justify-center mb-10">
          <div className="w-10 h-[2px] bg-[#C4622D] rounded-full" />
        </div>

        {/* JOURNAL TEXT */}
        <div className="journal-prose text-[#2c2a29]">
          {isEditing ? (
            <textarea
              className="w-full min-h-[500px] bg-transparent outline-none border border-[#E8E2D9] rounded-xl p-6 font-serif text-[20px] leading-[1.8] resize-y focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D]/30 transition-all shadow-sm"
              value={editableProse}
              onChange={(e) => setEditableProse(e.target.value)}
              placeholder="Write your story..."
            />
          ) : (
            <div className="space-y-[1.5em]">
              <AnimatePresence>
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-serif text-[20px] leading-[1.8] text-justify md:text-left ${i === 0 ? "first-letter:float-left first-letter:text-[60px] first-letter:leading-[50px] first-letter:pr-3 first-letter:font-bold first-letter:text-[#1A6B7C]" : ""}`}
                  >
                    {p}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ─── TIMELINE ─── */}
        {moments.length > 0 && (
          <div className="mt-16 mb-12">
            <h3 className="font-serif italic text-[22px] text-[#1E1C1A] mb-6 flex items-center gap-3">
              Along the way <div className="h-px bg-[#E8E2D9] flex-1" />
            </h3>
            
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {moments.map((moment, idx) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.06, duration: 0.5 }}
                  className="shrink-0 w-[200px] bg-white border border-[#E8E2D9] rounded-2xl p-4 shadow-sm relative"
                >
                  {moment.is_key_moment && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#F59E0B]" />
                  )}
                  <div className="font-mono text-[11px] text-[#8C837A] mb-1">
                    {format(new Date((moment as any).created_at), "HH:mm")}
                  </div>
                  <h4 className="font-outfit text-[13px] font-bold text-[#1E1C1A] truncate mb-2">
                    {moment.place_name || "Unknown"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-outfit text-[12px] text-[#8C837A] mb-3">
                    <Sun className="w-3.5 h-3.5" /> {(moment as any).weather_condition || "Clear"}
                  </div>
                  {moment.photo_url && (
                    <div className="w-full h-[72px] rounded-lg overflow-hidden bg-[#F9F7F4]">
                      <img src={moment.photo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ROUTE MAP ─── */}
        {pathCoordinates.length > 0 && (
          <div className="mb-20">
            <h3 className="font-serif italic text-[22px] text-[#1E1C1A] mb-6 flex items-center gap-3">
              The Path <div className="h-px bg-[#E8E2D9] flex-1" />
            </h3>
            <div 
              className="w-full h-[240px] rounded-2xl overflow-hidden shadow-sm border border-[#E8E2D9] relative cursor-pointer"
              onClick={() => setIsMapExpanded(true)}
            >
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
              <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-[12px] font-medium text-[#1E1C1A] flex items-center gap-1.5 pointer-events-none">
                <Eye className="w-3.5 h-3.5" /> Tap to expand
              </div>
              <StaticMap pathHistory={pathCoordinates} interactive={false} />
            </div>
          </div>
        )}

      </main>

      {/* ─── STICKY BOTTOM ACTION BAR (Editing) ─── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-[#E8E2D9] px-4 py-4 pb-safe flex items-center justify-end gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          >
            <button 
              onClick={() => {
                setEditableProse(journey.journal_text || "");
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-medium text-[#8C837A] hover:bg-[#F9F7F4] transition-colors text-[15px]"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#C4622D] hover:bg-[#A44F24] text-white font-semibold text-[15px] shadow-[0_4px_12px_rgba(196,98,45,0.3)] transition-all flex items-center justify-center min-w-[100px]"
            >
              {isSaving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : "Save"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FULL MAP MODAL ─── */}
      <Dialog.Root open={isMapExpanded} onOpenChange={setIsMapExpanded}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed inset-4 md:inset-10 z-50 bg-[#0A1A20] rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="absolute top-4 left-4 z-20">
              <Dialog.Close className="w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-white text-[13px] font-medium shadow-lg">
              Route Overview
            </div>
            <div className="flex-1 w-full relative -z-0">
              {pathCoordinates.length > 0 && (
                <StaticMap pathHistory={pathCoordinates} interactive={true} />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 focus:outline-none border border-[#E8E2D9]">
            <div className="w-12 h-12 rounded-full bg-[#C0392B]/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-[#C0392B]" />
            </div>
            <Dialog.Title className="font-serif text-[22px] font-semibold text-[#1E1C1A] mb-2">Delete this journey?</Dialog.Title>
            <Dialog.Description className="text-outfit text-[15px] text-[#8C837A] mb-8 leading-relaxed">
              This will permanently erase your journal, photos, and route history. This memory will be gone forever.
            </Dialog.Description>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full h-12 rounded-xl bg-[#C0392B] text-white font-semibold text-[15px] hover:bg-[#A93226] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : "Delete Forever"}
              </button>
              <Dialog.Close asChild>
                <button 
                  disabled={isDeleting}
                  className="w-full h-12 rounded-xl bg-[#F9F7F4] text-[#1E1C1A] font-semibold text-[15px] hover:bg-[#E8E2D9] transition-colors disabled:opacity-50"
                >
                  Keep It
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
