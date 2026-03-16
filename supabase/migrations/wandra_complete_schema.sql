-- Wandra Comprehensive Supabase Migration Script
-- Version: 1.0.0
-- Description: Complete schema including profiles, journeys, moments, RLS, triggers, and seed data.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  tracking_interval integer DEFAULT 5 CHECK (tracking_interval IN (5, 10, 15)),
  ai_style text DEFAULT 'poetic' CHECK (ai_style IN ('poetic', 'descriptive', 'brief')),
  auto_save_photos boolean DEFAULT true,
  onboarded boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  travel_preferences text,
  favorite_season text,
  home_base text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- journeys
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
  deleted_at timestamptz
);

-- moments
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
  duration_at_location integer,
  captured_at timestamptz DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS journeys_user_id_idx ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS journeys_status_idx ON public.journeys(status);
CREATE INDEX IF NOT EXISTS moments_journey_id_idx ON public.moments(journey_id);
CREATE INDEX IF NOT EXISTS moments_captured_at_idx ON public.moments(captured_at);

-- 4. RLS ENABLING
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Profiles
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles can be updated by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Journeys
CREATE POLICY "Journeys are viewable by owner" ON public.journeys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Journeys can be inserted by owner" ON public.journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Journeys can be updated by owner" ON public.journeys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Journeys can be deleted by owner" ON public.journeys FOR DELETE USING (auth.uid() = user_id);

-- Moments
CREATE POLICY "Moments are viewable by owner" ON public.moments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Moments can be inserted by owner" ON public.moments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Moments can be updated by owner" ON public.moments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Moments can be deleted by owner" ON public.moments FOR DELETE USING (auth.uid() = user_id);

-- 6. TRIGGERS & FUNCTIONS
-- Function: Handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile after auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function: Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Link updated_at function to tables
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_journeys_updated BEFORE UPDATE ON public.journeys FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. SEED DATA (FOR DEVELOPMENT)
-- Note: Dummy UUIDs used for demonstration. In Supabase UI, these would link to real auth.users.
/*
INSERT INTO public.profiles (id, display_name, ai_style)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Atlas Walker', 'poetic'),
  ('00000000-0000-0000-0000-000000000002', 'Nomad Soul', 'brief');

INSERT INTO public.journeys (id, user_id, destination_name, status, journal_title, journal_text, mood_tag)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Kyoto, Japan', 'completed', 'Whispers of Gion', 'The incense at Kiyomizu-dera carried the weight of a thousand prayers...', 'Reflective'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Iceland Roadtrip', 'active', NULL, NULL, 'Excited'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Safari in Kenya', 'completed', 'Golden Savannah', 'Great experience. Saw the Big Five. Hot but worth it.', 'Adventurous');

INSERT INTO public.moments (journey_id, user_id, lat, lng, place_name, weather_condition, weather_temp, user_mood)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 34.9948, 135.7850, 'Kiyomizu-dera', 'Clear', 22.5, 'calm'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 64.1265, -21.8174, 'Reykjavík Harbour', 'Cloudy', 4.0, 'excited');
*/
