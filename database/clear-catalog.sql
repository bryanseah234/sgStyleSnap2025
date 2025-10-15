-- Clear Catalog Data SQL Script
-- 
-- Run this SQL script in your Supabase SQL Editor to clear all catalog items
-- This will make the catalog page show as empty
--
-- WARNING: This will permanently delete all catalog items!

-- First, let's see what items exist
SELECT id, name, brand, category, created_at 
FROM catalog_items 
ORDER BY created_at DESC 
LIMIT 10;

-- Delete all catalog items
DELETE FROM catalog_items;

-- Verify the table is empty
SELECT COUNT(*) as remaining_items FROM catalog_items;
