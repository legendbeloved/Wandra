import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, CheckCircle2, Loader2, X, Cloud, Sun, CloudRain, Wind, WifiOff, Map as MapIcon, Sparkles, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Journey, Moment } from '../types';
import { WeatherService } from '../services/weatherService';
import { GeminiService } from '../services/geminiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { MapView } from '../components/MapView';
import { formatJourneyDuration } from '../lib/dateUtils';
import { SupabaseService } from '../services/supabaseService';

interface JourneyViewProps {
  journey: Journey | null;
  onEndJourney: (journey: Journey) => void;
  onCancel: () => void;
}

export const JourneyView = ({ journey, onEndJourney, onCancel }: JourneyViewProps) => {
  const isOnline = useOnlineStatus();
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(journey);
  const [viewMode, setViewMode] = useState<'atmosphere' | 'map'>('atmosphere');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tracking your path...');
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [duration, setDuration] = useState<string>('Just started');
  const [selectedStyle, setSelectedStyle] = useState<'poetic' | 'descriptive' | 'brief'>('poetic');
  
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (journey && journey.status === 'active') {
      startTracking();
      
      const updateDuration = () => {
        setDuration(formatJourneyDuration(journey.started_at));
      };
      updateDuration();
      const durationInterval = setInterval(updateDuration, 60000);
      return () => {
        stopTracking();
        clearInterval(durationInterval);
      };
    }
  }, [journey]);

  const startTracking = () => {
    captureMoment();
    trackingInterval.current = setInterval(captureMoment, 30000);
  };

  const stopTracking = () => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
    }
  };

  const captureMoment = async (isManual = false) => {
    if (!navigator.geolocation || !currentJourney) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      const hasMoved = !lastLocation || 
        Math.abs(latitude - lastLocation.lat) > 0.001 || 
        Math.abs(longitude - lastLocation.lng) > 0.001;

      if (!hasMoved && !isManual) return;

      try {
        const weather = await WeatherService.getWeather(latitude, longitude);
        const placeName = await WeatherService.getPlaceName(latitude, longitude);

        const newMoment = await SupabaseService.addMoment({
          journey_id: currentJourney.id,
          user_id: currentJourney.user_id,
          timestamp: new Date().toISOString(),
          lat: latitude,
          lng: longitude,
          place_name: placeName,
          weather_condition: weather.condition,
          weather_icon: weather.icon,
          is_key_moment: isManual,
        });

        setLastLocation({ lat: latitude, lng: longitude });
        setCurrentJourney(prev => {
          if (!prev) return null;
          return {
            ...prev,
            moments: [...(prev.moments || []), newMoment]
          };
        });
      } catch (error) {
        console.error("Failed to capture moment:", error);
      }
    });
  };

  const handleEndJourney = async () => {
    if (!currentJourney) return;
    
    setIsProcessing(true);
    setStatusMessage('Composing your story...');
    
    try {
      const journalText = await GeminiService.generateJournalEntry(currentJourney, selectedStyle);
      const moodTag = await GeminiService.suggestMoodTag(currentJourney);
      
      const completedJourney: Journey = {
        ...currentJourney,
        status: 'completed',
        ended_at: new Date().toISOString(),
        journal_text: journalText,
        mood_tag: moodTag,
      };
      
      onEndJourney(completedJourney);
    } catch (error) {
      console.error("Failed to end journey:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentJourney) return null;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-medium text-sand-50">Active Journey</h2>
            {!isOnline && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <WifiOff size={10} /> Offline
              </span>
            )}
          </div>
          <p className="text-sand-400 flex items-center gap-1 text-sm">
            <MapPin size={14} /> to {currentJourney.destination_name}
          </p>
          <p className="text-amber-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            <Clock size={12} /> {duration}
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-full text-sand-500 transition-colors"
        >
          <X size={20} />
        </button>
      </header>

      <div className="relative aspect-square bg-white/5 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
        <AnimatePresence mode="wait">
          {viewMode === 'atmosphere' ? (
            <motion.div 
              key="atmosphere"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-hero opacity-90" />
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-48 h-48 bg-white/20 blur-3xl rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)]" 
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <MapView moments={currentJourney.moments || []} interactive={false} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={() => setViewMode(prev => prev === 'atmosphere' ? 'map' : 'atmosphere')}
            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-white/20 transition-colors"
          >
            {viewMode === 'atmosphere' ? <MapIcon size={18} /> : <Sparkles size={18} />}
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8 z-20">
          <Card variant="glass" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">
                {currentJourney.moments?.[currentJourney.moments.length - 1]?.weather_icon || '🧭'}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">Current Location</p>
                <p className="font-bold text-base text-sand-50 truncate max-w-[140px]">
                  {currentJourney.moments?.[currentJourney.moments.length - 1]?.place_name || 'Locating...'}
                </p>
              </div>
            </div>
            <Button size="icon" variant="accent" onClick={() => captureMoment(true)}>
              <Camera size={22} />
            </Button>
          </Card>
        </div>
      </div>

      <section className="space-y-4 px-2">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-medium text-lg text-sand-100">Captured Moments</h3>
          <span className="text-xs font-bold text-sand-500">{currentJourney.moments?.length || 0} logged</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          <AnimatePresence initial={false}>
            {(currentJourney.moments || []).slice().reverse().map((moment) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex-shrink-0"
              >
                <Card variant="glass" className="w-32 p-3 space-y-2 border-white/5">
                  <div className="text-2xl">{moment.weather_icon}</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-sand-500">
                      {new Date(moment.timestamp || moment.captured_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs font-semibold truncate text-sand-100">{moment.place_name}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="px-2 space-y-3">
        <h3 className="font-serif font-medium text-lg text-sand-100 flex items-center gap-2">
          <Sparkles size={18} className="text-teal-400" /> Writing Style
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['poetic', 'descriptive', 'brief'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`py-3 px-1 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                selectedStyle === style 
                  ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-900/40' 
                  : 'bg-white/5 border-white/10 text-sand-500 hover:bg-white/10'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      <div className="px-2 pb-8 pt-4">
        <Button 
          variant="accent"
          className="w-full py-6 text-xl gap-3 rounded-[2rem]" 
          onClick={handleEndJourney}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              {statusMessage}
            </>
          ) : (
            <>
              <CheckCircle2 size={24} />
              I've Arrived
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
