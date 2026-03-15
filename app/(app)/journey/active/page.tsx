"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, WifiOff } from "lucide-react";
import dynamic from "next/dynamic";
import { useJourneyStore } from "@/store/journeyStore";
import { supabase } from "@/services/supabaseService";
import { useGeolocation, GeoLocation } from "@/hooks/useGeolocation";
import { saveMomentOffline } from "@/utils/offlineSync";
import { Journey, Moment } from "@/types";
import { formatDistanceToNow } from "date-fns";

// Dynamically import Leaflet to avoid SSR window errors
const ActiveMap = dynamic(() => import("@/components/ActiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0A1A20] animate-pulse" />
});

export default function ActiveJourneyPage() {
  const router = useRouter();
  const activeJourneyId = useJourneyStore((state) => state.activeJourneyId);
  const setComplete = useJourneyStore((state) => state.setComplete);
  const resetJourney = useJourneyStore((state) => state.resetJourney);

  const { location, error: geoError, getCurrentLocation } = useGeolocation();
  
  const [journey, setJourney] = useState<Journey | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [path, setPath] = useState<[number, number][]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSavedLoc, setLastSavedLoc] = useState<GeoLocation | null>(null);
  const [shouldCenterMap, setShouldCenterMap] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Make sure we have a journey
  useEffect(() => {
    if (!activeJourneyId) {
      router.push("/home");
      return;
    }

    const loadJourney = async () => {
      const { data } = await supabase
        .from("journeys")
        .select("*")
        .eq("id", activeJourneyId)
        .single();
      if (data) setJourney(data);

      const { data: momentsData } = await supabase
        .from("moments")
        .select("*")
        .eq("journey_id", activeJourneyId)
        .order("captured_at", { ascending: true });
        
      if (momentsData) {
        setMoments(momentsData);
        setPath(momentsData.filter(m => m.lat && m.lng).map((m: Moment) => [m.lat, m.lng] as [number, number]));
      }
    };
    loadJourney();
  }, [activeJourneyId, router]);

  // Handle path drawing and auto-center
  useEffect(() => {
    if (location) {
      setPath(prev => {
        const newPath = [...prev, [location.lat, location.lng] as [number, number]];
        return newPath;
      });
    }
  }, [location]);

  // Center every 30 seconds
  useEffect(() => {
    const centerInterval = setInterval(() => {
      setShouldCenterMap(true);
      setTimeout(() => setShouldCenterMap(false), 2000);
    }, 30000);
    return () => clearInterval(centerInterval);
  }, []);

  // Logic to save moment every 5 mins or based on heuristics
  useEffect(() => {
    const saveMoment = async () => {
      try {
        const curLoc = await getCurrentLocation();
        
        // Reverse Geocode
        let placeName = "Unknown location";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${curLoc.lat}&lon=${curLoc.lng}&format=json`);
          if (res.ok) {
            const geodata = await res.json();
            placeName = geodata.address?.city || geodata.address?.town || geodata.address?.village || geodata.name || placeName;
          }
        } catch (e) {}

        // Weather Mock
        const weatherCond = "Clear";
        const weatherTemp = 22;

        // Is Key Moment? (If user stayed close to last saved loc for 10mins -> rough approximation here)
        let isKeyMoment = false;
        if (lastSavedLoc) {
          const dLat = Math.abs(curLoc.lat - lastSavedLoc.lat);
          const dLng = Math.abs(curLoc.lng - lastSavedLoc.lng);
          if (dLat < 0.001 && dLng < 0.001) isKeyMoment = true;
        }

        const newMoment = {
          journey_id: activeJourneyId!,
          user_id: journey?.user_id!,
          lat: curLoc.lat,
          lng: curLoc.lng,
          place_name: placeName,
          weather_condition: weatherCond,
          weather_temp: weatherTemp,
          is_key_moment: isKeyMoment,
          captured_at: new Date().toISOString()
        };

        if (isOffline) {
          await saveMomentOffline(newMoment);
        } else {
          const { data } = await supabase.from("moments").insert(newMoment).select().single();
          if (data) setMoments(prev => [...prev, data]);
        }
        setLastSavedLoc(curLoc);
      } catch (err) {
        console.error("Geotracking interval failed", err);
      }
    };

    // Fast track for prototype: 1 minute instead of 5 minutes just so it runs in testing
    const interval = setInterval(saveMoment, 60000);
    return () => clearInterval(interval);
  }, [activeJourneyId, journey, isOffline, lastSavedLoc, getCurrentLocation]);

  const handleManualCapture = async (file: File) => {
    // In a real app we'd upload this file to Supabase storage, get URL
    const fakePhotoUrl = URL.createObjectURL(file);
    
    try {
      const curLoc = location || await getCurrentLocation();
      let placeName = "Captured location";
      
      const newMoment = {
        journey_id: activeJourneyId!,
        user_id: journey?.user_id!,
        lat: curLoc.lat,
        lng: curLoc.lng,
        place_name: placeName,
        photo_url: fakePhotoUrl,
        is_key_moment: true, // Manual photos are key moments
        captured_at: new Date().toISOString()
      };

      if (isOffline) {
        await saveMomentOffline(newMoment);
        // Show offline success toast...
      } else {
        const { data } = await supabase.from("moments").insert(newMoment).select().single();
        if (data) {
           setMoments(prev => [...prev, data]);
        }
      }
    } catch(err) {
       console.error(err);
    }
  };

  const endJourney = async () => {
    if (!activeJourneyId) return;
    try {
      if (!isOffline) {
        await supabase
          .from("journeys")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", activeJourneyId);
      }
      setComplete();
      router.push(`/journey/processing?id=${activeJourneyId}`);
    } catch(err) {
      console.error(err);
    }
  };

  if (!journey) return <div className="min-h-screen bg-[#0A1A20] flex items-center justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-teal-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0A1A20] text-sand-50 font-body relative overflow-hidden flex flex-col">
      
      {/* Aurora Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0F7490] rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -45, 0] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#14B8A6]/30 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {isOffline && (
        <div className="bg-amber-500 text-amber-950 text-xs font-semibold py-1 px-4 flex justify-center items-center gap-2 z-50">
          <WifiOff className="w-3 h-3" /> Offline — saving locally
        </div>
      )}

      {/* ─── TOP STATUS BAR ─── */}
      <header className="relative z-20 px-6 pt-safe py-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium leading-none mb-1">
            Journey to {journey.destination_name}
          </h1>
          <p className="text-[13px] text-sand-300">
            Started {formatDistanceToNow(new Date(journey.started_at))} ago
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#062C38] border border-teal-500/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg shadow-teal-900/20">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse ring-2 ring-teal-400/30" />
          <span className="text-xs font-medium text-teal-50 tracking-wide uppercase">Tracking</span>
        </div>
      </header>

      {/* ─── MAP AREA ─── */}
      <div className="relative z-10 w-full h-[45vh] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-y border-white/5">
        <ActiveMap 
          currentLocation={location} 
          pathHistory={path} 
          shouldCenter={shouldCenterMap} 
        />
      </div>

      {/* ─── MOMENTS CAPTURED ─── */}
      <div className="relative z-20 flex-1 flex flex-col bg-white/[0.02] backdrop-blur-[40px] pt-6 overflow-hidden">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-white">Captured so far</h2>
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-teal-400 backdrop-blur-md">
            {moments.length}
          </span>
        </div>
        
        {/* Horizontal Mini Cards List */}
        <div className="w-full overflow-x-auto no-scrollbar px-6 pb-4">
          <div className="flex gap-4 min-w-max">
            <AnimatePresence>
              {moments.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-48 bg-[#041E27]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-lg backdrop-blur-md"
                >
                  <div className="flex justify-between items-center text-sand-400">
                    <span className="font-mono text-[11px]">{new Date(m.captured_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-[14px]">⛅</span>
                  </div>
                  <h3 className="text-[13px] font-medium text-white truncate">{m.place_name || "En route"}</h3>
                  {m.photo_url && (
                    <div className="mt-1 w-full h-20 rounded-lg overflow-hidden border border-white/10">
                      <img src={m.photo_url} alt="Moment" className="w-full h-full object-cover" />
                    </div>
                  )}
                </motion.div>
              ))}
              {moments.length === 0 && (
                <div className="w-48 h-20 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-[13px] text-sand-500 italic">
                  Waiting for first moment...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── BOTTOM CONTROLS ─── */}
        <div className="mt-auto pb-safe px-6 pb-6 pt-4 bg-gradient-to-t from-[#0A1A20] via-[#0A1A20]/80 to-transparent flex flex-col items-center gap-6">
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-8 bg-[#062C38] text-white text-[11px] font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
              Capture this moment
            </span>
          </button>
          {/* Native PWA Camera Access */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleManualCapture(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={endJourney}
            className="w-full h-[56px] flex items-center justify-center gap-2 rounded-2xl bg-[#C4622D] hover:bg-[#A44F24] text-white font-semibold text-[17px] shadow-[0_8px_32px_rgba(196,98,45,0.50)] transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            I've Arrived
          </button>
        </div>
      </div>
    </div>
  );
}
