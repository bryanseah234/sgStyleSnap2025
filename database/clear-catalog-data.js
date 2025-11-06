/**
 * Clear Catalog Data Script
 * 
 * This script will clear all items from the catalog_items table
 * Run this script to remove all catalog items and make the catalog page empty
 * 
 * IMPORTANT: This script requires the SERVICE_ROLE_KEY (not anon key) because:
 * - The catalog_items table has Row Level Security (RLS) enabled
 * - There is NO DELETE policy for regular users
 * - Only the service_role key can bypass RLS to perform admin operations like DELETE
 * 
 * Usage:
 * 1. Set environment variables:
 *    - SUPABASE_URL (or VITE_SUPABASE_URL)
 *    - SUPABASE_SERVICE_ROLE_KEY (REQUIRED - not the anon key!)
 * 2. Run: node database/clear-catalog-data.js
 * 
 * WARNING: This will permanently delete all catalog items!
 * 
 * Security Note: The service_role key bypasses all RLS policies.
 * Keep this key secret and never commit it to version control!
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env file (if dotenv package is installed)
// If dotenv is not installed, set environment variables directly before running
import 'dotenv/config'

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
  console.error('   Please set it in your .env file or environment')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('   The anon key will NOT work - you need the service_role key to bypass RLS')
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key')
  console.error('   ⚠️  Keep this key secret! Never commit it to version control.')
  process.exit(1)
}

// Create Supabase client with SERVICE_ROLE_KEY (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearCatalogData() {
  try {
    console.log('🗑️  Starting to clear catalog data...')
    console.log('📋 Using service_role key (bypasses RLS policies)')
    console.log('')
    
    // First, get total count
    const { count: totalCount, error: countError } = await supabase
      .from('catalog_items')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting items:', countError)
      console.error('   This might indicate an RLS policy issue.')
      console.error('   Make sure you\'re using SUPABASE_SERVICE_ROLE_KEY (not anon key)')
      return
    }
    
    console.log(`📊 Total catalog items found: ${totalCount || 0}`)
    
    if (totalCount === 0) {
      console.log('✅ Catalog is already empty!')
      return
    }
    
    // Show sample items
    const { data: sampleItems, error: fetchError } = await supabase
      .from('catalog_items')
      .select('id, name, brand, category')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Error fetching sample items:', fetchError)
      return
    }
    
    if (sampleItems && sampleItems.length > 0) {
      console.log(`📋 Sample items (showing first ${sampleItems.length}):`)
      sampleItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name || 'Unnamed'} (${item.brand || 'No brand'}) - ${item.category || 'No category'}`)
      })
      if (totalCount > 5) {
        console.log(`  ... and ${totalCount - 5} more items`)
      }
      console.log('')
    }
    
    // Delete all catalog items
    // Using service_role key bypasses RLS, so this will work
    const { error: deleteError } = await supabase
      .from('catalog_items')
      .delete()
      .neq('id', 'never-match') // This deletes all rows
    
    if (deleteError) {
      console.error('❌ Error deleting items:', deleteError)
      console.error('   If you see an RLS policy error, make sure you\'re using SUPABASE_SERVICE_ROLE_KEY')
      return
    }
    
    console.log(`✅ Successfully cleared catalog data!`)
    console.log(`📊 Deleted ${totalCount} catalog items`)
    console.log('🎉 Catalog page should now be empty!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('   Make sure you have:')
    console.error('   1. SUPABASE_URL or VITE_SUPABASE_URL set')
    console.error('   2. SUPABASE_SERVICE_ROLE_KEY set (not anon key!)')
  }
}

// Run the script
clearCatalogData()
