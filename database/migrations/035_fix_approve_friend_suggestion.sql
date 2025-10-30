-- Migration 035: Fix Approve Friend Outfit Suggestion
-- This migration updates the approve_friend_outfit_suggestion function to work with the new outfits/outfit_items schema
-- Date: 2025

-- =============================================================================
-- DROP EXISTING FUNCTION
-- =============================================================================

DROP FUNCTION IF EXISTS approve_friend_outfit_suggestion(UUID) CASCADE;

-- =============================================================================
-- UPDATE FRIEND_OUTFIT_SUGGESTIONS TABLE
-- =============================================================================

-- Update the reference to use outfits instead of generated_outfits
-- Use DO block to safely handle column operations
DO $$
BEGIN
  -- Drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friend_outfit_suggestions_generated_outfit_id_fkey'
    AND table_name = 'friend_outfit_suggestions'
  ) THEN
    ALTER TABLE friend_outfit_suggestions 
      DROP CONSTRAINT friend_outfit_suggestions_generated_outfit_id_fkey;
  END IF;

  -- Drop old column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'friend_outfit_suggestions' 
    AND column_name = 'generated_outfit_id'
  ) THEN
    ALTER TABLE friend_outfit_suggestions DROP COLUMN generated_outfit_id;
  END IF;
END $$;

-- Add new column for outfit_id
ALTER TABLE friend_outfit_suggestions
  ADD COLUMN IF NOT EXISTS outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_friend_outfit_suggestions_outfit_id ON friend_outfit_suggestions(outfit_id);

-- =============================================================================
-- UPDATED APPROVE FRIEND OUTFIT SUGGESTION FUNCTION
-- =============================================================================

/**
 * Approve friend outfit suggestion
 * Creates an outfit in the outfits table and outfit_items entries
 */
CREATE OR REPLACE FUNCTION approve_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS UUID AS $$
DECLARE
  v_suggestion RECORD;
  v_outfit_id UUID;
  v_item JSONB;
  v_clothes_id UUID;
BEGIN
  -- Get suggestion details
  SELECT * INTO v_suggestion
  FROM friend_outfit_suggestions
  WHERE id = p_suggestion_id
    AND owner_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;
  
  -- Create outfit
  INSERT INTO outfits (
    owner_id,
    outfit_name,
    description,
    is_public,
    is_favorite
  ) VALUES (
    v_suggestion.owner_id,
    COALESCE(v_suggestion.message, 'Outfit Suggested by Friend'),
    'Created from friend suggestion',
    false,
    false
  ) RETURNING id INTO v_outfit_id;
  
  -- Add outfit items from the JSONB outfit_items array
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_suggestion.outfit_items)
  LOOP
    -- Extract the clothes_id (could be clothing_item_id or clothes_id)
    v_clothes_id := v_item->>'clothes_id';
    
    -- If clothes_id is not present, try clothing_item_id
    IF v_clothes_id IS NULL THEN
      v_clothes_id := v_item->>'clothing_item_id';
    END IF;
    
    -- Skip if no valid ID
    IF v_clothes_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Insert outfit item with positioning data
    INSERT INTO outfit_items (
      outfit_id,
      clothing_item_id,
      x_position,
      y_position,
      z_index,
      scale,
      rotation
    ) VALUES (
      v_outfit_id,
      v_clothes_id::UUID,
      COALESCE((v_item->>'x_position')::DECIMAL, 0),
      COALESCE((v_item->>'y_position')::DECIMAL, 0),
      COALESCE((v_item->>'z_index')::INTEGER, 1),
      COALESCE((v_item->>'scale')::DECIMAL, 1.0),
      COALESCE((v_item->>'rotation')::DECIMAL, 0)
    )
    ON CONFLICT (outfit_id, clothing_item_id) DO NOTHING;
  END LOOP;
  
  -- Update suggestion status
  UPDATE friend_outfit_suggestions
  SET 
    status = 'approved',
    outfit_id = v_outfit_id,
    responded_at = NOW()
  WHERE id = p_suggestion_id;
  
  -- Mark notification as read
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE reference_id = p_suggestion_id
    AND recipient_id = auth.uid()
    AND type = 'friend_outfit_suggestion';
  
  RETURN v_outfit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION approve_friend_outfit_suggestion IS 'Approve suggestion and add outfit to user collection using outfits and outfit_items tables';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'approve_friend_outfit_suggestion'
  ) THEN
    RAISE NOTICE '✅ Function approve_friend_outfit_suggestion updated successfully';
  ELSE
    RAISE EXCEPTION '❌ Function approve_friend_outfit_suggestion was not created';
  END IF;
END $$;

