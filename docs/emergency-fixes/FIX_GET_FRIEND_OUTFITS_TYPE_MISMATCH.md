# Fix: get_friend_outfits Type Mismatch Error

## Problem

When clicking on a friend profile, you get this error:
```
structure of query does not match function result type
Returned type character varying(255) does not match expected type text in column 3
```

## Root Cause

The `get_friend_outfits` database function has a type mismatch. The `outfits` table defines some columns as `VARCHAR(255)` and `VARCHAR(50)`, but the function returns them as `TEXT`. PostgreSQL requires exact type matching.

## Solution

The fix is to cast the VARCHAR columns to TEXT in the SELECT statement.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from `scripts/fix-get-friend-outfits.sql`
5. Click **Run** to execute the query
6. You should see a success message

### Option 2: Using Supabase CLI

```bash
supabase db execute -f scripts/fix-get-friend-outfits.sql
```

### Option 3: Manual psql

```bash
psql -h <your-db-host> -U postgres -d postgres -f scripts/fix-get-friend-outfits.sql
```

## Verification

After running the fix, test by clicking on a friend's profile. The error should be resolved and you should be able to see their outfits.

## What Changed

The following columns are now explicitly cast to TEXT:
- `outfit_name::TEXT` (from VARCHAR(255))
- `occasion::TEXT` (from VARCHAR(50))
- `weather_condition::TEXT` (from VARCHAR(50))

This ensures the return types match the function's declared return types.

## Files Modified

- `database/migrations/034_add_get_friend_outfits.sql` - Updated with type casts
- `scripts/fix-get-friend-outfits.sql` - Standalone SQL fix for easy execution

