-- Migration 023: Clear Catalog Data
-- This script clears all catalog items for testing/development
-- WARNING: This will permanently delete all catalog items!
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- SHOW EXISTING CATALOG ITEMS
-- ============================================
-- First, let's see what items exist
SELECT 
    id, 
    name, 
    brand_id,
    category_id,
    price,
    created_at 
FROM catalog_items 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- CLEAR CATALOG DATA
-- ============================================

-- Delete all wishlist items first (foreign key constraint)
DELETE FROM wishlist WHERE catalog_item_id IN (SELECT id FROM catalog_items);

-- Delete all catalog items
DELETE FROM catalog_items;

-- ============================================
-- VERIFY CLEARANCE
-- ============================================
-- Verify the table is empty
SELECT 
    'catalog_items' as table_name,
    COUNT(*) as remaining_items 
FROM catalog_items
UNION ALL
SELECT 
    'wishlist',
    COUNT(*) 
FROM wishlist;
