-- Wandra Schema Diagnostic Script
-- Run this in your Supabase SQL Editor to check for column mismatches.

DO $$ 
DECLARE 
  col_exists boolean;
BEGIN 
  -- Check profiles table
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id') INTO col_exists;
  IF col_exists THEN 
    RAISE NOTICE 'Profiles table has "id" column (Correct)';
  ELSE 
    RAISE NOTICE 'Profiles table is MISSING "id" column';
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id') INTO col_exists;
  IF col_exists THEN 
    RAISE NOTICE 'Profiles table has "user_id" column (Uncommon for this app)';
  END IF;

  -- Check journeys table
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journeys' AND column_name = 'user_id') INTO col_exists;
  IF col_exists THEN 
    RAISE NOTICE 'Journeys table has "user_id" column (Correct)';
  ELSE 
    RAISE NOTICE 'Journeys table is MISSING "user_id" column';
  END IF;

  -- Check moments table
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moments' AND column_name = 'user_id') INTO col_exists;
  IF col_exists THEN 
    RAISE NOTICE 'Moments table has "user_id" column (Correct)';
  ELSE 
    RAISE NOTICE 'Moments table is MISSING "user_id" column';
  END IF;

END $$;
