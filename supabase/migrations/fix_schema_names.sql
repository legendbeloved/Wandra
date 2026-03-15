-- Wandra Schema Fix: Synchronize column names with latest application logic
-- Run this in the Supabase SQL Editor to fix 'captured_at' and 'lng' errors.

DO $$ 
BEGIN 
  -- 1. Fix 'moments' table: created_at -> captured_at
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'created_at') THEN
    ALTER TABLE public.moments RENAME COLUMN created_at TO captured_at;
    RAISE NOTICE 'Renamed moments.created_at to captured_at';
  END IF;

  -- 2. Fix 'moments' table: lon -> lng
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'lon') THEN
    ALTER TABLE public.moments RENAME COLUMN lon TO lng;
    RAISE NOTICE 'Renamed moments.lon to lng';
  END IF;

  -- 3. Fix 'moments' index if it exists with old name
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'moments' AND indexname = 'moments_created_at_idx') THEN
    ALTER INDEX public.moments_created_at_idx RENAME TO moments_captured_at_idx;
  END IF;

END $$;
