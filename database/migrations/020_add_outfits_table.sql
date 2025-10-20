-- Migration 020: Add Main Outfits Table
-- This migration adds the main outfits table that the OutfitsService expects

-- ============================================
-- DROP EXISTING OBJECTS (if they exist)
-- ============================================
DROP TRIGGER IF EXISTS update_outfits_updated_at ON outfits CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

DROP TABLE IF EXISTS outfit_items CASCADE;
DROP TABLE IF EXISTS outfits CASCADE;

-- ============================================
-- MAIN OUTFITS TABLE
-- ============================================
-- This is the main outfits table that the OutfitsService queries
-- It stores user-created outfits (both manual and AI-generated)

CREATE TABLE outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_name VARCHAR(255) NOT NULL,
    description TEXT,
    occasion VARCHAR(50),
    weather_condition VARCHAR(50),
    temperature INTEGER, -- Temperature in Celsius
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    style_tags TEXT[],
    removed_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OUTFIT ITEMS TABLE (Junction Table)
-- ============================================
-- Links outfits to clothing items with positioning data

CREATE TABLE outfit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    clothing_item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
    
    -- Positioning data for the outfit canvas
    x_position DECIMAL(10,2) DEFAULT 0,
    y_position DECIMAL(10,2) DEFAULT 0,
    scale DECIMAL(5,2) DEFAULT 1.0,
    rotation DECIMAL(5,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination
    UNIQUE(outfit_id, clothing_item_id)
);

-- ============================================
-- OUTFIT LIKES TABLE
-- ============================================
-- Likes on user-created outfits

CREATE TABLE outfit_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique like per user per outfit
    UNIQUE(outfit_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Outfits table indexes
CREATE INDEX idx_outfits_owner_id ON outfits(owner_id);
CREATE INDEX idx_outfits_created_at ON outfits(created_at DESC);
CREATE INDEX idx_outfits_is_favorite ON outfits(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_outfits_is_public ON outfits(is_public) WHERE is_public = true;
CREATE INDEX idx_outfits_occasion ON outfits(occasion);
CREATE INDEX idx_outfits_weather ON outfits(weather_condition);
CREATE INDEX idx_outfits_removed_at ON outfits(removed_at) WHERE removed_at IS NULL;
CREATE INDEX idx_outfits_tags ON outfits USING GIN(style_tags);

-- Outfit items indexes
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_clothing_item_id ON outfit_items(clothing_item_id);
CREATE INDEX idx_outfit_items_outfit_clothing ON outfit_items(outfit_id, clothing_item_id);

-- Outfit likes indexes
CREATE INDEX idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX idx_outfit_likes_user_id ON outfit_likes(user_id);
CREATE INDEX idx_outfit_likes_created_at ON outfit_likes(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get outfit likes count
CREATE OR REPLACE FUNCTION get_outfit_likes_count(outfit_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM outfit_likes
        WHERE outfit_id = outfit_id_param
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on outfits table
CREATE TRIGGER update_outfits_updated_at
    BEFORE UPDATE ON outfits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on outfit_items table
CREATE TRIGGER update_outfit_items_updated_at
    BEFORE UPDATE ON outfit_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;

-- Outfits policies
CREATE POLICY "Users can view their own outfits"
    ON outfits FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can view public outfits"
    ON outfits FOR SELECT
    USING (is_public = true AND removed_at IS NULL);

CREATE POLICY "Users can create their own outfits"
    ON outfits FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own outfits"
    ON outfits FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own outfits"
    ON outfits FOR DELETE
    USING (owner_id = auth.uid());

-- Outfit items policies
CREATE POLICY "Users can view outfit items for their outfits"
    ON outfit_items FOR SELECT
    USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view outfit items for public outfits"
    ON outfit_items FOR SELECT
    USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE is_public = true AND removed_at IS NULL
        )
    );

CREATE POLICY "Users can create outfit items for their outfits"
    ON outfit_items FOR INSERT
    WITH CHECK (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outfit items for their outfits"
    ON outfit_items FOR UPDATE
    USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outfit items for their outfits"
    ON outfit_items FOR DELETE
    USING (
        outfit_id IN (
            SELECT id FROM outfits WHERE owner_id = auth.uid()
        )
    );

-- Outfit likes policies
CREATE POLICY "Users can view all outfit likes"
    ON outfit_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own outfit likes"
    ON outfit_likes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own outfit likes"
    ON outfit_likes FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- GRANTS
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON outfits TO authenticated;
GRANT ALL ON outfit_items TO authenticated;
GRANT ALL ON outfit_likes TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE outfits IS 'User-created outfits (both manual and AI-generated)';
COMMENT ON TABLE outfit_items IS 'Junction table linking outfits to clothing items with positioning data';
COMMENT ON TABLE outfit_likes IS 'Likes on user-created outfits';

COMMENT ON COLUMN outfits.owner_id IS 'User who created the outfit';
COMMENT ON COLUMN outfits.outfit_name IS 'Name of the outfit';
COMMENT ON COLUMN outfits.description IS 'Optional description of the outfit';
COMMENT ON COLUMN outfits.occasion IS 'Occasion for the outfit (work, casual, formal, etc.)';
COMMENT ON COLUMN outfits.weather_condition IS 'Weather condition (hot, warm, cool, cold)';
COMMENT ON COLUMN outfits.temperature IS 'Temperature in Celsius';
COMMENT ON COLUMN outfits.is_public IS 'Whether the outfit is visible to other users';
COMMENT ON COLUMN outfits.is_favorite IS 'Whether the user marked this outfit as favorite';
COMMENT ON COLUMN outfits.style_tags IS 'Array of style tags for the outfit';

COMMENT ON COLUMN outfit_items.outfit_id IS 'Reference to the outfit';
COMMENT ON COLUMN outfit_items.clothing_item_id IS 'Reference to the clothing item';
COMMENT ON COLUMN outfit_items.x_position IS 'X position on the outfit canvas';
COMMENT ON COLUMN outfit_items.y_position IS 'Y position on the outfit canvas';
COMMENT ON COLUMN outfit_items.scale IS 'Scale factor for the item';
COMMENT ON COLUMN outfit_items.rotation IS 'Rotation angle in degrees';
COMMENT ON COLUMN outfit_items.z_index IS 'Z-index for layering items';

COMMENT ON COLUMN outfit_likes.outfit_id IS 'Reference to the outfit being liked';
COMMENT ON COLUMN outfit_likes.user_id IS 'User who liked the outfit';
