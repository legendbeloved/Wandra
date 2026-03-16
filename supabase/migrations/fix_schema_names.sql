-- Wandra Schema Fix: Synchronize column names with latest application logic
-- Run this in the Supabase SQL Editor to fix 'captured_at' and 'lng' errors.

DO $$ 
BEGIN 
  -- 1. Fix 'moments' table: created_at -> captured_at
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'created_at') THEN
    ALTER TABLE public.moments RENAME COLUMN created_at TO captured_at;
  END IF;

  -- 2. Fix 'moments' table: lon -> lng
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'lon') THEN
    ALTER TABLE public.moments RENAME COLUMN lon TO lng;
  END IF;

  -- 2b. Fix 'profiles' table: user_id -> id (if user_id exists but id doesn't)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id') THEN
    ALTER TABLE public.profiles RENAME COLUMN user_id TO id;
  END IF;

  -- 3. Ensure 'journeys' has 'user_id'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journeys' AND column_name = 'user_id') THEN
    ALTER TABLE public.journeys ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- 4. Ensure 'moments' has 'user_id'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'user_id') THEN
    ALTER TABLE public.moments ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

END $$;
