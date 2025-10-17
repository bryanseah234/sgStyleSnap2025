-- StyleSnap Database Schema
-- Initial schema creation with all tables and relationships

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT DEFAULT '/avatars/default-1.png',
    bio TEXT,
    location VARCHAR(255),
    gender VARCHAR(50),
    theme VARCHAR(20) DEFAULT 'light',
    google_id VARCHAR(255) UNIQUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colors table
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    hex_code VARCHAR(7) UNIQUE NOT NULL,
    rgb_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Styles table
CREATE TABLE styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clothing items table
CREATE TABLE clothes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    clothing_type VARCHAR(50),
    brand VARCHAR(100),
    size VARCHAR(20),
    color_tags TEXT[],
    style_tags TEXT[],
    image_url TEXT,
    thumbnail_url TEXT,
    privacy VARCHAR(20) DEFAULT 'private',
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    removed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfits table
CREATE TABLE outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_name VARCHAR(255),
    description TEXT,
    occasion VARCHAR(50),
    weather_condition VARCHAR(50),
    temperature INTEGER,
    style_tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    removed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfit items junction table
CREATE TABLE outfit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    clothing_item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Friend requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    removed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (for activity feed)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfit likes table
CREATE TABLE outfit_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, user_id)
);

-- Clothing item likes table
CREATE TABLE clothing_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clothing_item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clothing_item_id, user_id)
);

-- Catalog items table (for browsing items)
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    image_url TEXT,
    thumbnail_url TEXT,
    colors UUID[],
    styles UUID[],
    is_trending BOOLEAN DEFAULT false,
    trending_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, catalog_item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_clothes_owner_id ON clothes(owner_id);
CREATE INDEX idx_clothes_category ON clothes(category);
CREATE INDEX idx_clothes_removed_at ON clothes(removed_at);
CREATE INDEX idx_outfits_owner_id ON outfits(owner_id);
CREATE INDEX idx_outfits_removed_at ON outfits(removed_at);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX idx_clothing_likes_item_id ON clothing_likes(clothing_item_id);

-- Create full-text search indexes
CREATE INDEX idx_clothes_search ON clothes USING gin(to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(array_to_string(color_tags, ' '), '')));
CREATE INDEX idx_outfits_search ON outfits USING gin(to_tsvector('english', outfit_name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', name || ' ' || username));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON colors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_styles_updated_at BEFORE UPDATE ON styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clothes_updated_at BEFORE UPDATE ON clothes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_catalog_items_updated_at BEFORE UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, name, avatar_url, google_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/avatars/default-1.png'),
        NEW.raw_user_meta_data->>'provider_id'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update likes count
CREATE OR REPLACE FUNCTION increment_outfit_likes(outfit_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE outfits SET likes_count = likes_count + 1 WHERE id = outfit_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_outfit_likes(outfit_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE outfits SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = outfit_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update clothing item likes count
CREATE OR REPLACE FUNCTION increment_clothing_likes(item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE clothes SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_clothing_likes(item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE clothes SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;
