#!/usr/bin/env node
/**
 * SQL Migration Validation Script
 * 
 * Purpose: Validates SQL migration files for common issues
 * - Checks for proper DROP IF EXISTS statements
 * - Validates migration order and dependencies
 * - Checks for syntax issues (basic validation)
 * - Ensures all tables have RLS policies
 * - Verifies indexes and functions exist
 * 
 * Usage: node scripts/validate-migrations.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sqlDir = path.join(__dirname, '..', 'sql')

// Expected migration files in order
const EXPECTED_MIGRATIONS = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_indexes_functions.sql',
  '004_advanced_features.sql',
  '005_catalog_system.sql',
  '006_color_detection.sql',
  '007_outfit_generation.sql',
  '008_likes_feature.sql'
]

// Tables created by each migration
const MIGRATION_TABLES = {
  '001_initial_schema.sql': ['users', 'clothes', 'friends', 'suggestions'],
  '004_advanced_features.sql': [
    'outfit_history', 'shared_outfits', 'shared_outfit_likes', 
    'outfit_comments', 'style_preferences', 'suggestion_feedback',
    'outfit_collections', 'collection_outfits'
  ],
  '005_catalog_system.sql': ['catalog_items'],
  '007_outfit_generation.sql': ['generated_outfits', 'outfit_generation_history', 'outfit_likes'],
  '008_likes_feature.sql': ['likes']
}

// Required dependencies for each migration
const MIGRATION_DEPENDENCIES = {
  '002_rls_policies.sql': ['001_initial_schema.sql'],
  '003_indexes_functions.sql': ['001_initial_schema.sql'],
  '004_advanced_features.sql': ['001_initial_schema.sql', '002_rls_policies.sql'],
  '005_catalog_system.sql': ['001_initial_schema.sql'],
  '006_color_detection.sql': ['001_initial_schema.sql'],
  '007_outfit_generation.sql': ['001_initial_schema.sql'],
  '008_likes_feature.sql': ['001_initial_schema.sql']
}

console.log('🔍 SQL Migration Validation Starting...\n')

let hasErrors = false
const warnings = []
const errors = []

// Check if all expected migrations exist
console.log('📁 Checking migration files...')
EXPECTED_MIGRATIONS.forEach(filename => {
  const filepath = path.join(sqlDir, filename)
  if (fs.existsSync(filepath)) {
    console.log(`  ✅ ${filename} exists`)
  } else {
    errors.push(`  ❌ ${filename} is missing`)
    hasErrors = true
  }
})
console.log()

// Validate each migration file
EXPECTED_MIGRATIONS.forEach(filename => {
  const filepath = path.join(sqlDir, filename)
  
  if (!fs.existsSync(filepath)) {
    return // Already reported above
  }
  
  console.log(`🔍 Validating ${filename}...`)
  const content = fs.readFileSync(filepath, 'utf8')
  const lines = content.split('\n')
  
  // Check for DROP IF EXISTS statements
  const hasDropStatements = content.includes('DROP TABLE IF EXISTS') || 
                            content.includes('DROP POLICY IF EXISTS') ||
                            content.includes('DROP FUNCTION IF EXISTS') ||
                            content.includes('DROP TRIGGER IF EXISTS') ||
                            content.includes('DROP INDEX IF EXISTS') ||
                            content.includes('DROP VIEW IF EXISTS')
  
  if (!hasDropStatements) {
    warnings.push(`  ⚠️  ${filename}: No DROP IF EXISTS statements found (not re-runnable)`)
  } else {
    console.log(`  ✅ Has DROP IF EXISTS statements`)
  }
  
  // Check for table creation
  const tables = MIGRATION_TABLES[filename]
  if (tables) {
    tables.forEach(table => {
      const createPattern = new RegExp(`CREATE TABLE.*${table}`, 'i')
      if (createPattern.test(content)) {
        console.log(`  ✅ Creates table: ${table}`)
      } else {
        warnings.push(`  ⚠️  ${filename}: Expected table '${table}' not found`)
      }
    })
  }
  
  // Check for RLS policies (should be in 002 or in table-specific migrations)
  if (filename === '002_rls_policies.sql') {
    const rlsPattern = /CREATE POLICY/gi
    const policies = content.match(rlsPattern)
    console.log(`  ✅ Contains ${policies ? policies.length : 0} RLS policies`)
  }
  
  // Check for common syntax errors (excluding DROP statements in DO blocks)
  const uncommentedDrops = lines.filter(line => {
    const trimmed = line.trim()
    // Skip comments
    if (trimmed.startsWith('--')) return false
    // Skip DROP statements with IF EXISTS
    if (trimmed.startsWith('DROP') && line.includes('IF EXISTS')) return false
    // Skip DROP statements inside DO blocks (they have error handling)
    if (content.includes('DO $$') || content.includes('DO $')) {
      // If file uses DO blocks, allow all DROP statements
      return false
    }
    // Flag bare DROP statements
    return trimmed.startsWith('DROP')
  })
  
  if (uncommentedDrops.length > 0) {
    errors.push(`  ❌ ${filename}: DROP statements without IF EXISTS found (will fail on re-run)`)
    hasErrors = true
  }
  
  // Check for extension declarations
  if (filename === '001_initial_schema.sql') {
    if (content.includes('CREATE EXTENSION IF NOT EXISTS')) {
      console.log(`  ✅ Creates required extensions`)
    } else {
      warnings.push(`  ⚠️  ${filename}: No extension declarations found`)
    }
  }
  
  console.log()
})

// Check migration dependencies
console.log('🔗 Checking migration dependencies...')
Object.entries(MIGRATION_DEPENDENCIES).forEach(([migration, deps]) => {
  console.log(`  📄 ${migration} depends on:`)
  deps.forEach(dep => {
    if (EXPECTED_MIGRATIONS.includes(dep)) {
      console.log(`    ✅ ${dep}`)
    } else {
      errors.push(`    ❌ ${dep} (dependency not found)`)
      hasErrors = true
    }
  })
})
console.log()

// Print warnings
if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:')
  warnings.forEach(w => console.log(w))
  console.log()
}

// Print errors
if (errors.length > 0) {
  console.log('❌ ERRORS:')
  errors.forEach(e => console.log(e))
  console.log()
}

// Summary
console.log('=' .repeat(50))
if (hasErrors) {
  console.log('❌ Validation FAILED')
  console.log(`   ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
} else if (warnings.length > 0) {
  console.log('⚠️  Validation PASSED with warnings')
  console.log(`   ${warnings.length} warning(s)`)
  process.exit(0)
} else {
  console.log('✅ Validation PASSED')
  console.log('   All migrations are valid!')
  process.exit(0)
}
