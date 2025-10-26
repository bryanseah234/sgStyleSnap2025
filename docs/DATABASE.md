# Database Documentation

## Overview

StyleSnap 2025 uses PostgreSQL as the primary database, hosted on Supabase. The database implements Row-Level Security (RLS) policies to ensure data privacy and security. All database operations are performed through Supabase's client libraries with automatic RLS enforcement.

## Database Schema

### Core Tables

#### users
**Purpose**: Stores user account information and profiles
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_users_email` on `email`
- `idx_users_username` on `username`
- `idx_users_created_at` on `created_at`

**RLS Policies**:
```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### clothes
**Purpose**: Stores clothing items in user wardrobes
```sql
CREATE TABLE clothes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'outerwear', 'shoes', 'hat')),
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_clothes_user_id` on `user_id`
- `idx_clothes_category` on `category`
- `idx_clothes_is_favorite` on `is_favorite`
- `idx_clothes_created_at` on `created_at`

**RLS Policies**:
```sql
-- Users can only access their own clothes
CREATE POLICY "Users can view own clothes" ON clothes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own clothes
CREATE POLICY "Users can insert own clothes" ON clothes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own clothes
CREATE POLICY "Users can update own clothes" ON clothes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own clothes
CREATE POLICY "Users can delete own clothes" ON clothes
  FOR DELETE USING (auth.uid() = user_id);
```

#### outfits
**Purpose**: Stores outfit combinations created by users
```sql
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  outfit_name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_outfits_user_id` on `user_id`
- `idx_outfits_is_favorite` on `is_favorite`
- `idx_outfits_created_at` on `created_at`
- `idx_outfits_items_gin` on `items` (GIN index for JSONB)

**RLS Policies**:
```sql
-- Users can only access their own outfits
CREATE POLICY "Users can view own outfits" ON outfits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own outfits
CREATE POLICY "Users can insert own outfits" ON outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own outfits
CREATE POLICY "Users can update own outfits" ON outfits
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own outfits
CREATE POLICY "Users can delete own outfits" ON outfits
  FOR DELETE USING (auth.uid() = user_id);
```

#### friends
**Purpose**: Manages friend relationships between users
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

**Indexes**:
- `idx_friends_user_id` on `user_id`
- `idx_friends_friend_id` on `friend_id`
- `idx_friends_status` on `status`
- `idx_friends_user_friend` on `(user_id, friend_id)` (unique)

**RLS Policies**:
```sql
-- Users can view their own friend relationships
CREATE POLICY "Users can view own friendships" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own friend relationships
CREATE POLICY "Users can update own friendships" ON friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete their own friend relationships
CREATE POLICY "Users can delete own friendships" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);
```

#### notifications
**Purpose**: Stores system notifications for users
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request',
    'friend_request_accepted',
    'outfit_shared',
    'friend_outfit_suggestion',
    'outfit_like',
    'item_like'
  )),
  reference_id UUID,
  custom_message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_notifications_recipient_id` on `recipient_id`
- `idx_notifications_actor_id` on `actor_id`
- `idx_notifications_type` on `type`
- `idx_notifications_is_read` on `is_read`
- `idx_notifications_created_at` on `created_at`

**RLS Policies**:
```sql
-- Users can view notifications sent to them
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

-- Users can insert notifications where they are recipient or actor
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = recipient_id OR auth.uid() = actor_id);

-- Users can update notifications sent to them
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Users can delete notifications sent to them
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = recipient_id);
```

## Database Functions

### Utility Functions

#### update_updated_at_column()
**Purpose**: Automatically updates the `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Usage**: Applied as trigger to all tables with `updated_at` column

#### create_friend_request_notification()
**Purpose**: Creates notification when friend request is sent
```sql
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.friend_id, NEW.user_id, 'friend_request', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### create_friend_accepted_notification()
**Purpose**: Creates notification when friend request is accepted
```sql
CREATE OR REPLACE FUNCTION create_friend_accepted_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
    VALUES (OLD.user_id, NEW.friend_id, 'friend_request_accepted', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Database Triggers

### Automatic Timestamp Updates
```sql
-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothes_updated_at
  BEFORE UPDATE ON clothes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Notification Triggers
```sql
-- Friend request notification
CREATE TRIGGER friend_request_notification_trigger
  AFTER INSERT ON friends
  FOR EACH ROW
  EXECUTE FUNCTION create_friend_request_notification();

-- Friend accepted notification
CREATE TRIGGER friend_accepted_notification_trigger
  AFTER UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION create_friend_accepted_notification();
```

## Migration Files

### Migration Order
1. `001_initial_schema.sql` - Core table creation
2. `002_auth_setup.sql` - Authentication configuration
3. `003_clothes_table.sql` - Clothing items table
4. `004_outfits_table.sql` - Outfits table
5. `005_friends_table.sql` - Friends relationships
6. `006_notifications_table.sql` - Notifications system
7. `007_indexes.sql` - Performance indexes
8. `008_rls_policies.sql` - Row-level security policies
9. `009_notifications_system.sql` - Notification triggers
10. `010_friend_notifications.sql` - Friend notification triggers
11. `011_user_creation_rls.sql` - User creation policies
12. `012_fix_notifications_insert_policy.sql` - Notification insert policies

### Migration Commands
```bash
# Apply all migrations
psql -h your-host -U your-user -d your-database -f database/migrations/001_initial_schema.sql
psql -h your-host -U your-user -d your-database -f database/migrations/002_auth_setup.sql
# ... continue with all migration files in order

# Or apply all at once
for file in database/migrations/*.sql; do
  psql -h your-host -U your-user -d your-database -f "$file"
done
```

## Data Relationships

### Entity Relationship Diagram
```
users (1) ----< (N) clothes
users (1) ----< (N) outfits
users (1) ----< (N) friends >---- (1) users
users (1) ----< (N) notifications
users (1) ----< (N) notifications (as actor)
```

### Foreign Key Constraints
- `clothes.user_id` → `users.id` (CASCADE DELETE)
- `outfits.user_id` → `users.id` (CASCADE DELETE)
- `friends.user_id` → `users.id` (CASCADE DELETE)
- `friends.friend_id` → `users.id` (CASCADE DELETE)
- `notifications.recipient_id` → `users.id` (CASCADE DELETE)
- `notifications.actor_id` → `users.id` (CASCADE DELETE)

## Performance Optimization

### Indexing Strategy
1. **Primary Keys**: All tables use UUID primary keys
2. **Foreign Keys**: Indexed for join performance
3. **Search Fields**: Indexed for query performance
4. **JSONB Fields**: GIN indexes for outfit items
5. **Composite Indexes**: For complex queries

### Query Optimization
```sql
-- Efficient user clothes query
SELECT * FROM clothes 
WHERE user_id = $1 
  AND category = $2 
  AND is_favorite = $3
ORDER BY created_at DESC
LIMIT 20;

-- Efficient outfit search
SELECT * FROM outfits 
WHERE user_id = $1 
  AND (outfit_name ILIKE $2 OR description ILIKE $2)
ORDER BY created_at DESC;
```

### Connection Pooling
- Supabase handles connection pooling automatically
- Recommended connection limits: 20-100 connections
- Connection timeout: 30 seconds

## Security Considerations

### Row-Level Security (RLS)
- **Enabled**: All tables have RLS enabled
- **Policies**: Comprehensive policies for all operations
- **Testing**: Regular policy testing and validation

### Data Encryption
- **At Rest**: Supabase encrypts data at rest
- **In Transit**: TLS encryption for all connections
- **Application Level**: Sensitive data encrypted before storage

### Access Control
- **Authentication**: Supabase Auth integration
- **Authorization**: RLS policies enforce access control
- **Audit Logging**: Supabase provides audit logs

## Backup and Recovery

### Backup Strategy
- **Automated Backups**: Supabase provides automated daily backups
- **Point-in-Time Recovery**: Available for Pro+ plans
- **Manual Backups**: pg_dump for manual backups

### Recovery Procedures
```bash
# Manual backup
pg_dump -h your-host -U your-user -d your-database > backup.sql

# Restore from backup
psql -h your-host -U your-user -d your-database < backup.sql
```

## Monitoring and Maintenance

### Performance Monitoring
- **Query Performance**: Monitor slow queries
- **Index Usage**: Track index effectiveness
- **Connection Usage**: Monitor connection pool usage

### Maintenance Tasks
- **Vacuum**: Regular VACUUM operations
- **Analyze**: Update table statistics
- **Index Maintenance**: Rebuild fragmented indexes

### Health Checks
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## Troubleshooting

### Common Issues

#### RLS Policy Violations
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'clothes';

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM clothes WHERE user_id = auth.uid();
```

#### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table bloat
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000;
```

#### Connection Issues
```sql
-- Check active connections
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state
FROM pg_stat_activity
WHERE state = 'active';
```

---

This database documentation provides comprehensive information about the StyleSnap 2025 database schema, including tables, relationships, security policies, and maintenance procedures.
