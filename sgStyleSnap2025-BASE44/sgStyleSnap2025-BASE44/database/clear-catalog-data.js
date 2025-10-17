/**
 * Clear Catalog Data Script
 * 
 * This script will clear all items from the catalog_items table
 * Run this script to remove all catalog items and make the catalog page empty
 * 
 * Usage:
 * 1. Make sure your Supabase connection is working
 * 2. Run: node clear-catalog-data.js
 * 
 * WARNING: This will permanently delete all catalog items!
 */

import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearCatalogData() {
  try {
    console.log('🗑️  Starting to clear catalog data...')
    
    // First, let's see what we have
    const { data: items, error: fetchError } = await supabase
      .from('catalog_items')
      .select('id, name, brand')
      .limit(10)
    
    if (fetchError) {
      console.error('❌ Error fetching items:', fetchError)
      return
    }
    
    console.log(`📊 Found ${items.length} catalog items (showing first 10):`)
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.brand}) - ID: ${item.id}`)
    })
    
    // Delete all catalog items
    const { error: deleteError, count } = await supabase
      .from('catalog_items')
      .delete()
      .neq('id', 'never-match') // This deletes all rows
    
    if (deleteError) {
      console.error('❌ Error deleting items:', deleteError)
      return
    }
    
    console.log(`✅ Successfully cleared catalog data!`)
    console.log(`📊 Deleted ${count || 'all'} catalog items`)
    console.log('🎉 Catalog page should now be empty!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
clearCatalogData()
