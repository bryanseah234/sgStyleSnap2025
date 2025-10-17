-- Migration 016: Temporarily disable auto-contribution to catalog
-- Purpose: Fix RLS policy violation by disabling auto-contribution trigger
-- Date: 2024-01-XX
-- Author: System

-- ============================================
-- TEMPORARILY DISABLE AUTO-CONTRIBUTION
-- ============================================

-- Disable the auto-contribution trigger to prevent RLS policy violations
-- This is a temporary fix until the catalog_items INSERT policy is applied
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_contribute_to_catalog_trigger') THEN
    DROP TRIGGER auto_contribute_to_catalog_trigger ON clothes CASCADE;
    RAISE NOTICE 'Auto-contribution trigger disabled temporarily';
  ELSE
    RAISE NOTICE 'Auto-contribution trigger not found';
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION auto_contribute_to_catalog IS 'Automatically adds user uploads to catalog_items table (anonymous, no owner_id). Currently DISABLED due to RLS policy issues. Re-enable after applying catalog_items INSERT policy.';
