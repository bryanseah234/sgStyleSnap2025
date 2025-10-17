-- Seed data for StyleSnap
-- Insert initial categories, colors, styles, and brands

-- Insert categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Tops', 'tops', 'Shirts, blouses, t-shirts, and other upper body garments', 'shirt', '#3B82F6', 1),
('Bottoms', 'bottoms', 'Pants, jeans, skirts, shorts, and other lower body garments', 'pants', '#10B981', 2),
('Shoes', 'shoes', 'Sneakers, boots, heels, flats, and other footwear', 'shoe', '#F59E0B', 3),
('Outerwear', 'outerwear', 'Jackets, coats, blazers, and other outer garments', 'coat', '#8B5CF6', 4),
('Accessories', 'accessories', 'Bags, jewelry, hats, scarves, and other accessories', 'bag', '#EF4444', 5),
('Underwear', 'underwear', 'Bras, panties, undershirts, and other undergarments', 'heart', '#EC4899', 6),
('Swimwear', 'swimwear', 'Bikinis, swimsuits, and other beachwear', 'waves', '#06B6D4', 7),
('Activewear', 'activewear', 'Workout clothes, yoga pants, and athletic wear', 'activity', '#84CC16', 8);

-- Insert colors
INSERT INTO colors (name, hex_code, rgb_code) VALUES
('Black', '#000000', 'rgb(0, 0, 0)'),
('White', '#FFFFFF', 'rgb(255, 255, 255)'),
('Gray', '#6B7280', 'rgb(107, 114, 128)'),
('Navy', '#1E3A8A', 'rgb(30, 58, 138)'),
('Blue', '#3B82F6', 'rgb(59, 130, 246)'),
('Light Blue', '#60A5FA', 'rgb(96, 165, 250)'),
('Red', '#EF4444', 'rgb(239, 68, 68)'),
('Pink', '#EC4899', 'rgb(236, 72, 153)'),
('Purple', '#8B5CF6', 'rgb(139, 92, 246)'),
('Green', '#10B981', 'rgb(16, 185, 129)'),
('Yellow', '#F59E0B', 'rgb(245, 158, 11)'),
('Orange', '#F97316', 'rgb(249, 115, 22)'),
('Brown', '#A3A3A3', 'rgb(163, 163, 163)'),
('Beige', '#F5F5DC', 'rgb(245, 245, 220)'),
('Cream', '#FFF8DC', 'rgb(255, 248, 220)'),
('Maroon', '#800000', 'rgb(128, 0, 0)'),
('Burgundy', '#800020', 'rgb(128, 0, 32)'),
('Teal', '#14B8A6', 'rgb(20, 184, 166)'),
('Turquoise', '#06B6D4', 'rgb(6, 182, 212)'),
('Lavender', '#A78BFA', 'rgb(167, 139, 250)');

-- Insert styles
INSERT INTO styles (name, slug, description) VALUES
('Casual', 'casual', 'Relaxed, comfortable everyday wear'),
('Formal', 'formal', 'Business attire and formal occasions'),
('Streetwear', 'streetwear', 'Urban, trendy street fashion'),
('Vintage', 'vintage', 'Retro and classic fashion styles'),
('Bohemian', 'bohemian', 'Free-spirited, artistic style'),
('Minimalist', 'minimalist', 'Clean, simple, and understated'),
('Grunge', 'grunge', 'Alternative, edgy style'),
('Preppy', 'preppy', 'Classic, collegiate style'),
('Gothic', 'gothic', 'Dark, dramatic fashion'),
('Sporty', 'sporty', 'Athletic and active wear'),
('Romantic', 'romantic', 'Feminine, delicate style'),
('Edgy', 'edgy', 'Bold, unconventional fashion'),
('Classic', 'classic', 'Timeless, traditional style'),
('Trendy', 'trendy', 'Current fashion trends'),
('Elegant', 'elegant', 'Sophisticated, refined style'),
('Chic', 'chic', 'Stylish and fashionable'),
('Artsy', 'artsy', 'Creative, artistic expression'),
('Retro', 'retro', 'Nostalgic, past-era inspired'),
('Modern', 'modern', 'Contemporary, current style'),
('Eclectic', 'eclectic', 'Mixed, diverse style elements');

-- Insert popular brands
INSERT INTO brands (name, slug, description, website_url) VALUES
('Nike', 'nike', 'Athletic footwear and apparel', 'https://nike.com'),
('Adidas', 'adidas', 'Sports and lifestyle brand', 'https://adidas.com'),
('Zara', 'zara', 'Fast fashion retailer', 'https://zara.com'),
('H&M', 'hm', 'Swedish multinational clothing retailer', 'https://hm.com'),
('Uniqlo', 'uniqlo', 'Japanese casual wear retailer', 'https://uniqlo.com'),
('Levi''s', 'levis', 'American denim brand', 'https://levi.com'),
('Gap', 'gap', 'American clothing retailer', 'https://gap.com'),
('Forever 21', 'forever21', 'Fast fashion retailer', 'https://forever21.com'),
('Urban Outfitters', 'urban-outfitters', 'Lifestyle and clothing retailer', 'https://urbanoutfitters.com'),
('American Eagle', 'american-eagle', 'Casual clothing retailer', 'https://ae.com'),
('Hollister', 'hollister', 'Casual wear brand', 'https://hollisterco.com'),
('Abercrombie & Fitch', 'abercrombie-fitch', 'Lifestyle retailer', 'https://abercrombie.com'),
('Calvin Klein', 'calvin-klein', 'Fashion brand', 'https://calvinklein.com'),
('Tommy Hilfiger', 'tommy-hilfiger', 'American fashion brand', 'https://tommy.com'),
('Ralph Lauren', 'ralph-lauren', 'Luxury fashion brand', 'https://ralphlauren.com'),
('Gucci', 'gucci', 'Italian luxury brand', 'https://gucci.com'),
('Prada', 'prada', 'Italian luxury fashion house', 'https://prada.com'),
('Chanel', 'chanel', 'French luxury fashion house', 'https://chanel.com'),
('Louis Vuitton', 'louis-vuitton', 'French luxury brand', 'https://louisvuitton.com'),
('Versace', 'versace', 'Italian luxury fashion company', 'https://versace.com');

-- Insert sample catalog items
INSERT INTO catalog_items (name, description, category_id, brand_id, price, image_url, thumbnail_url, is_trending, trending_score) VALUES
('Classic White T-Shirt', 'Essential cotton t-shirt in white', 
 (SELECT id FROM categories WHERE slug = 'tops'), 
 (SELECT id FROM brands WHERE slug = 'uniqlo'), 
 19.90, '/images/catalog/white-tshirt.jpg', '/images/catalog/white-tshirt-thumb.jpg', true, 85),
('Blue Denim Jeans', 'Classic straight-fit denim jeans', 
 (SELECT id FROM categories WHERE slug = 'bottoms'), 
 (SELECT id FROM brands WHERE slug = 'levis'), 
 89.00, '/images/catalog/blue-jeans.jpg', '/images/catalog/blue-jeans-thumb.jpg', true, 92),
('White Sneakers', 'Clean white canvas sneakers', 
 (SELECT id FROM categories WHERE slug = 'shoes'), 
 (SELECT id FROM brands WHERE slug = 'converse'), 
 65.00, '/images/catalog/white-sneakers.jpg', '/images/catalog/white-sneakers-thumb.jpg', true, 78),
('Black Leather Jacket', 'Classic black leather moto jacket', 
 (SELECT id FROM categories WHERE slug = 'outerwear'), 
 (SELECT id FROM brands WHERE slug = 'zara'), 
 129.00, '/images/catalog/black-jacket.jpg', '/images/catalog/black-jacket-thumb.jpg', false, 45),
('Red Crossbody Bag', 'Small red leather crossbody bag', 
 (SELECT id FROM categories WHERE slug = 'accessories'), 
 (SELECT id FROM brands WHERE slug = 'zara'), 
 39.90, '/images/catalog/red-bag.jpg', '/images/catalog/red-bag-thumb.jpg', true, 67);

-- Insert default avatars (these would be actual image files in production)
INSERT INTO users (id, email, username, name, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@stylesnap.com', 'demo', 'Demo User', '/avatars/default-1.png'),
('00000000-0000-0000-0000-000000000002', 'fashion@stylesnap.com', 'fashionista', 'Fashion Lover', '/avatars/default-2.png'),
('00000000-0000-0000-0000-000000000003', 'style@stylesnap.com', 'stylist', 'Style Expert', '/avatars/default-3.png');

-- Create some sample activities
INSERT INTO activities (user_id, type, description, data) VALUES
('00000000-0000-0000-0000-000000000001', 'item_added', 'Added a new item to their wardrobe', '{"item_name": "Blue Denim Jacket"}'),
('00000000-0000-0000-0000-000000000001', 'outfit_created', 'Created a new outfit', '{"outfit_name": "Casual Friday Look"}'),
('00000000-0000-0000-0000-000000000002', 'item_added', 'Added a new item to their wardrobe', '{"item_name": "Red Summer Dress"}'),
('00000000-0000-0000-0000-000000000002', 'outfit_created', 'Created a new outfit', '{"outfit_name": "Beach Day Outfit"}'),
('00000000-0000-0000-0000-000000000003', 'item_added', 'Added a new item to their wardrobe', '{"item_name": "Black Blazer"}'),
('00000000-0000-0000-0000-000000000003', 'outfit_created', 'Created a new outfit', '{"outfit_name": "Business Meeting Look"}');

-- Create sample notifications
INSERT INTO notifications (user_id, type, title, message, data) VALUES
('00000000-0000-0000-0000-000000000001', 'welcome', 'Welcome to StyleSnap!', 'Start building your digital wardrobe by adding your first clothing item.', '{}'),
('00000000-0000-0000-0000-000000000002', 'style_suggestion', 'Style Suggestion', 'Check out this outfit suggestion based on your wardrobe.', '{"outfit_id": "sample-outfit-1"}'),
('00000000-0000-0000-0000-000000000003', 'weather_alert', 'Weather Alert', 'Consider updating your outfit for today''s weather.', '{"temperature": 15, "condition": "rainy"}');

-- Update sequence values to avoid conflicts
SELECT setval('categories_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::bigint)) FROM categories));
SELECT setval('brands_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::bigint)) FROM brands));
SELECT setval('colors_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::bigint)) FROM colors));
SELECT setval('styles_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::bigint)) FROM styles));
SELECT setval('catalog_items_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM id::text::bigint)) FROM catalog_items));
