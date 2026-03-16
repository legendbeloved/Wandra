export interface Journey {
  id: string;
  user_id: string;
  destination_name: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  departure_note?: string | null;
  status: 'active' | 'completed' | 'failed';
  started_at: string;
  ended_at?: string | null;
  duration_minutes?: number | null;
  distance_km?: number | null;
  journal_text?: string | null;
  journal_title?: string | null;
  cover_photo_url?: string | null;  
  mood_tag?: string | null;
  weather_summary?: string | null;
  ai_generated?: boolean;
  selected_theme?: string;
  postcard_data?: any;
  moments?: Moment[];
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  onboarded: boolean;
  tracking_interval?: number; // in minutes
  ai_style?: 'poetic' | 'descriptive' | 'brief';
  auto_save_photos?: boolean;
  theme?: 'light' | 'dark' | 'system';
  preferred_theme?: string;
  preferred_language?: string;
  travel_preferences?: string | null;
  favorite_season?: string | null;
  home_base?: string | null;
  notifications_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Moment {
  id: string;
  journey_id: string;
  user_id: string;
  lat: number;
  lng: number;
  place_name?: string | null;
  weather_condition?: string | null;
  weather_temp?: number | null;
  weather_icon?: string | null;
  photo_url?: string | null;
  user_mood?: 'happy' | 'calm' | 'excited' | 'tired' | 'neutral' | null;
  is_key_moment?: boolean;
  duration_at_location?: number | null;
  captured_at?: string;
  // Fallback for older code
  timestamp?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
