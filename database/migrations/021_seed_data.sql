-- Migration 021: Seed Data
-- This file inserts initial categories, colors, styles, and brands
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- CLEAR EXISTING SEED DATA
-- ============================================
-- Clear existing seed data (in reverse dependency order)
DELETE FROM wishlist WHERE catalog_item_id IN (SELECT id FROM catalog_items);
DELETE FROM catalog_items;
DELETE FROM clothing_likes;
DELETE FROM outfit_likes;
DELETE FROM activities;
DELETE FROM notifications;
DELETE FROM friend_requests;
DELETE FROM friends;
DELETE FROM outfit_items;
DELETE FROM outfits;
DELETE FROM clothes;
DELETE FROM users WHERE id NOT IN (SELECT id FROM auth.users);
DELETE FROM styles;
DELETE FROM colors;
DELETE FROM brands;
DELETE FROM categories;

-- ============================================
-- INSERT CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Tops', 'tops', 'Shirts, blouses, t-shirts, and other upper body garments', 'shirt', '#3B82F6', 1),
('Bottoms', 'bottoms', 'Pants, jeans, skirts, shorts, and other lower body garments', 'pants', '#10B981', 2),
('Shoes', 'shoes', 'Sneakers, boots, heels, flats, and other footwear', 'shoe', '#F59E0B', 3),
('Outerwear', 'outerwear', 'Jackets, coats, blazers, and other outer garments', 'coat', '#8B5CF6', 4),
('Accessories', 'accessories', 'Bags, jewelry, hats, scarves, and other accessories', 'bag', '#EF4444', 5),
('Dresses', 'dresses', 'One-piece garments for women', 'dress', '#EC4899', 6),
('Activewear', 'activewear', 'Clothing designed for sports and physical activities', 'activity', '#06B6D4', 7),
('Underwear', 'underwear', 'Intimate apparel and undergarments', 'underwear', '#84CC16', 8),
('Sleepwear', 'sleepwear', 'Clothing worn for sleeping', 'moon', '#6366F1', 9),
('Swimwear', 'swimwear', 'Clothing for swimming and water activities', 'waves', '#14B8A6', 10);

-- ============================================
-- INSERT COLORS
-- ============================================
INSERT INTO colors (name, hex_code, rgb_code) VALUES
('Black', '#000000', 'rgb(0, 0, 0)'),
('White', '#FFFFFF', 'rgb(255, 255, 255)'),
('Gray', '#808080', 'rgb(128, 128, 128)'),
('Navy', '#000080', 'rgb(0, 0, 128)'),
('Brown', '#A52A2A', 'rgb(165, 42, 42)'),
('Beige', '#F5F5DC', 'rgb(245, 245, 220)'),
('Red', '#FF0000', 'rgb(255, 0, 0)'),
('Blue', '#0000FF', 'rgb(0, 0, 255)'),
('Green', '#008000', 'rgb(0, 128, 0)'),
('Yellow', '#FFFF00', 'rgb(255, 255, 0)'),
('Orange', '#FFA500', 'rgb(255, 165, 0)'),
('Purple', '#800080', 'rgb(128, 0, 128)'),
('Pink', '#FFC0CB', 'rgb(255, 192, 203)'),
('Maroon', '#800000', 'rgb(128, 0, 0)'),
('Olive', '#808000', 'rgb(128, 128, 0)'),
('Teal', '#008080', 'rgb(0, 128, 128)'),
('Cyan', '#00FFFF', 'rgb(0, 255, 255)'),
('Magenta', '#FF00FF', 'rgb(255, 0, 255)'),
('Lime', '#00FF00', 'rgb(0, 255, 0)'),
('Indigo', '#4B0082', 'rgb(75, 0, 130)');

-- ============================================
-- INSERT STYLES
-- ============================================
INSERT INTO styles (name, slug, description) VALUES
('Casual', 'casual', 'Relaxed, comfortable everyday wear'),
('Formal', 'formal', 'Professional and elegant attire'),
('Sporty', 'sporty', 'Athletic and active wear'),
('Vintage', 'vintage', 'Classic and retro-inspired fashion'),
('Bohemian', 'bohemian', 'Free-spirited and artistic style'),
('Minimalist', 'minimalist', 'Clean, simple, and understated'),
('Grunge', 'grunge', 'Alternative and edgy fashion'),
('Preppy', 'preppy', 'Classic, clean, and collegiate style'),
('Gothic', 'gothic', 'Dark and dramatic fashion'),
('Streetwear', 'streetwear', 'Urban and contemporary casual wear'),
('Romantic', 'romantic', 'Feminine and delicate style'),
('Edgy', 'edgy', 'Bold and unconventional fashion'),
('Classic', 'classic', 'Timeless and traditional style'),
('Trendy', 'trendy', 'Current and fashionable'),
('Elegant', 'elegant', 'Sophisticated and refined'),
('Chic', 'chic', 'Stylish and fashionable'),
('Rustic', 'rustic', 'Natural and countryside-inspired'),
('Modern', 'modern', 'Contemporary and current'),
('Retro', 'retro', 'Inspired by past decades'),
('Avant-garde', 'avant-garde', 'Experimental and artistic');

-- ============================================
-- INSERT BRANDS
-- ============================================
INSERT INTO brands (name, slug, description, website_url) VALUES
('Nike', 'nike', 'Just Do It - Athletic and lifestyle apparel', 'https://nike.com'),
('Adidas', 'adidas', 'Impossible is Nothing - Sports and lifestyle brand', 'https://adidas.com'),
('Zara', 'zara', 'Fast fashion for men and women', 'https://zara.com'),
('H&M', 'hm', 'Fashion and quality at the best price', 'https://hm.com'),
('Uniqlo', 'uniqlo', 'LifeWear - Simple, high-quality clothing', 'https://uniqlo.com'),
('Gap', 'gap', 'American casual clothing retailer', 'https://gap.com'),
('Levi''s', 'levis', 'Original blue jeans and denim', 'https://levi.com'),
('Calvin Klein', 'calvin-klein', 'Modern, minimalist fashion', 'https://calvinklein.com'),
('Tommy Hilfiger', 'tommy-hilfiger', 'Classic American cool', 'https://tommy.com'),
('Ralph Lauren', 'ralph-lauren', 'Timeless American style', 'https://ralphlauren.com'),
('Gucci', 'gucci', 'Italian luxury fashion house', 'https://gucci.com'),
('Prada', 'prada', 'Italian luxury fashion brand', 'https://prada.com'),
('Chanel', 'chanel', 'French luxury fashion house', 'https://chanel.com'),
('Louis Vuitton', 'louis-vuitton', 'French luxury fashion house', 'https://louisvuitton.com'),
('Versace', 'versace', 'Italian luxury fashion company', 'https://versace.com'),
('Armani', 'armani', 'Italian luxury fashion house', 'https://armani.com'),
('Dolce & Gabbana', 'dolce-gabbana', 'Italian luxury fashion house', 'https://dolcegabbana.com'),
('Balenciaga', 'balenciaga', 'French luxury fashion house', 'https://balenciaga.com'),
('Saint Laurent', 'saint-laurent', 'French luxury fashion house', 'https://ysl.com'),
('Bottega Veneta', 'bottega-veneta', 'Italian luxury fashion house', 'https://bottegaveneta.com');

-- ============================================
-- INSERT SAMPLE CATALOG ITEMS
-- ============================================
INSERT INTO catalog_items (name, description, category_id, brand_id, price, currency, image_url, thumbnail_url, is_trending, trending_score) VALUES
('Classic White T-Shirt', 'Essential cotton t-shirt in pure white', (SELECT id FROM categories WHERE slug = 'tops'), (SELECT id FROM brands WHERE slug = 'uniqlo'), 19.90, 'USD', '/catalog/white-tshirt.jpg', '/catalog/white-tshirt-thumb.jpg', true, 95),
('Blue Denim Jeans', 'Classic straight-fit denim jeans', (SELECT id FROM categories WHERE slug = 'bottoms'), (SELECT id FROM brands WHERE slug = 'levis'), 89.00, 'USD', '/catalog/blue-jeans.jpg', '/catalog/blue-jeans-thumb.jpg', true, 88),
('White Sneakers', 'Clean white canvas sneakers', (SELECT id FROM categories WHERE slug = 'shoes'), (SELECT id FROM brands WHERE slug = 'converse'), 65.00, 'USD', '/catalog/white-sneakers.jpg', '/catalog/white-sneakers-thumb.jpg', true, 92),
('Black Leather Jacket', 'Timeless black leather jacket', (SELECT id FROM categories WHERE slug = 'outerwear'), (SELECT id FROM brands WHERE slug = 'schott'), 299.00, 'USD', '/catalog/black-leather-jacket.jpg', '/catalog/black-leather-jacket-thumb.jpg', false, 45),
('Red Summer Dress', 'Flowing red midi dress for summer', (SELECT id FROM categories WHERE slug = 'dresses'), (SELECT id FROM brands WHERE slug = 'zara'), 49.90, 'USD', '/catalog/red-summer-dress.jpg', '/catalog/red-summer-dress-thumb.jpg', true, 78),
('Gray Hoodie', 'Comfortable cotton hoodie', (SELECT id FROM categories WHERE slug = 'tops'), (SELECT id FROM brands WHERE slug = 'champion'), 45.00, 'USD', '/catalog/gray-hoodie.jpg', '/catalog/gray-hoodie-thumb.jpg', false, 32),
('Black Ankle Boots', 'Stylish black ankle boots', (SELECT id FROM categories WHERE slug = 'shoes'), (SELECT id FROM brands WHERE slug = 'dr-martens'), 120.00, 'USD', '/catalog/black-ankle-boots.jpg', '/catalog/black-ankle-boots-thumb.jpg', false, 28),
('Navy Blazer', 'Professional navy blazer', (SELECT id FROM categories WHERE slug = 'outerwear'), (SELECT id FROM brands WHERE slug = 'brooks-brothers'), 199.00, 'USD', '/catalog/navy-blazer.jpg', '/catalog/navy-blazer-thumb.jpg', false, 15),
('Green Cargo Pants', 'Utility-style cargo pants in olive green', (SELECT id FROM categories WHERE slug = 'bottoms'), (SELECT id FROM brands WHERE slug = 'carhartt'), 75.00, 'USD', '/catalog/green-cargo-pants.jpg', '/catalog/green-cargo-pants-thumb.jpg', false, 22),
('Gold Statement Necklace', 'Bold gold statement necklace', (SELECT id FROM categories WHERE slug = 'accessories'), (SELECT id FROM brands WHERE slug = 'kate-spade'), 89.00, 'USD', '/catalog/gold-necklace.jpg', '/catalog/gold-necklace-thumb.jpg', false, 18);

-- ============================================
-- INSERT SAMPLE USERS (for testing)
-- ============================================
-- Note: These will only work if the corresponding auth.users exist
-- This is just for reference - actual users are created via auth signup

-- ============================================
-- VERIFY SEED DATA
-- ============================================
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Colors', COUNT(*) FROM colors
UNION ALL
SELECT 'Styles', COUNT(*) FROM styles
UNION ALL
SELECT 'Brands', COUNT(*) FROM brands
UNION ALL
SELECT 'Catalog Items', COUNT(*) FROM catalog_items;
