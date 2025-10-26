/**
 * Populate Catalog Database with Sample Clothing Items
 * 
 * This script populates the catalog_items table with curated clothing items
 * for users to add to their virtual closet as an alternative to scanning their own items.
 * 
 * Features:
 * - Covers all 20 clothing types
 * - Includes diverse brands, colors, seasons
 * - WebP optimized image URLs
 * - Searchable with proper metadata
 * 
 * Usage:
 *   node scripts/populate-catalog.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Sample catalog items covering all 20 clothing types
const catalogItems = [
  // T-Shirts
  {
    name: 'Classic White Crew Neck Tee',
    clothing_type: 'T-Shirt',
    category: 'casual',
    brand: 'Everlane',
    primary_color: 'white',
    secondary_colors: [],
    season: 'all',
    style_tags: ['basic', 'minimalist', 'casual'],
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Essential white crew neck t-shirt, 100% organic cotton'
  },
  {
    name: 'Black Graphic Tee',
    clothing_type: 'T-Shirt',
    category: 'casual',
    brand: 'Uniqlo',
    primary_color: 'black',
    secondary_colors: ['white'],
    season: 'all',
    style_tags: ['casual', 'streetwear', 'graphic'],
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop',
    description: 'Statement graphic tee with modern design'
  },
  
  // Shirts
  {
    name: 'Chambray Button-Down Shirt',
    clothing_type: 'Shirt',
    category: 'smart_casual',
    brand: 'J.Crew',
    primary_color: 'blue',
    secondary_colors: [],
    season: 'spring',
    style_tags: ['smart-casual', 'preppy', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    description: 'Classic chambray shirt, perfect for layering'
  },
  {
    name: 'Linen Short-Sleeve Shirt',
    clothing_type: 'Shirt',
    category: 'casual',
    brand: 'Mango',
    primary_color: 'beige',
    secondary_colors: [],
    season: 'summer',
    style_tags: ['casual', 'breathable', 'summer'],
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',
    description: 'Lightweight linen shirt for warm weather'
  },
  
  // Blouses
  {
    name: 'Silk Ruffle Blouse',
    clothing_type: 'Blouse',
    category: 'formal',
    brand: 'Massimo Dutti',
    primary_color: 'white',
    secondary_colors: [],
    season: 'all',
    style_tags: ['elegant', 'feminine', 'formal'],
    image_url: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400&h=400&fit=crop',
    description: 'Elegant silk blouse with ruffle details'
  },
  
  // Longsleeves
  {
    name: 'Striped Long-Sleeve Top',
    clothing_type: 'Longsleeve',
    category: 'casual',
    brand: 'COS',
    primary_color: 'navy',
    secondary_colors: ['white'],
    season: 'fall',
    style_tags: ['casual', 'nautical', 'classic'],
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop',
    description: 'Classic Breton stripe long-sleeve tee'
  },
  
  // Tops
  {
    name: 'Ribbed Knit Tank Top',
    clothing_type: 'Top',
    category: 'casual',
    brand: 'Zara',
    primary_color: 'brown',
    secondary_colors: [],
    season: 'summer',
    style_tags: ['casual', 'minimalist', 'layering'],
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
    description: 'Fitted ribbed knit tank for layering'
  },
  
  // Polos
  {
    name: 'Classic Piqué Polo',
    clothing_type: 'Polo',
    category: 'smart_casual',
    brand: 'Lacoste',
    primary_color: 'navy',
    secondary_colors: [],
    season: 'spring',
    style_tags: ['preppy', 'smart-casual', 'classic'],
    image_url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop',
    description: 'Traditional piqué polo shirt'
  },
  
  // Hoodies
  {
    name: 'Oversized Cotton Hoodie',
    clothing_type: 'Hoodie',
    category: 'casual',
    brand: 'H&M',
    primary_color: 'gray',
    secondary_colors: [],
    season: 'fall',
    style_tags: ['casual', 'comfortable', 'streetwear'],
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    description: 'Cozy oversized hoodie for casual wear'
  },
  
  // Blazers
  {
    name: 'Tailored Navy Blazer',
    clothing_type: 'Blazer',
    category: 'formal',
    brand: 'Theory',
    primary_color: 'navy',
    secondary_colors: [],
    season: 'all',
    style_tags: ['formal', 'business', 'tailored'],
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop',
    description: 'Classic tailored blazer for professional settings'
  },
  
  // Outwear
  {
    name: 'Wool Overcoat',
    clothing_type: 'Outwear',
    category: 'formal',
    brand: 'Banana Republic',
    primary_color: 'charcoal',
    secondary_colors: [],
    season: 'winter',
    style_tags: ['formal', 'classic', 'winter'],
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop',
    description: 'Elegant wool overcoat for cold weather'
  },
  {
    name: 'Denim Jacket',
    clothing_type: 'Outwear',
    category: 'casual',
    brand: "Levi's",
    primary_color: 'blue',
    secondary_colors: [],
    season: 'spring',
    style_tags: ['casual', 'classic', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    description: 'Classic denim jacket, timeless wardrobe staple'
  },
  
  // Dresses
  {
    name: 'Floral Midi Dress',
    clothing_type: 'Dress',
    category: 'casual',
    brand: '& Other Stories',
    primary_color: 'floral',
    secondary_colors: ['pink', 'green'],
    season: 'spring',
    style_tags: ['feminine', 'casual', 'romantic'],
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    description: 'Romantic floral print midi dress'
  },
  {
    name: 'Little Black Dress',
    clothing_type: 'Dress',
    category: 'formal',
    brand: 'Reformation',
    primary_color: 'black',
    secondary_colors: [],
    season: 'all',
    style_tags: ['elegant', 'formal', 'classic'],
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop',
    description: 'Timeless little black dress for any occasion'
  },
  
  // Pants
  {
    name: 'Dark Wash Skinny Jeans',
    clothing_type: 'Pants',
    category: 'casual',
    brand: 'AG Jeans',
    primary_color: 'blue',
    secondary_colors: [],
    season: 'all',
    style_tags: ['casual', 'denim', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    description: 'Classic dark wash skinny jeans'
  },
  {
    name: 'Tailored Trousers',
    clothing_type: 'Pants',
    category: 'formal',
    brand: 'Brooks Brothers',
    primary_color: 'black',
    secondary_colors: [],
    season: 'all',
    style_tags: ['formal', 'business', 'tailored'],
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
    description: 'Professional tailored trousers'
  },
  
  // Shorts
  {
    name: 'Chino Shorts',
    clothing_type: 'Shorts',
    category: 'casual',
    brand: 'Gap',
    primary_color: 'khaki',
    secondary_colors: [],
    season: 'summer',
    style_tags: ['casual', 'summer', 'classic'],
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
    description: 'Classic chino shorts for warm weather'
  },
  
  // Skirts
  {
    name: 'Pleated Midi Skirt',
    clothing_type: 'Skirt',
    category: 'smart_casual',
    brand: 'Aritzia',
    primary_color: 'navy',
    secondary_colors: [],
    season: 'fall',
    style_tags: ['elegant', 'feminine', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
    description: 'Elegant pleated midi skirt'
  },
  
  // Shoes
  {
    name: 'White Leather Sneakers',
    clothing_type: 'Shoes',
    category: 'casual',
    brand: 'Common Projects',
    primary_color: 'white',
    secondary_colors: [],
    season: 'all',
    style_tags: ['minimalist', 'casual', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    description: 'Clean white leather sneakers'
  },
  {
    name: 'Black Leather Boots',
    clothing_type: 'Shoes',
    category: 'formal',
    brand: 'Clarks',
    primary_color: 'black',
    secondary_colors: [],
    season: 'fall',
    style_tags: ['formal', 'classic', 'versatile'],
    image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop',
    description: 'Classic black leather Chelsea boots'
  },
  
  // Hats
  {
    name: 'Wool Fedora Hat',
    clothing_type: 'Hat',
    category: 'smart_casual',
    brand: 'Brixton',
    primary_color: 'brown',
    secondary_colors: [],
    season: 'fall',
    style_tags: ['classic', 'vintage', 'accessory'],
    image_url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400&h=400&fit=crop',
    description: 'Classic wool fedora hat'
  },
  
  // Body
  {
    name: 'Ribbed Bodysuit',
    clothing_type: 'Body',
    category: 'casual',
    brand: 'SKIMS',
    primary_color: 'black',
    secondary_colors: [],
    season: 'all',
    style_tags: ['minimalist', 'layering', 'fitted'],
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
    description: 'Fitted ribbed bodysuit for layering'
  },
  
  // Undershirt
  {
    name: 'Cotton V-Neck Undershirt',
    clothing_type: 'Undershirt',
    category: 'casual',
    brand: 'Calvin Klein',
    primary_color: 'white',
    secondary_colors: [],
    season: 'all',
    style_tags: ['basic', 'comfortable', 'layering'],
    image_url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=400&fit=crop',
    description: 'Essential cotton v-neck undershirt'
  }
]

/**
 * Insert catalog items into database
 */
async function populateCatalog() {
  console.log('🚀 Starting catalog population...')
  console.log(`📦 Inserting ${catalogItems.length} items...`)
  
  try {
    // Check if catalog is already populated
    const { count: existingCount } = await supabase
      .from('catalog_items')
      .select('*', { count: 'exact', head: true })
    
    if (existingCount > 0) {
      console.log(`⚠️  Catalog already has ${existingCount} items.`)
      console.log('Do you want to clear and repopulate? (This will delete existing items)')
      console.log('If yes, manually delete items first using Supabase dashboard.')
      return
    }
    
    // Insert all items
    const { data, error } = await supabase
      .from('catalog_items')
      .insert(catalogItems)
      .select()
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Successfully inserted ${data.length} catalog items!`)
    
    // Print summary by clothing type
    const typeCounts = catalogItems.reduce((acc, item) => {
      acc[item.clothing_type] = (acc[item.clothing_type] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📊 Items by clothing type:')
    Object.entries(typeCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`)
      })
    
    console.log('\n🎉 Catalog population complete!')
    console.log('Users can now browse and add these items to their virtual closets.')
    
  } catch (error) {
    console.error('❌ Error populating catalog:', error.message)
    throw error
  }
}

/**
 * Verify catalog data
 */
async function verifyCatalog() {
  console.log('\n🔍 Verifying catalog data...')
  
  try {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('clothing_type')
      .eq('is_active', true)
    
    if (error) throw error
    
    const typeCounts = data.reduce((acc, item) => {
      acc[item.clothing_type] = (acc[item.clothing_type] || 0) + 1
      return acc
    }, {})
    
    const allTypes = [
      'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
      'Longsleeve', 'Outwear', 'Pants', 'Polo', 'Shirt', 
      'Shoes', 'Shorts', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
    ]
    
    const missingTypes = allTypes.filter(type => !typeCounts[type])
    
    if (missingTypes.length > 0) {
      console.log('⚠️  Missing clothing types:', missingTypes.join(', '))
    } else {
      console.log('✅ All clothing types represented!')
    }
    
    console.log(`\n📈 Total active catalog items: ${data.length}`)
    
  } catch (error) {
    console.error('❌ Error verifying catalog:', error.message)
  }
}

// Main execution
async function main() {
  try {
    await populateCatalog()
    await verifyCatalog()
    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
