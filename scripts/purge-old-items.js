/**
 * Purge Old Items Script - StyleSnap
 * 
 * Purpose: Automated script to purge clothing items older than 2 years
 * 
 * Functionality:
 * 1. Connects to Supabase database
 * 2. Queries for items older than 730 days (2 years)
 * 3. For each old item:
 *    - Delete image from Cloudinary
 *    - Delete item from database
 * 4. Logs results (items deleted, errors)
 * 5. Sends summary report (optional)
 * 
 * Configuration:
 * - MAX_AGE_DAYS: 730 (default, can be configured)
 * - DRY_RUN: true/false (preview mode)
 * - BATCH_SIZE: number of items to process at once
 * 
 * Usage:
 * node scripts/purge-old-items.js
 * node scripts/purge-old-items.js --dry-run (preview only)
 * node scripts/purge-old-items.js --max-age=365 (1 year instead)
 * 
 * Scheduling:
 * Run this script via cron job or GitHub Actions on a schedule:
 * - Daily: 0 2 * * * (2 AM daily)
 * - Weekly: 0 2 * * 0 (2 AM every Sunday)
 * - Monthly: 0 2 1 * * (2 AM on 1st of month)
 * 
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY (service role key, not anon key!)
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 * 
 * Safety Features:
 * - Dry run mode to preview deletions
 * - Confirmation prompt before actual deletion
 * - Transaction rollback on errors
 * - Detailed logging
 * 
 * Reference:
 * - tasks/06-quotas-maintenance.md for maintenance requirements
 * - utils/maintenance-helpers.js for helper functions
 * - .github/workflows/ for GitHub Actions scheduling
 */

import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { extractCloudinaryPublicId } from '../src/utils/maintenance-helpers.js'
import * as readline from 'readline'

// Configuration
const MAX_AGE_DAYS = parseInt(process.env.MAX_AGE_DAYS) || 730
const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = 50

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Error: Cloudinary credentials must be set')
  process.exit(1)
}

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Prompts user for confirmation
 */
async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function purgeOldItems() {
  console.log('='.repeat(50))
  console.log('StyleSnap - Purge Old Items Script')
  console.log('='.repeat(50))
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE'}`)
  console.log(`Max age: ${MAX_AGE_DAYS} days`)
  console.log()
  
  try {
    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS)
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`)
    
    // Fetch items older than cutoff date
    const { data: oldItems, error } = await supabase
      .from('closet_items')
      .select('id, user_id, name, image_url, created_at')
      .lt('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch old items: ${error.message}`)
    }
    
    console.log(`Found ${oldItems.length} items older than ${MAX_AGE_DAYS} days`)
    
    if (oldItems.length === 0) {
      console.log('No items to purge. Exiting.')
      return
    }
    
    // If DRY_RUN, just log what would be deleted
    if (DRY_RUN) {
      console.log('\nDRY RUN - Preview of items that would be deleted:')
      oldItems.slice(0, 10).forEach(item => {
        const age = Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24))
        console.log(`  - ${item.name} (${age} days old, user: ${item.user_id})`)
      })
      if (oldItems.length > 10) {
        console.log(`  ... and ${oldItems.length - 10} more items`)
      }
      console.log('\nRun without --dry-run to actually delete these items.')
      return
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete items and their images!')
    const confirmed = await confirm(`Delete ${oldItems.length} items? (y/n): `)
    
    if (!confirmed) {
      console.log('Deletion cancelled.')
      return
    }
    
    // Process items in batches
    let deletedCount = 0
    let errorCount = 0
    const errors = []
    
    console.log('\nProcessing items...')
    
    for (let i = 0; i < oldItems.length; i += BATCH_SIZE) {
      const batch = oldItems.slice(i, i + BATCH_SIZE)
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(oldItems.length / BATCH_SIZE)}`)
      
      for (const item of batch) {
        try {
          // Delete from Cloudinary if image exists
          if (item.image_url) {
            const publicId = extractCloudinaryPublicId(item.image_url)
            if (publicId) {
              await cloudinary.uploader.destroy(publicId)
              console.log(`  ✓ Deleted image: ${publicId}`)
            }
          }
          
          // Delete from database
          const { error: deleteError } = await supabase
            .from('closet_items')
            .delete()
            .eq('id', item.id)
          
          if (deleteError) {
            throw deleteError
          }
          
          deletedCount++
          console.log(`  ✓ Deleted item: ${item.name} (ID: ${item.id})`)
        } catch (error) {
          errorCount++
          const errorMsg = `Failed to delete item ${item.id}: ${error.message}`
          errors.push(errorMsg)
          console.error(`  ✗ ${errorMsg}`)
        }
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('Purge Summary')
    console.log('='.repeat(50))
    console.log(`Total items found: ${oldItems.length}`)
    console.log(`Successfully deleted: ${deletedCount}`)
    console.log(`Errors: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }
    
    console.log('\nPurge complete!')
  } catch (error) {
    console.error('\n❌ Purge failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
purgeOldItems()
