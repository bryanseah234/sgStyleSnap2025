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
 * ⚠️  FOREIGN KEY CONSTRAINT WARNING:
 * - Users' clothes reference catalog_items via catalog_item_id
 * - Outfits reference clothes (not catalog_items directly), so outfits won't break
 * - But deletion will FAIL if users have clothes linked to catalog items
 * - This script will clear catalog_item_id references BEFORE deleting catalog items
 * 
 * Usage:
 * 1. Set environment variables:
 *    - SUPABASE_URL (or VITE_SUPABASE_URL)
 *    - SUPABASE_SERVICE_ROLE_KEY (REQUIRED - not the anon key!)
 * 2. Run: node database/clear-catalog-data.js
 * 
 * WARNING: This will permanently delete all catalog items!
 * Users' clothes linked to catalog items will be preserved, but the link will be removed.
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
    
    // Check for user clothes that reference catalog items
    console.log('🔍 Checking for user clothes linked to catalog items...')
    const { count: linkedClothesCount, error: linkedError } = await supabase
      .from('clothes')
      .select('catalog_item_id', { count: 'exact', head: true })
      .not('catalog_item_id', 'is', null)
    
    if (linkedError) {
      console.warn('⚠️  Could not check linked clothes:', linkedError.message)
      console.warn('   Continuing anyway...')
    } else {
      console.log(`📦 Found ${linkedClothesCount || 0} user clothes items linked to catalog`)
      if (linkedClothesCount > 0) {
        console.log('   💡 These clothes will be preserved, but catalog_item_id links will be cleared')
      }
    }
    
    // Check for wishlist items (if wishlist table exists)
    let wishlistCount = 0
    try {
      const { count: wishCount, error: wishError } = await supabase
        .from('wishlist')
        .select('catalog_item_id', { count: 'exact', head: true })
        .not('catalog_item_id', 'is', null)
      
      if (!wishError && wishCount) {
        wishlistCount = wishCount
        console.log(`📋 Found ${wishlistCount} wishlist items linked to catalog`)
      }
    } catch {
      // wishlist table might not exist, ignore
    }
    
    console.log('')
    
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
    
    // STEP 1: Clear catalog_item_id references from clothes table
    // This prevents foreign key constraint violations
    if (linkedClothesCount > 0) {
      console.log('🔗 Step 1: Clearing catalog_item_id references from user clothes...')
      const { error: clearLinksError, count: clearedCount } = await supabase
        .from('clothes')
        .update({ catalog_item_id: null })
        .not('catalog_item_id', 'is', null)
      
      if (clearLinksError) {
        console.error('❌ Error clearing catalog_item_id links:', clearLinksError)
        console.error('   Cannot proceed with deletion - foreign key constraint would be violated')
        return
      }
      
      console.log(`   ✅ Cleared ${clearedCount || linkedClothesCount} catalog_item_id references`)
      console.log('   💡 User clothes are preserved - only the catalog link was removed')
      console.log('')
    }
    
    // STEP 2: Clear wishlist references (if any)
    if (wishlistCount > 0) {
      console.log('📋 Step 2: Clearing wishlist references...')
      const { error: clearWishlistError } = await supabase
        .from('wishlist')
        .delete()
        .not('catalog_item_id', 'is', null)
      
      if (clearWishlistError) {
        console.warn('⚠️  Warning: Could not clear wishlist:', clearWishlistError.message)
        console.warn('   This might cause deletion to fail. Continuing anyway...')
      } else {
        console.log(`   ✅ Cleared ${wishlistCount} wishlist entries`)
        console.log('')
      }
    }
    
    // STEP 3: Delete all catalog items
    // Now that references are cleared, deletion should succeed
    console.log('🗑️  Step 3: Deleting catalog items...')
    const { error: deleteError } = await supabase
      .from('catalog_items')
      .delete()
      .neq('id', 'never-match') // This deletes all rows
    
    if (deleteError) {
      console.error('❌ Error deleting items:', deleteError)
      if (deleteError.message?.includes('foreign key') || deleteError.message?.includes('violates foreign key constraint')) {
        console.error('   🔴 Foreign key constraint violation!')
        console.error('   Some items are still referenced. Check:')
        console.error('   - clothes.catalog_item_id')
        console.error('   - wishlist.catalog_item_id (if exists)')
      } else if (deleteError.message?.includes('RLS')) {
        console.error('   If you see an RLS policy error, make sure you\'re using SUPABASE_SERVICE_ROLE_KEY')
      }
      return
    }
    
    console.log('')
    console.log(`✅ Successfully cleared catalog data!`)
    console.log(`📊 Deleted ${totalCount} catalog items`)
    if (linkedClothesCount > 0) {
      console.log(`💾 Preserved ${linkedClothesCount} user clothes items (catalog links removed)`)
    }
    console.log('🎉 Catalog page should now be empty!')
    console.log('')
    console.log('📝 Note: User outfits are unaffected - they reference clothes, not catalog_items directly')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('   Make sure you have:')
    console.error('   1. SUPABASE_URL or VITE_SUPABASE_URL set')
    console.error('   2. SUPABASE_SERVICE_ROLE_KEY set (not anon key!)')
  }
}

// Run the script
clearCatalogData()
