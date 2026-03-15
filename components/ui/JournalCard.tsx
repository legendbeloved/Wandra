"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { MapPin, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import { Journey } from "@/types";
import { format } from "date-fns";

interface JournalCardProps {
  journey: Journey;
  index: number;
}

const moodColors: Record<string, string> = {
  peaceful: "bg-[#2E92A8] text-white",
  excited: "bg-[#E47832] text-white",
  tired: "bg-[#6E665E] text-white",
  inspired: "bg-[#6B9E72] text-white",
  default: "bg-[#C2BAB0] text-[#1E1C1A]"
};

export function JournalCard({ journey, index }: JournalCardProps) {
  const isDark = false; // Based on theme context if implemented, defaulting to light mode variant for cards

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.1, // Staggered entry
      },
    },
  };

  const formattedDate = journey.started_at
    ? format(new Date(journey.started_at), "MMM d, yyyy")
    : "Unknown Date";

  // Dummy calculated duration + distance for prototype
  const durationText = "3h 42m";
  const distanceText = "14 km";
  
  const mood = journey.mood_tag || "default";
  const moodColorClass = moodColors[mood.toLowerCase()] || moodColors.default;

  return (
    <Link href={`/journal/${journey.id}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className="group relative flex flex-col rounded-[20px] overflow-hidden cursor-pointer transition-shadow duration-300 shadow-[0_2px_8px_rgba(11,61,74,0.06),0_8px_24px_rgba(11,61,74,0.08),inset_0_1px_0_rgba(255,255,255,0.80)] hover:shadow-[0_12px_32px_rgba(11,61,74,0.12),0_4px_16px_rgba(11,61,74,0.08)] bg-[rgba(253,250,245,0.88)] backdrop-blur-[16px] backdrop-saturate-[200%] border border-[rgba(218,212,203,0.50)]"
      >
        {/* Card Cover Header */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-[#0B3D4A]/10 to-[#C4622D]/10">
          {(journey as any).cover_image_url ? (
            <img 
              src={(journey as any).cover_image_url} 
              alt={journey.destination_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#A89E92]">
              <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
          )}
          
          {/* Mood Badge */}
          {journey.mood_tag && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.06em] shadow-sm backdrop-blur-md ${moodColorClass}`}>
              {journey.mood_tag}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-6">
          <h3 className="font-serif text-[20px] font-semibold text-[#1E1C1A] mb-2 leading-snug line-clamp-1">
            {journey.destination_name}
          </h3>
          
          <div className="flex items-center gap-3 text-xs font-medium text-[#8A8078] mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#C2BAB0]" />
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{durationText}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#C2BAB0]" />
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{distanceText}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-[#EDE9E4]">
            <p className="font-serif text-[15px] italic text-[#534D47] line-clamp-2 leading-[1.6]">
              {journey.journal_text || "A new journey awaiting its story. Travel to capture memories."}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function JournalCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="shimmer-skeleton relative flex flex-col rounded-[20px] overflow-hidden h-[340px] border border-[rgba(218,212,203,0.50)] bg-[#F8F0E3]"
    >
      <div className="h-40 w-full bg-[#EDE9E4]" />
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="h-6 w-3/4 bg-[#EDE9E4] rounded-md" />
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-[#EDE9E4] rounded-md" />
          <div className="h-4 w-16 bg-[#EDE9E4] rounded-md" />
        </div>
        <div className="mt-auto pt-4 border-t border-[#EDE9E4] space-y-2">
          <div className="h-4 w-full bg-[#EDE9E4] rounded-md" />
          <div className="h-4 w-4/5 bg-[#EDE9E4] rounded-md" />
        </div>
      </div>
    </motion.div>
  );
}
