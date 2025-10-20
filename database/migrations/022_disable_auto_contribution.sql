-- Migration 022: Disable Auto Contribution
-- Temporarily disable auto-contribution to catalog to fix RLS error
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DISABLE AUTO CONTRIBUTION
-- ============================================

-- Drop the trigger that auto-contributes to catalog
DROP TRIGGER IF EXISTS auto_contribute_to_catalog_trigger ON clothes;

-- You can re-enable it later by running:
-- CREATE TRIGGER auto_contribute_to_catalog_trigger
--   AFTER INSERT ON clothes
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_contribute_to_catalog();

-- ============================================
-- VERIFY TRIGGER REMOVAL
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'auto_contribute_to_catalog_trigger';
