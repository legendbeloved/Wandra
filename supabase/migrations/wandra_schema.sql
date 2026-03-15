-- Wandra Database Schema Migration

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  tracking_interval integer DEFAULT 5, -- minutes
  ai_style text DEFAULT 'poetic' CHECK (ai_style IN ('poetic', 'descriptive', 'brief')),
  auto_save_photos boolean DEFAULT true,
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Journeys Table
CREATE TABLE IF NOT EXISTS public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_name text NOT NULL,
  destination_lat decimal(10,7),
  destination_lng decimal(10,7),
  departure_note text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer,
  distance_km decimal(8,2),
  journal_text text,
  journal_title text,
  cover_photo_url text,
  mood_tag text,
  weather_summary text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz -- Soft delete
);

-- 3. Moments Table
CREATE TABLE IF NOT EXISTS public.moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lat decimal(10,7) NOT NULL,
  lng decimal(10,7) NOT NULL,
  place_name text,
  weather_condition text,
  weather_temp decimal(5,2),
  weather_icon text,
  photo_url text,
  user_mood text CHECK (user_mood IN ('happy', 'calm', 'excited', 'tired', 'neutral')),
  is_key_moment boolean DEFAULT false,
  duration_at_location integer, -- minutes
  captured_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS journeys_user_id_idx ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS journeys_status_idx ON public.journeys(status);
CREATE INDEX IF NOT EXISTS moments_journey_id_idx ON public.moments(journey_id);
CREATE INDEX IF NOT EXISTS moments_captured_at_idx ON public.moments(captured_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Journeys: Users can only see and manage their own journeys
CREATE POLICY "Users can view own journeys" ON public.journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys" ON public.journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON public.journeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys" ON public.journeys
  FOR DELETE USING (auth.uid() = user_id);

-- Moments: Users can only see and manage their own moments
CREATE POLICY "Users can view own moments" ON public.moments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moments" ON public.moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moments" ON public.moments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moments" ON public.moments
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON public.journeys
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
