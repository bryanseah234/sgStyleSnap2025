-- ============================================
-- Migration 031: AI-Generated Clothing Description
-- ============================================
-- Purpose: Adds AI description field to store detailed JSON descriptions from Llama-4-Scout model
-- Dependencies: 001_initial_schema.sql
-- Creates:
--   - GIN index on ai_description column
-- Modifies:
--   - clothes table (adds ai_description JSONB column)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- ADD AI DESCRIPTION FIELD TO CLOTHES TABLE
-- ============================================

-- Add ai_description JSONB field to store full AI-generated description
ALTER TABLE clothes 
  ADD COLUMN IF NOT EXISTS ai_description JSONB;

-- Add comment to explain the field
COMMENT ON COLUMN clothes.ai_description IS 'AI-generated detailed JSON description from Llama-4-Scout model including color, material, style, pattern, fit, features, season, and occasions';

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_clothes_ai_description ON clothes USING gin(ai_description);

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- This migration adds support for AI-generated clothing descriptions.
-- The ai_description field stores structured JSON data from the Llama-4-Scout model
-- including:
--   - color: {primary, secondary[]}
--   - material: string
--   - style: string
--   - pattern: string
--   - fit: string
--   - features: string[]
--   - season: string[]
--   - occasions: string[]
--
-- Example structure:
-- {
--   "color": {"primary": "blue", "secondary": ["white"]},
--   "material": "cotton",
--   "style": "casual",
--   "pattern": "striped",
--   "fit": "regular",
--   "features": ["button-down collar", "short sleeves"],
--   "season": ["spring", "summer"],
--   "occasions": ["casual", "work"]
-- }
--
-- The field is optional and will be populated automatically when users upload
-- clothing items if the Llama description service is configured.

