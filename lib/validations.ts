import { z } from "zod";

export const JourneyStartSchema = z.object({
  destination_name: z.string().min(2, "Destination must be at least 2 characters").max(200),
  destination_lat: z.number().optional(),
  destination_lng: z.number().optional(),
  departure_note: z.string().max(280).optional(),
});

export const MomentSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  place_name: z.string().max(300).optional(),
  weather_condition: z.string().optional(),
  weather_temp: z.number().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  user_mood: z.enum(["happy", "calm", "excited", "tired", "neutral"]).optional(),
  is_key_moment: z.boolean().optional(),
});

export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  tracking_interval: z.enum(["5", "10", "15"]).transform(v => parseInt(v)).optional(),
  ai_style: z.enum(["poetic", "descriptive", "brief"]).optional(),
  auto_save_photos: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  travel_preferences: z.string().max(500).optional(),
  favorite_season: z.string().max(100).optional(),
  home_base: z.string().max(200).optional(),
});

export type JourneyStartInput = z.infer<typeof JourneyStartSchema>;
export type MomentInput = z.infer<typeof MomentSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
