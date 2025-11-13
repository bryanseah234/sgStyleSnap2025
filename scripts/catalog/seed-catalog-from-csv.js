#!/usr/bin/env node
/**
 * Seed Catalog from CSV - StyleSnap
 * 
 * Reads clothing items from a CSV file and uploads images from a directory to Cloudinary,
 * then populates the catalog_items table in Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { parse } from 'csv-parse/sync'
import { FormData, fetch } from 'undici'
import mime from 'mime-types'

// Load environment variables
config()

// Validate environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET'
]

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v])
if (missingEnvVars.length) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(v => console.error(`   - ${v}`))
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

// Valid sets
const VALID_CLOTHING_TYPES = [
  'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie',
  'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants',
  'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt',
  'T-Shirt', 'Top', 'Undershirt'
]
const VALID_CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']
const VALID_SEASONS = ['spring', 'summer', 'fall', 'winter', 'all-season']

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imagePath, filename) {
  try {
    console.log(`  📤 Uploading ${filename} to Cloudinary...`)

    const buffer = readFileSync(imagePath)
    const contentType = mime.lookup(imagePath) || 'application/octet-stream'

    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: contentType }), filename)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'closet_items') // adjust folder name here
    formData.append('public_id', filename.replace(/\.[^/.]+$/, ''))

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${text}`)
    }

    const data = await response.json()
    console.log(`  ✅ Uploaded: ${data.secure_url}`)

    return {
      imageUrl: data.secure_url,
      thumbnailUrl: data.eager?.[0]?.secure_url || data.secure_url,
      cloudinaryPublicId: data.public_id
    }
  } catch (err) {
    console.error(`  ❌ Failed to upload ${filename}: ${err.message}`)
    throw err
  }
}

/**
 * Validate CSV row
 */
function validateRow(row, rowIndex) {
  const errors = []
  if (!row.name) errors.push(`Row ${rowIndex}: Missing 'name'`)
  if (!row.image_filename) errors.push(`Row ${rowIndex}: Missing 'image_filename'`)

  if (row.clothing_type && !VALID_CLOTHING_TYPES.includes(row.clothing_type))
    errors.push(`Row ${rowIndex}: Invalid clothing_type '${row.clothing_type}'`)
  if (row.category && !VALID_CATEGORIES.includes(row.category))
    errors.push(`Row ${rowIndex}: Invalid category '${row.category}'`)
  if (row.season && !VALID_SEASONS.includes(row.season))
    errors.push(`Row ${rowIndex}: Invalid season '${row.season}'`)

  return errors
}

/**
 * Parse CSV
 */
function parseCSV(csvPath) {
  console.log(`📖 Reading CSV file: ${csvPath}`)
  if (!existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`)
  const file = readFileSync(csvPath, 'utf-8')
  const records = parse(file, { columns: true, skip_empty_lines: true, trim: true })
  console.log(`✅ Parsed ${records.length} items from CSV\n`)
  return records
}

/**
 * Process a catalog item
 */
async function processCatalogItem(row, rowIndex, imagesDir) {
  const itemName = row.name
  try {
    const validationErrors = validateRow(row, rowIndex)
    if (validationErrors.length) {
      validationErrors.forEach(e => console.error(`  ⚠️  ${e}`))
      return { success: false, name: itemName, error: 'Validation failed' }
    }

    const imagePath = join(imagesDir, row.image_filename)
    if (!existsSync(imagePath)) {
      console.error(`  ❌ Image not found: ${imagePath}`)
      return { success: false, name: itemName, error: 'Image not found' }
    }

    const { imageUrl, thumbnailUrl, cloudinaryPublicId } =
      await uploadToCloudinary(imagePath, row.image_filename)

    const secondary_colors = row.secondary_colors
      ? row.secondary_colors.split('|').map(s => s.trim()).filter(Boolean)
      : []
    const style_tags = row.style_tags
      ? row.style_tags.split('|').map(s => s.trim()).filter(Boolean)
      : []
    const weather_tags = row.weather_tags
      ? row.weather_tags.split('|').map(s => s.trim()).filter(Boolean)
      : []

    const catalogItem = {
      name: row.name.trim(),
      clothing_type: row.clothing_type || null,
      category: row.category || 'top',
      brand: row.brand || null,
      size: row.size || null,
      primary_color: row.primary_color || null,
      color: row.primary_color || null,
      secondary_colors: secondary_colors.length ? secondary_colors : null,
      style: style_tags.length ? style_tags : [],
      tags: weather_tags.length ? weather_tags : [],
      season: VALID_SEASONS.includes(row.season) ? row.season : 'all-season',
      description: row.description || null,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      cloudinary_public_id: cloudinaryPublicId,
      privacy: row.privacy || 'public',
      is_active: true
    }

    const { data, error } = await supabase
      .from('catalog_items')
      .insert(catalogItem)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        console.log(`  ⚠️  Item already exists: ${itemName}`)
        return { success: false, name: itemName, error: 'Duplicate item' }
      }
      throw error
    }

    console.log(`  ✅ Added: ${itemName} (ID: ${data.id})`)
    return { success: true, name: itemName, id: data.id }
  } catch (err) {
    console.error(`  ❌ Failed to process ${itemName}: ${err.message}`)
    return { success: false, name: itemName, error: err.message }
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('❌ Missing required arguments\n')
    console.log('Usage:')
    console.log('  node seed-catalog-from-csv.js <csv-file> <images-directory>\n')
    process.exit(1)
  }

  const csvPath = resolve(args[0])
  const imagesDir = resolve(args[1])

  console.log('🌱 StyleSnap Catalog Seeder')
  console.log('━'.repeat(50))
  console.log(`CSV File: ${csvPath}`)
  console.log(`Images Directory: ${imagesDir}`)
  console.log('━'.repeat(50) + '\n')

  if (!existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    process.exit(1)
  }
  if (!existsSync(imagesDir) || !statSync(imagesDir).isDirectory()) {
    console.error(`❌ Images path invalid: ${imagesDir}`)
    process.exit(1)
  }

  try {
    const items = parseCSV(csvPath)
    if (!items.length) {
      console.log('⚠️  No items in CSV')
      process.exit(0)
    }

    console.log(`🔄 Processing ${items.length} catalog items...\n`)
    const results = []
    for (let i = 0; i < items.length; i++) {
      console.log(`[${i + 1}/${items.length}] Processing: ${items[i].name}`)
      const result = await processCatalogItem(items[i], i + 1, imagesDir)
      results.push(result)
      console.log('')
    }

    console.log('━'.repeat(50))
    console.log('📊 Summary')
    console.log('━'.repeat(50))
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    console.log(`✅ Successfully added: ${successful.length}`)
    console.log(`❌ Failed: ${failed.length}`)
    if (failed.length) {
      console.log('\n⚠️  Failed items:')
      failed.forEach(item => console.log(`  - ${item.name}: ${item.error}`))
    }
    console.log('\n🎉 Catalog seeding complete!')
    process.exit(failed.length ? 1 : 0)
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message)
    process.exit(1)
  }
}

main()
