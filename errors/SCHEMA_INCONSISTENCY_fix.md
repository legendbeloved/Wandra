# Error: Column captured_at does not exist
## Type: API / Database Runtime Error
## Description:
API calls were failing with the error `ERROR: 42703: column "captured_at" does not exist`.

## Root Cause:
The database tables were created using an older version of the schema that named the timestamp column `created_at` instead of `captured_at`. Because `CREATE TABLE IF NOT EXISTS` does not modify existing tables, the new application code (which expects `captured_at`) was attempting to query a non-existent column.

## Fix Applied:
Created a rename migration script `supabase/migrations/fix_schema_names.sql` that uses an `ALTER TABLE` block to safely rename `created_at` to `captured_at` and `lon` to `lng` if they exist.

## Prompt Used:
"Implement the complete Zustand state management for Wandra... [followed by reporting the error]"

## Verified: Yes
