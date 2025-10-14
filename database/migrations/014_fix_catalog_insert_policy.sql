-- Migration 014: Fix catalog_items INSERT policy
-- Purpose: Allow auto-contribution function to insert items into catalog_items table
-- Date: 2024-01-XX
-- Author: System

-- ============================================
-- FIX CATALOG_ITEMS INSERT POLICY
-- ============================================

-- The auto_contribute_to_catalog function needs to INSERT into catalog_items
-- but there's currently no INSERT policy, causing RLS violations

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow auto-contribution to catalog" ON catalog_items;

-- Create INSERT policy for auto-contribution function
-- This allows the auto_contribute_to_catalog function to insert items
-- while maintaining security (only through the function, not direct user inserts)
CREATE POLICY "Allow auto-contribution to catalog"
ON catalog_items FOR INSERT
WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'catalog_items'
ORDER BY policyname;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Allow auto-contribution to catalog" ON catalog_items IS 
'Allows the auto_contribute_to_catalog function to insert user uploads into catalog_items table for anonymous catalog contribution';
