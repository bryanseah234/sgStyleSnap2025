-- ============================================
-- MIGRATION 030: Add Privacy to Outfits
-- ============================================
-- Purpose: Add privacy field to outfits table and update RLS policies
--          to allow friends to view each other's items and outfits
-- Date: 2025-01-22
-- Author: StyleSnap Team
-- ============================================

-- ============================================
-- 1. ADD PRIVACY COLUMN TO OUTFITS TABLE
-- ============================================

-- Add privacy column to outfits table (similar to clothes table)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfits' AND column_name = 'privacy'
  ) THEN
    ALTER TABLE outfits 
      ADD COLUMN privacy VARCHAR(20) DEFAULT 'friends' 
      CHECK (privacy IN ('private', 'friends', 'public'));
    
    RAISE NOTICE '✅ Added privacy column to outfits table';
  ELSE
    RAISE NOTICE 'ℹ️ Privacy column already exists in outfits table';
  END IF;
END $$;

-- Migrate existing outfits: is_public = true -> privacy = 'public', else 'friends'
DO $$
BEGIN
  UPDATE outfits
  SET privacy = CASE
    WHEN is_public = true THEN 'public'
    ELSE 'friends'
  END
  WHERE privacy IS NULL;
  
  RAISE NOTICE '✅ Migrated existing outfits to use privacy field';
END $$;

-- ============================================
-- 2. UPDATE CLOTHES PRIVACY CONSTRAINT
-- ============================================

-- Ensure clothes table allows 'public' privacy setting
DO $$
BEGIN
  -- Drop old constraint if it exists
  ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_privacy_check;
  
  -- Add new constraint with public option
  ALTER TABLE clothes 
    ADD CONSTRAINT clothes_privacy_check 
    CHECK (privacy IN ('private', 'friends', 'public'));
  
  RAISE NOTICE '✅ Updated clothes table privacy constraint to include public';
END $$;

-- ============================================
-- 3. UPDATE RLS POLICIES FOR CLOTHES
-- ============================================

-- Drop old public clothes policy if exists
DROP POLICY IF EXISTS "Anyone can view public clothes" ON clothes;

-- Create policy for public clothes
CREATE POLICY "Anyone can view public clothes" ON clothes
  FOR SELECT USING (privacy = 'public' AND removed_at IS NULL);

RAISE NOTICE '✅ Created RLS policy for public clothes';

-- ============================================
-- 4. UPDATE RLS POLICIES FOR OUTFITS
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view public outfits" ON outfits;
DROP POLICY IF EXISTS "Friends can view friends outfits" ON outfits;

-- Create policy for public outfits
CREATE POLICY "Anyone can view public outfits" ON outfits
  FOR SELECT USING (privacy = 'public' AND removed_at IS NULL);

-- Create policy for friends to view friends' outfits
CREATE POLICY "Friends can view friends outfits" ON outfits
  FOR SELECT USING (
    privacy = 'friends' 
    AND removed_at IS NULL
    AND EXISTS (
      SELECT 1 FROM friends
      WHERE (
        (requester_id = auth.uid() AND receiver_id = owner_id) OR
        (requester_id = owner_id AND receiver_id = auth.uid())
      )
      AND status = 'accepted'
    )
  );

RAISE NOTICE '✅ Created RLS policies for outfits (public and friends)';

-- ============================================
-- 5. UPDATE RLS POLICIES FOR OUTFIT_ITEMS
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view outfit items for public outfits" ON outfit_items;
DROP POLICY IF EXISTS "Friends can view friends outfit items" ON outfit_items;

-- Policy for public outfit items
CREATE POLICY "Anyone can view public outfit items" ON outfit_items
  FOR SELECT USING (
    outfit_id IN (
      SELECT id FROM outfits 
      WHERE privacy = 'public' AND removed_at IS NULL
    )
  );

-- Policy for friends to view friends' outfit items
CREATE POLICY "Friends can view friends outfit items" ON outfit_items
  FOR SELECT USING (
    outfit_id IN (
      SELECT id FROM outfits 
      WHERE privacy = 'friends' 
      AND removed_at IS NULL
      AND EXISTS (
        SELECT 1 FROM friends
        WHERE (
          (requester_id = auth.uid() AND receiver_id = owner_id) OR
          (requester_id = owner_id AND receiver_id = auth.uid())
        )
        AND status = 'accepted'
      )
    )
  );

RAISE NOTICE '✅ Created RLS policies for outfit_items (public and friends)';

-- ============================================
-- 6. CREATE INDEX FOR PERFORMANCE
-- ============================================

-- Index for privacy filtering on outfits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_outfits_privacy'
  ) THEN
    CREATE INDEX idx_outfits_privacy ON outfits(privacy) WHERE removed_at IS NULL;
    RAISE NOTICE '✅ Created index on outfits.privacy';
  ELSE
    RAISE NOTICE 'ℹ️ Index on outfits.privacy already exists';
  END IF;
END $$;

-- Index for privacy filtering on clothes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_clothes_privacy'
  ) THEN
    CREATE INDEX idx_clothes_privacy ON clothes(privacy) WHERE removed_at IS NULL;
    RAISE NOTICE '✅ Created index on clothes.privacy';
  ELSE
    RAISE NOTICE 'ℹ️ Index on clothes.privacy already exists';
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Migration 030 completed successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes made:';
  RAISE NOTICE '  1. Added privacy column to outfits table';
  RAISE NOTICE '  2. Migrated existing outfits to use privacy field';
  RAISE NOTICE '  3. Updated clothes table privacy constraint to include public';
  RAISE NOTICE '  4. Created RLS policies for public clothes and outfits';
  RAISE NOTICE '  5. Created RLS policies for friends to view each other''s items and outfits';
  RAISE NOTICE '  6. Created performance indexes on privacy columns';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Privacy levels now available:';
  RAISE NOTICE '  - private: Only owner can view';
  RAISE NOTICE '  - friends: Owner and friends can view';
  RAISE NOTICE '  - public: Everyone can view';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

