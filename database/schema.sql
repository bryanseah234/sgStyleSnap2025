-- =============================================================
-- StyleSnap — Complete Database Schema
-- Run this file once against a fresh Supabase project.
-- Paste into the Supabase SQL Editor and click "Run".
-- =============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- SHARED FUNCTION: updated_at auto-stamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users (synced from auth.users via trigger)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(255) NOT NULL,
  name        VARCHAR(255),
  avatar_url  TEXT,
  google_id   VARCHAR(255) UNIQUE,
  removed_at  TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Clothing items
CREATE TABLE clothes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(50) CHECK (category IN ('top','bottom','outerwear','shoes','accessory')),
  image_url       TEXT NOT NULL,
  thumbnail_url   TEXT,
  style_tags      TEXT[],
  privacy         VARCHAR(20) DEFAULT 'friends' CHECK (privacy IN ('private','friends','public')),
  size            VARCHAR(20),
  brand           VARCHAR(100),
  primary_color   VARCHAR(50),
  likes_count     INTEGER DEFAULT 0,
  is_favorite     BOOLEAN DEFAULT false,
  catalog_item_id UUID,
  removed_at      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_clothes_updated_at
  BEFORE UPDATE ON clothes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Friends
CREATE TABLE friends (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('pending','accepted','rejected')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id < receiver_id)
);

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON friends FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Outfits
CREATE TABLE outfits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_name       VARCHAR(255) NOT NULL,
  description       TEXT,
  occasion          VARCHAR(50),
  weather_condition VARCHAR(50),
  temperature       INTEGER,
  privacy           VARCHAR(20) DEFAULT 'friends' CHECK (privacy IN ('private','friends','public')),
  is_public         BOOLEAN DEFAULT false,
  is_favorite       BOOLEAN DEFAULT false,
  style_tags        TEXT[],
  removed_at        TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON outfits FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Outfit items (canvas positions)
CREATE TABLE outfit_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id        UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  x_position       DECIMAL(10,2) DEFAULT 0,
  y_position       DECIMAL(10,2) DEFAULT 0,
  scale            DECIMAL(5,2)  DEFAULT 1.0,
  rotation         DECIMAL(5,2)  DEFAULT 0,
  z_index          INTEGER DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, clothing_item_id)
);

CREATE TRIGGER update_outfit_items_updated_at
  BEFORE UPDATE ON outfit_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Outfit likes
CREATE TABLE outfit_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id  UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, user_id)
);

-- Item likes
CREATE TABLE likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Likes count auto-update
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes SET likes_count = likes_count + 1 WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.item_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_likes_count_trigger
  AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

CREATE TRIGGER decrement_likes_count_trigger
  AFTER DELETE ON likes FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Catalog items
CREATE TABLE catalog_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL CHECK (category IN ('top','bottom','outerwear','shoes','accessory')),
  image_url     TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT NOT NULL,
  tags          TEXT[],
  brand         VARCHAR(100),
  color         VARCHAR(50),
  season        VARCHAR(20) CHECK (season IN ('spring','summer','fall','winter','all-season')),
  style         TEXT[],
  description   TEXT,
  search_vector tsvector,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clothes ADD CONSTRAINT fk_catalog_item
  FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);

CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_catalog_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    NEW.name || ' ' ||
    COALESCE(NEW.brand,'') || ' ' ||
    COALESCE(NEW.description,'') || ' ' ||
    COALESCE(array_to_string(NEW.tags,' '),'')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_catalog_search_vector_trigger
  BEFORE INSERT OR UPDATE ON catalog_items FOR EACH ROW
  EXECUTE FUNCTION update_catalog_search_vector();

-- Notifications
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN (
    'friend_request','friend_request_accepted',
    'outfit_shared','friend_outfit_suggestion',
    'outfit_like','item_like','outfit_comment'
  )),
  reference_id   UUID,
  is_read        BOOLEAN DEFAULT false,
  custom_message TEXT CHECK (LENGTH(custom_message) <= 200),
  email_status   TEXT,
  email_sent_at  TIMESTAMP WITH TIME ZONE,
  email_error    TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at        TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Friend outfit suggestions
CREATE TABLE friend_outfit_suggestions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggester_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_items        JSONB NOT NULL,
  message             TEXT CHECK (LENGTH(message) <= 500),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at        TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_not_self_suggestion CHECK (owner_id != suggester_id),
  CONSTRAINT check_outfit_items_not_empty CHECK (jsonb_array_length(outfit_items) > 0)
);

CREATE TRIGGER trigger_friend_outfit_suggestions_updated_at
  BEFORE UPDATE ON friend_outfit_suggestions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notification trigger on new suggestion
CREATE OR REPLACE FUNCTION create_friend_suggestion_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.owner_id, NEW.suggester_id, 'friend_outfit_suggestion', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_friend_outfit_suggestion
  AFTER INSERT ON friend_outfit_suggestions FOR EACH ROW
  EXECUTE FUNCTION create_friend_suggestion_notification();

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL UNIQUE,
  expiration_time TIMESTAMP WITH TIME ZONE,
  p256dh          TEXT NOT NULL,
  auth            TEXT NOT NULL,
  user_agent      TEXT,
  device_type     VARCHAR(20) CHECK (device_type IN ('mobile','tablet','desktop')),
  browser         VARCHAR(50),
  os              VARCHAR(50),
  is_active       BOOLEAN DEFAULT true,
  last_used_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Notification preferences
CREATE TABLE notification_preferences (
  user_id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled             BOOLEAN DEFAULT true,
  email_enabled            BOOLEAN DEFAULT false,
  friend_requests          BOOLEAN DEFAULT true,
  friend_accepted          BOOLEAN DEFAULT true,
  outfit_likes             BOOLEAN DEFAULT true,
  outfit_comments          BOOLEAN DEFAULT true,
  item_likes               BOOLEAN DEFAULT true,
  friend_outfit_suggestions BOOLEAN DEFAULT true,
  quiet_hours_enabled      BOOLEAN DEFAULT false,
  quiet_hours_start        TIME DEFAULT '22:00:00',
  quiet_hours_end          TIME DEFAULT '08:00:00',
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create default preferences when user is inserted
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_notification_preferences
  AFTER INSERT ON users FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_clothes_owner_id       ON clothes(owner_id);
CREATE INDEX idx_clothes_category       ON clothes(category) WHERE removed_at IS NULL;
CREATE INDEX idx_clothes_owner_privacy  ON clothes(owner_id, privacy) WHERE removed_at IS NULL;
CREATE INDEX idx_clothes_catalog_item   ON clothes(catalog_item_id);
CREATE INDEX idx_clothes_likes_count    ON clothes(likes_count DESC) WHERE likes_count > 0;

CREATE INDEX idx_friends_requester_id   ON friends(requester_id);
CREATE INDEX idx_friends_receiver_id    ON friends(receiver_id);
CREATE INDEX idx_friends_status         ON friends(status);

CREATE INDEX idx_outfits_owner_id       ON outfits(owner_id);
CREATE INDEX idx_outfits_privacy        ON outfits(privacy) WHERE removed_at IS NULL;
CREATE INDEX idx_outfits_created_at     ON outfits(created_at DESC);
CREATE INDEX idx_outfits_tags           ON outfits USING GIN(style_tags);

CREATE INDEX idx_outfit_items_outfit_id     ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_clothing      ON outfit_items(clothing_item_id);
CREATE INDEX idx_outfit_likes_outfit_id     ON outfit_likes(outfit_id);
CREATE INDEX idx_outfit_likes_user_id       ON outfit_likes(user_id);

CREATE UNIQUE INDEX idx_catalog_image_url   ON catalog_items(image_url);
CREATE INDEX idx_catalog_category           ON catalog_items(category);
CREATE INDEX idx_catalog_active             ON catalog_items(is_active) WHERE is_active = true;
CREATE INDEX idx_catalog_search             ON catalog_items USING GIN(search_vector);

CREATE INDEX idx_notifications_recipient    ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read      ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created_at   ON notifications(created_at DESC);

CREATE INDEX idx_push_subscriptions_user    ON push_subscriptions(user_id) WHERE is_active = true;
CREATE INDEX idx_fos_owner_id               ON friend_outfit_suggestions(owner_id);
CREATE INDEX idx_fos_status                 ON friend_outfit_suggestions(status);

CREATE INDEX idx_users_email        ON users(email) WHERE removed_at IS NULL;
CREATE INDEX idx_users_google_id    ON users(google_id) WHERE removed_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_likes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_outfit_suggestions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences    ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view active users"   ON users FOR SELECT USING (auth.uid() IS NOT NULL AND removed_at IS NULL);
CREATE POLICY "Users can update own data"     ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow user insert"             ON users FOR INSERT WITH CHECK (true);

-- Clothes
CREATE POLICY "Users can view own clothes"    ON clothes FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Friends can view friends items" ON clothes FOR SELECT USING (
  privacy = 'friends' AND removed_at IS NULL AND EXISTS (
    SELECT 1 FROM friends WHERE status = 'accepted' AND (
      (requester_id = auth.uid() AND receiver_id = owner_id) OR
      (requester_id = owner_id AND receiver_id = auth.uid())
    )
  )
);
CREATE POLICY "Anyone can view public clothes" ON clothes FOR SELECT USING (privacy = 'public' AND removed_at IS NULL);
CREATE POLICY "Users can insert own clothes"  ON clothes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own clothes"  ON clothes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own clothes"  ON clothes FOR DELETE USING (auth.uid() = owner_id);

-- Friends
CREATE POLICY "Users can view own friendships"   ON friends FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send friend requests"   ON friends FOR INSERT WITH CHECK (auth.uid() = requester_id AND requester_id < receiver_id AND status = 'pending');
CREATE POLICY "Receiver can update friend status" ON friends FOR UPDATE USING (auth.uid() = receiver_id AND status = 'pending') WITH CHECK (auth.uid() = receiver_id AND status IN ('accepted','rejected'));
CREATE POLICY "Users can delete friendships"     ON friends FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Outfits
CREATE POLICY "Users can view own outfits"       ON outfits FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Friends can view friends outfits" ON outfits FOR SELECT USING (
  privacy = 'friends' AND removed_at IS NULL AND EXISTS (
    SELECT 1 FROM friends WHERE status = 'accepted' AND (
      (requester_id = auth.uid() AND receiver_id = owner_id) OR
      (requester_id = owner_id AND receiver_id = auth.uid())
    )
  )
);
CREATE POLICY "Anyone can view public outfits"   ON outfits FOR SELECT USING (privacy = 'public' AND removed_at IS NULL);
CREATE POLICY "Users can create outfits"         ON outfits FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own outfits"     ON outfits FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own outfits"     ON outfits FOR DELETE USING (owner_id = auth.uid());

-- Outfit items
CREATE POLICY "Users can view own outfit items"  ON outfit_items FOR SELECT USING (outfit_id IN (SELECT id FROM outfits WHERE owner_id = auth.uid()));
CREATE POLICY "Anyone can view public outfit items" ON outfit_items FOR SELECT USING (outfit_id IN (SELECT id FROM outfits WHERE privacy = 'public' AND removed_at IS NULL));
CREATE POLICY "Users can manage own outfit items" ON outfit_items FOR ALL USING (outfit_id IN (SELECT id FROM outfits WHERE owner_id = auth.uid()));

-- Outfit likes
CREATE POLICY "Users can view outfit likes"      ON outfit_likes FOR SELECT USING (true);
CREATE POLICY "Users can create outfit likes"    ON outfit_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own outfit likes" ON outfit_likes FOR DELETE USING (user_id = auth.uid());

-- Item likes
CREATE POLICY "Users can view likes"             ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes"           ON likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own likes"       ON likes FOR DELETE USING (user_id = auth.uid());

-- Catalog
CREATE POLICY "Anyone can view active catalog"   ON catalog_items FOR SELECT USING (is_active = true);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (recipient_id = auth.uid());

-- Friend outfit suggestions
CREATE POLICY "Users can view received suggestions" ON friend_outfit_suggestions FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can view sent suggestions"     ON friend_outfit_suggestions FOR SELECT USING (suggester_id = auth.uid());
CREATE POLICY "Friends can create suggestions"      ON friend_outfit_suggestions FOR INSERT WITH CHECK (
  suggester_id = auth.uid() AND EXISTS (
    SELECT 1 FROM friends WHERE status = 'accepted' AND (
      (requester_id = auth.uid() AND receiver_id = owner_id) OR
      (requester_id = owner_id AND receiver_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can update received suggestions" ON friend_outfit_suggestions FOR UPDATE USING (owner_id = auth.uid());

-- Push & prefs
CREATE POLICY "Users own push subscriptions"     ON push_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users own notification prefs"     ON notification_preferences FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- AUTH SYNC TRIGGER (new user → public.users)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_unique_username(user_id UUID, user_email TEXT)
RETURNS TEXT LANGUAGE plpgsql STABLE AS $$
DECLARE
  base TEXT;
  suffix TEXT;
BEGIN
  base := LOWER(REGEXP_REPLACE(split_part(user_email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  IF LENGTH(base) > 20 THEN base := SUBSTRING(base, 1, 20); END IF;
  suffix := SUBSTRING(user_id::TEXT, 33, 4);
  RETURN base || '_' || suffix;
END;
$$;

CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  BEGIN
    INSERT INTO public.users (id, email, username, name, avatar_url, google_id, created_at, updated_at)
    VALUES (
      NEW.id, NEW.email,
      generate_unique_username(NEW.id, NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
      NEW.raw_user_meta_data->>'picture',
      COALESCE(NEW.raw_user_meta_data->>'sub', NEW.raw_user_meta_data->>'provider_id'),
      NEW.created_at, NEW.updated_at
    );
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_auth_user_to_public
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_public();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION check_item_quota(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM clothes
  WHERE owner_id = user_id AND removed_at IS NULL AND catalog_item_id IS NULL;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_friend_closet(friend_id UUID, viewer_id UUID)
RETURNS TABLE (id UUID, name VARCHAR(255), category VARCHAR(50), image_url TEXT, thumbnail_url TEXT, style_tags TEXT[], size VARCHAR(20), brand VARCHAR(100), created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT c.id, c.name, c.category, c.image_url, c.thumbnail_url, c.style_tags, c.size, c.brand, c.created_at
  FROM clothes c
  WHERE c.owner_id = friend_id AND c.removed_at IS NULL AND c.privacy = 'friends'
    AND EXISTS (
      SELECT 1 FROM friends f
      WHERE ((f.requester_id = viewer_id AND f.receiver_id = friend_id) OR (f.requester_id = friend_id AND f.receiver_id = viewer_id))
        AND f.status = 'accepted'
    );
$$;

CREATE OR REPLACE FUNCTION approve_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE friend_outfit_suggestions
  SET status = 'approved', responded_at = NOW()
  WHERE id = p_suggestion_id AND owner_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;

  UPDATE notifications SET is_read = true, read_at = NOW()
  WHERE reference_id = p_suggestion_id AND recipient_id = auth.uid() AND type = 'friend_outfit_suggestion';
END;
$$;

CREATE OR REPLACE FUNCTION reject_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE friend_outfit_suggestions
  SET status = 'rejected', responded_at = NOW()
  WHERE id = p_suggestion_id AND owner_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;

  UPDATE notifications SET is_read = true, read_at = NOW()
  WHERE reference_id = p_suggestion_id AND recipient_id = auth.uid() AND type = 'friend_outfit_suggestion';
END;
$$;

CREATE OR REPLACE FUNCTION should_send_notification(p_user_id UUID, p_notification_type VARCHAR)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_prefs notification_preferences;
BEGIN
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN true; END IF;
  RETURN CASE p_notification_type
    WHEN 'friend_request'           THEN v_prefs.friend_requests
    WHEN 'friend_request_accepted'  THEN v_prefs.friend_accepted
    WHEN 'outfit_like'              THEN v_prefs.outfit_likes
    WHEN 'outfit_comment'           THEN v_prefs.outfit_comments
    WHEN 'item_like'                THEN v_prefs.item_likes
    WHEN 'friend_outfit_suggestion' THEN v_prefs.friend_outfit_suggestions
    ELSE true
  END;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (id UUID, endpoint TEXT, p256dh TEXT, auth TEXT, device_type VARCHAR, last_used_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT ps.id, ps.endpoint, ps.p256dh, ps.auth, ps.device_type, ps.last_used_at
  FROM push_subscriptions ps
  WHERE ps.user_id = p_user_id AND ps.is_active = true
    AND (ps.expiration_time IS NULL OR ps.expiration_time > NOW());
END;
$$;

CREATE OR REPLACE FUNCTION mark_subscription_failed(p_subscription_id UUID, p_error_message TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE push_subscriptions
  SET failed_count = failed_count + 1,
      is_active = CASE WHEN failed_count + 1 >= 5 THEN false ELSE is_active END,
      updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$;

CREATE OR REPLACE FUNCTION reset_subscription_failed_count(p_subscription_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE push_subscriptions
  SET failed_count = 0, is_active = true, last_used_at = NOW(), updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_unique_username(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_item_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_closet(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_friend_outfit_suggestion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_friend_outfit_suggestion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION should_send_notification(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_push_subscriptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_subscription_failed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_subscription_failed_count(UUID) TO authenticated;

GRANT ALL ON outfits TO authenticated;
GRANT ALL ON outfit_items TO authenticated;
GRANT ALL ON outfit_likes TO authenticated;

-- =============================================================
-- END OF SCHEMA
-- =============================================================
