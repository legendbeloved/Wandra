'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, Share2, Download } from 'lucide-react';
import { Journey } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface PostcardProps {
  journey: Journey;
  caption: string;
}

export const Postcard = ({ journey, caption }: PostcardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-md mx-auto perspective-1000"
    >
      <Card variant="glass" className="relative aspect-[4/3] p-0 overflow-hidden border-2 border-white/20 group cursor-default">
        {/* Postcard Background (Image) */}
        <div className="absolute inset-0 z-0">
          <img 
            src={journey.cover_photo_url || `https://picsum.photos/seed/${journey.id}/800/600`} 
            alt="Journey Scene" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/60 via-transparent to-black/40" />
        </div>

        {/* Postcard Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full w-fit border border-white/10">
                <MapPin size={12} className="text-teal-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{journey.destination_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full w-fit border border-white/10">
                <Calendar size={12} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {new Date(journey.started_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-xl bg-white/10">
              <span className="font-serif italic text-lg leading-none">W</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-3xl font-medium leading-tight max-w-[80%] drop-shadow-2xl"
            >
              "{caption}"
            </motion.p>
            
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/20" />
              <Heart size={14} className="text-red-400 fill-red-400/20" />
              <div className="h-[1px] flex-1 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Glass Liquid Overlay for Glossy Effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      </Card>

      <div className="flex gap-4 mt-6">
        <Button variant="ghost" className="flex-1 gap-2 rounded-2xl group">
          <Share2 size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
          Share Adventure
        </Button>
        <Button variant="ghost" className="px-5 rounded-2xl group">
          <Download size={18} className="text-sand-400 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};
