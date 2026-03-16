-- Wandra Premium Features: Schema Additions
-- Run this in the Supabase SQL Editor to enable Roadmap Phase 1 features.

DO $$ 
BEGIN 
  -- 1. Update profiles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferred_theme') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_theme text DEFAULT 'aurora';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferred_language') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_language text DEFAULT 'english';
  END IF;

  -- 2. Update journeys table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journeys' AND column_name = 'selected_theme') THEN
    ALTER TABLE public.journeys ADD COLUMN selected_theme text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journeys' AND column_name = 'postcard_data') THEN
    ALTER TABLE public.journeys ADD COLUMN postcard_data jsonb;
  END IF;

END $$;
