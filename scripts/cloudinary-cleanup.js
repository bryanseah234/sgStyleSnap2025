/**
 * Cloudinary Cleanup Script - StyleSnap
 * 
 * Purpose: Finds and deletes orphaned images in Cloudinary (images with no database record)
 * 
 * Functionality:
 * 1. Fetches all images from Cloudinary
 * 2. Fetches all image URLs from database
 * 3. Compares lists to find orphans (in Cloudinary but not in DB)
 * 4. Deletes orphaned images
 * 5. Reports storage saved
 * 
 * Orphaned Images Occur When:
 * - User uploads image but doesn't complete form submission
 * - Item deletion fails partway (DB deleted but Cloudinary not)
 * - Manual database manipulation
 * 
 * Configuration:
 * - DRY_RUN: true/false (preview mode)
 * - BATCH_SIZE: number of images to delete at once
 * 
 * Usage:
 * node scripts/cloudinary-cleanup.js
 * node scripts/cloudinary-cleanup.js --dry-run (preview only)
 * 
 * Scheduling:
 * Run weekly or monthly:
 * - Weekly: 0 3 * * 0 (3 AM every Sunday)
 * - Monthly: 0 3 1 * * (3 AM on 1st of month)
 * 
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 * 
 * Safety Features:
 * - Dry run mode
 * - Only deletes images older than 7 days (grace period)
 * - Confirmation prompt
 * - Detailed logging with file sizes
 * 
 * Reference:
 * - tasks/06-quotas-maintenance.md for maintenance requirements
 * - utils/maintenance-helpers.js for helper functions
 */

import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { extractCloudinaryPublicId, formatBytes } from '../src/utils/maintenance-helpers.js'
import * as readline from 'readline'

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const GRACE_PERIOD_DAYS = 7 // Only delete orphans older than this
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

async function cleanupOrphanedImages() {
  console.log('='.repeat(50))
  console.log('StyleSnap - Cloudinary Cleanup Script')
  console.log('='.repeat(50))
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE'}`)
  console.log(`Grace period: ${GRACE_PERIOD_DAYS} days`)
  console.log()
  
  try {
    // Fetch all images from Cloudinary
    console.log('Fetching images from Cloudinary...')
    const cloudinaryImages = []
    let cursor = null
    
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: cursor
      })
      cloudinaryImages.push(...result.resources)
      cursor = result.next_cursor
      console.log(`  Fetched ${cloudinaryImages.length} images...`)
    } while (cursor)
    
    console.log(`Total images in Cloudinary: ${cloudinaryImages.length}`)
    
    // Fetch all image URLs from database
    console.log('Fetching image URLs from database...')
    const { data: dbItems, error } = await supabase
      .from('closet_items')
      .select('image_url')
    
    if (error) {
      throw new Error(`Failed to fetch database items: ${error.message}`)
    }
    
    console.log(`Total items in database: ${dbItems.length}`)
    
    // Extract public IDs from database URLs
    const dbPublicIds = new Set(
      dbItems
        .map(item => extractCloudinaryPublicId(item.image_url))
        .filter(id => id) // Remove empty strings
    )
    
    console.log(`Unique public IDs in database: ${dbPublicIds.size}`)
    
    // Calculate grace period cutoff
    const gracePeriodMs = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
    const gracePeriodCutoff = new Date(Date.now() - gracePeriodMs)
    
    // Find orphans (in Cloudinary but not in DB, and older than grace period)
    const orphans = cloudinaryImages.filter(img => {
      const notInDb = !dbPublicIds.has(img.public_id)
      const createdDate = new Date(img.created_at)
      const oldEnough = createdDate < gracePeriodCutoff
      return notInDb && oldEnough
    })
    
    console.log(`\nFound ${orphans.length} orphaned images`)
    
    if (orphans.length === 0) {
      console.log('No orphaned images to clean up. Exiting.')
      return
    }
    
    // Calculate total size
    const totalBytes = orphans.reduce((sum, img) => sum + (img.bytes || 0), 0)
    console.log(`Total storage to be freed: ${formatBytes(totalBytes)}`)
    
    // If DRY_RUN, just log results
    if (DRY_RUN) {
      console.log('\nDRY RUN - Preview of orphaned images:')
      orphans.slice(0, 10).forEach(img => {
        const age = Math.floor((Date.now() - new Date(img.created_at)) / (1000 * 60 * 60 * 24))
        console.log(`  - ${img.public_id} (${formatBytes(img.bytes || 0)}, ${age} days old)`)
      })
      if (orphans.length > 10) {
        console.log(`  ... and ${orphans.length - 10} more images`)
      }
      console.log('\nRun without --dry-run to actually delete these images.')
      return
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete orphaned images from Cloudinary!')
    const confirmed = await confirm(`Delete ${orphans.length} images (${formatBytes(totalBytes)})? (y/n): `)
    
    if (!confirmed) {
      console.log('Deletion cancelled.')
      return
    }
    
    // Delete orphans in batches
    let deletedCount = 0
    let errorCount = 0
    let freedBytes = 0
    const errors = []
    
    console.log('\nDeleting orphaned images...')
    
    for (let i = 0; i < orphans.length; i += BATCH_SIZE) {
      const batch = orphans.slice(i, i + BATCH_SIZE)
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(orphans.length / BATCH_SIZE)}`)
      
      for (const img of batch) {
        try {
          await cloudinary.uploader.destroy(img.public_id)
          deletedCount++
          freedBytes += img.bytes || 0
          console.log(`  ✓ Deleted: ${img.public_id} (${formatBytes(img.bytes || 0)})`)
        } catch (error) {
          errorCount++
          const errorMsg = `Failed to delete ${img.public_id}: ${error.message}`
          errors.push(errorMsg)
          console.error(`  ✗ ${errorMsg}`)
        }
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('Cleanup Summary')
    console.log('='.repeat(50))
    console.log(`Total orphans found: ${orphans.length}`)
    console.log(`Successfully deleted: ${deletedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Storage freed: ${formatBytes(freedBytes)}`)
    
    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }
    
    console.log('\nCleanup complete!')
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
cleanupOrphanedImages()
