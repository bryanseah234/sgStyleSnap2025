#!/usr/bin/env node
/**
 * Seed Catalog from CSV - StyleSnap
 * 
 * Reads clothing items from a CSV file and uploads images from a directory to Cloudinary,
 * then populates the catalog_items table in Supabase.
 * 
 * Features:
 * - Reads from user-provided CSV file
 * - Uploads images from specified directory to Cloudinary
 * - Validates data before inserting
 * - Sets privacy to 'public' by default
 * - Supports all 20 clothing types
 * - Prevents duplicate items
 * 
 * CSV Format:
 * name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
 * 
 * Usage:
 *   node scripts/seed-catalog-from-csv.js <csv-file> <images-directory>
 * 
 * Example:
 *   node scripts/seed-catalog-from-csv.js ./catalog-items.csv ./catalog-images/
 * 
 * Requirements:
 * - VITE_SUPABASE_URL in .env
 * - VITE_SUPABASE_ANON_KEY in .env
 * - VITE_CLOUDINARY_CLOUD_NAME in .env
 * - VITE_CLOUDINARY_UPLOAD_PRESET in .env
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { parse } from 'csv-parse/sync'
import FormData from 'form-data'
import fetch from 'node-fetch'

// Load environment variables
config()

// Validate environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET'
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`))
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Cloudinary configuration
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`
const CLOUDINARY_UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Valid clothing types (from Migration 009)
const VALID_CLOTHING_TYPES = [
  'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie',
  'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants',
  'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt',
  'T-Shirt', 'Top', 'Undershirt'
]

// Valid categories (from Migration 005)
const VALID_CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']

// Valid seasons
const VALID_SEASONS = ['spring', 'summer', 'fall', 'winter', 'all']

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imagePath, filename) {
  try {
    console.log(`  📤 Uploading ${filename} to Cloudinary...`)
    
    const formData = new FormData()
    formData.append('file', readFileSync(imagePath))
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'catalog-items')
    formData.append('public_id', filename.replace(/\.[^/.]+$/, '')) // Remove extension

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log(`  ✅ Uploaded: ${data.secure_url}`)
    
    return {
      imageUrl: data.secure_url,
      thumbnailUrl: data.eager?.[0]?.secure_url || data.secure_url,
      cloudinaryPublicId: data.public_id
    }
  } catch (error) {
    console.error(`  ❌ Failed to upload ${filename}:`, error.message)
    throw error
  }
}

/**
 * Validate CSV row data
 */
function validateRow(row, rowIndex) {
  const errors = []

  // Required fields
  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowIndex}: Missing required field 'name'`)
  }
  if (!row.image_filename || row.image_filename.trim() === '') {
    errors.push(`Row ${rowIndex}: Missing required field 'image_filename'`)
  }

  // Validate clothing_type
  if (row.clothing_type && !VALID_CLOTHING_TYPES.includes(row.clothing_type)) {
    errors.push(`Row ${rowIndex}: Invalid clothing_type '${row.clothing_type}'. Must be one of: ${VALID_CLOTHING_TYPES.join(', ')}`)
  }

  // Validate category
  if (row.category && !VALID_CATEGORIES.includes(row.category)) {
    errors.push(`Row ${rowIndex}: Invalid category '${row.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`)
  }

  // Validate season
  if (row.season && !VALID_SEASONS.includes(row.season)) {
    errors.push(`Row ${rowIndex}: Invalid season '${row.season}'. Must be one of: ${VALID_SEASONS.join(', ')}`)
  }

  return errors
}

/**
 * Parse CSV file
 */
function parseCSV(csvPath) {
  try {
    console.log(`📖 Reading CSV file: ${csvPath}`)
    
    if (!existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`)
    }

    const fileContent = readFileSync(csvPath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    console.log(`✅ Parsed ${records.length} items from CSV\n`)
    return records
  } catch (error) {
    console.error('❌ Error parsing CSV:', error.message)
    throw error
  }
}

/**
 * Process a single catalog item
 */
async function processCatalogItem(row, rowIndex, imagesDir) {
  const itemName = row.name

  try {
    // Validate row
    const validationErrors = validateRow(row, rowIndex)
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => console.error(`  ⚠️  ${err}`))
      return { success: false, name: itemName, error: 'Validation failed' }
    }

    // Find image file
    const imagePath = join(imagesDir, row.image_filename)
    if (!existsSync(imagePath)) {
      console.error(`  ❌ Image not found: ${imagePath}`)
      return { success: false, name: itemName, error: 'Image not found' }
    }

    // Upload image to Cloudinary
    const { imageUrl, thumbnailUrl, cloudinaryPublicId } = await uploadToCloudinary(
      imagePath,
      row.image_filename
    )

    // Parse array fields (pipe-delimited)
    const secondary_colors = row.secondary_colors
      ? row.secondary_colors.split('|').map(s => s.trim()).filter(Boolean)
      : []
    
    const style_tags = row.style_tags
      ? row.style_tags.split('|').map(s => s.trim()).filter(Boolean)
      : []
    
    const weather_tags = row.weather_tags
      ? row.weather_tags.split('|').map(s => s.trim()).filter(Boolean)
      : []

    // Prepare catalog item data
    const catalogItem = {
      name: row.name.trim(),
      clothing_type: row.clothing_type || null,
      category: row.category || 'top',
      brand: row.brand || null,
      size: row.size || null,
      primary_color: row.primary_color || null,
      secondary_colors: secondary_colors.length > 0 ? secondary_colors : null,
      style: style_tags.length > 0 ? style_tags : null,
      tags: weather_tags.length > 0 ? weather_tags : null,
      season: row.season || 'all',
      description: row.description || null,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      cloudinary_public_id: cloudinaryPublicId,
      privacy: row.privacy || 'public',
      is_active: true
    }

    // Insert into database
    const { data, error } = await supabase
      .from('catalog_items')
      .insert(catalogItem)
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        console.log(`  ⚠️  Item already exists: ${itemName}`)
        return { success: false, name: itemName, error: 'Duplicate item' }
      }
      throw error
    }

    console.log(`  ✅ Added: ${itemName} (ID: ${data.id})`)
    return { success: true, name: itemName, id: data.id }

  } catch (error) {
    console.error(`  ❌ Failed to process ${itemName}:`, error.message)
    return { success: false, name: itemName, error: error.message }
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)

  // Validate arguments
  if (args.length < 2) {
    console.error('❌ Missing required arguments\n')
    console.log('Usage:')
    console.log('  node scripts/seed-catalog-from-csv.js <csv-file> <images-directory>\n')
    console.log('Example:')
    console.log('  node scripts/seed-catalog-from-csv.js ./catalog-items.csv ./catalog-images/\n')
    process.exit(1)
  }

  const csvPath = resolve(args[0])
  const imagesDir = resolve(args[1])

  console.log('🌱 StyleSnap Catalog Seeder')
  console.log('━'.repeat(50))
  console.log(`CSV File: ${csvPath}`)
  console.log(`Images Directory: ${imagesDir}`)
  console.log('━'.repeat(50) + '\n')

  // Validate paths
  if (!existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  if (!existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`)
    process.exit(1)
  }

  if (!statSync(imagesDir).isDirectory()) {
    console.error(`❌ Images path is not a directory: ${imagesDir}`)
    process.exit(1)
  }

  try {
    // Parse CSV
    const items = parseCSV(csvPath)

    if (items.length === 0) {
      console.log('⚠️  No items found in CSV file')
      process.exit(0)
    }

    // Process each item
    console.log(`🔄 Processing ${items.length} catalog items...\n`)
    const results = []

    for (let i = 0; i < items.length; i++) {
      console.log(`[${i + 1}/${items.length}] Processing: ${items[i].name}`)
      const result = await processCatalogItem(items[i], i + 1, imagesDir)
      results.push(result)
      console.log('') // Add blank line between items
    }

    // Print summary
    console.log('━'.repeat(50))
    console.log('📊 Summary')
    console.log('━'.repeat(50))

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`✅ Successfully added: ${successful.length}`)
    console.log(`❌ Failed: ${failed.length}`)

    if (failed.length > 0) {
      console.log('\n⚠️  Failed items:')
      failed.forEach(item => {
        console.log(`  - ${item.name}: ${item.error}`)
      })
    }

    console.log('\n🎉 Catalog seeding complete!')
    console.log('Users can now browse these items at /catalog')

    process.exit(failed.length > 0 ? 1 : 0)

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run main function
main()
