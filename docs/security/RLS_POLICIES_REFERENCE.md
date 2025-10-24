# Row Level Security (RLS) Policies Reference

This document provides a comprehensive reference for all Row Level Security (RLS) policies currently implemented in the StyleSnap database.

## 📋 Overview

The StyleSnap database implements comprehensive RLS policies across all schemas to ensure data privacy and security. This document provides a flattened, table-by-table reference of all policies.

## 🔐 Schema Overview

- **auth**: Authentication and user management
- **public**: Application data tables
- **storage**: File storage and management
- **realtime**: Real-time messaging and events

---

## 🔑 Auth Schema Policies

### auth.users

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view own data" | SELECT | public | `auth.uid() = id` | - |
| "Users can search other users" | SELECT | public | `(auth.uid() IS NOT NULL) AND (removed_at IS NULL)` | - |
| "Users can update own data" | UPDATE | public | `auth.uid() = id` | - |
| "Service role can insert users" | INSERT | postgres, service_role | - | `true` |
| "Users can view own profile" | SELECT | public | `(auth.uid() IS NOT NULL) AND (auth.uid() = id)` | - |
| "Users can update own profile" | UPDATE | public | `(auth.uid() IS NOT NULL) AND (auth.uid() = id)` | `(auth.uid() IS NOT NULL) AND (auth.uid() = id)` |

**Current Status**: ✅ RLS enabled with comprehensive policies  
**Key Columns**: `id`, `email`, `role`, `raw_app_meta_data`  
**Patterns**: Owner-based access (`auth.uid() = id`), service role insert allowed

---

## 🏠 Public Schema Policies

### public.users

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view own profile" | SELECT | public | `auth.uid() = id` | - |
| "Users can update own profile" | UPDATE | public | `auth.uid() = id` | `auth.uid() = id` |
| "Friends can view each other" | SELECT | public | `removed_at IS NULL AND EXISTS(accepted friendship between auth.uid() and the other user)` | - |
| "Service role can insert users" | INSERT | postgres, service_role | - | `true` |
| "Authenticated users can search users" | SELECT | public | `auth.uid() IS NOT NULL AND removed_at IS NULL` | - |

**Current Status**: ✅ RLS enabled with comprehensive policies  
**Key Columns**: `id`, `email`, `username`, `avatar_url`  
**Patterns**: Owner-based access (`auth.uid() = id`), search for non-removed users

### public.clothes

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view own clothes" | SELECT | public | `auth.uid() = owner_id` | - |
| "Users can insert own clothes" | INSERT | public | - | `auth.uid() = owner_id` |
| "Users can update own clothes" | UPDATE | public | `auth.uid() = owner_id` | - |
| "Users can delete own clothes" | DELETE | public | `auth.uid() = owner_id` | - |
| "Friends can view friends clothes" | SELECT | public | `privacy = 'friends' AND removed_at IS NULL AND EXISTS(accepted friendship between auth.uid() and clothes.owner_id)` | - |
| "Anyone can view public clothes" | SELECT | public | `privacy = 'public' AND removed_at IS NULL` | - |
| "Allow authenticated user creation" | INSERT | public | - | `true` |

### public.item_likes / public.likes

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Friends can like items" (item_likes INSERT) | INSERT | public | - | `user_id = auth.uid() AND EXISTS(accepted friendship between auth.uid() and owner of item_likes.item_id) AND item owner <> auth.uid()` |
| "Users can delete their own likes" | DELETE | public | `user_id = auth.uid()` | - |
| "Users can view all likes" | SELECT | public | `true` | - |
| "Users can create own likes" | INSERT | public | - | `auth.uid() = user_id` |
| "Users can delete own likes" | DELETE | public | `auth.uid() = user_id` | - |
| "Users can view likes on their items" | SELECT | public | `item_id IN (SELECT clothes.id FROM clothes WHERE clothes.owner_id = auth.uid())` | - |
| "Users can view likes on friends' items" | SELECT | public | `EXISTS(join clothes c and friends f where c.id = item_likes.item_id and f.status = 'accepted' and friendship between auth.uid() and c.owner_id)` | - |

### public.suggestions

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view received suggestions" | SELECT | public | `auth.uid() = to_user_id` | - |
| "Users can view sent suggestions" | SELECT | public | `auth.uid() = from_user_id` | - |
| "Users can create suggestions" | INSERT | public | - | `auth.uid() = from_user_id` |
| "Users can update received suggestions" | UPDATE | public | `auth.uid() = to_user_id` | `auth.uid() = to_user_id` |
| "Users can delete own suggestions" | DELETE | public | `auth.uid() = from_user_id OR auth.uid() = to_user_id` | - |

### public.outfit_history

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view their own outfit history" | SELECT | public | `user_id = auth.uid()` | - |
| "Users can create their own outfit history" | INSERT | public | - | `user_id = auth.uid()` |
| "Users can update/delete their own outfit history" | UPDATE/DELETE | public | `user_id = auth.uid()` | - |

### public.shared_outfits / public.shared_outfit_likes / public.outfit_comments

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view public shared outfits" | SELECT | public | `visibility = 'public'` | - |
| "Users can view their own shared outfits" | SELECT | public | `user_id = auth.uid()` | - |
| "Users can create/update/delete own shared outfits" | INSERT/UPDATE/DELETE | public | `user_id = auth.uid()` | `user_id = auth.uid()` |
| "Users can view likes on visible outfits" | SELECT | public | `outfit_id IN (shared_outfits where visibility = public OR user owns OR visibility = friends and user is friend)` | - |
| "Users can like visible outfits" | INSERT | public | - | `user_id = auth.uid() AND outfit_id IN (shared_outfits with visibility in ('public','friends'))` |
| "Users can unlike outfits they liked" | DELETE | public | `user_id = auth.uid()` | - |
| "Users can view comments on visible outfits" | SELECT | public | `similar visibility logic as likes` | - |
| "Users can comment on visible outfits" | INSERT | public | - | `user_id = auth.uid() AND outfit is public or friends` |
| "Users can update/delete their own comments" | UPDATE/DELETE | public | `user_id = auth.uid()` | - |

### public.style_preferences / suggestion_feedback

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view/create/update own style preferences" | SELECT/INSERT/UPDATE | public | `user_id = auth.uid()` | `user_id = auth.uid()` |
| "Users can view/create/update/delete their own suggestion feedback" | SELECT/INSERT/UPDATE/DELETE | public | `user_id = auth.uid()` | `user_id = auth.uid()` |

### public.outfit_collections / collection_outfits

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view public collections" | SELECT | public | `visibility = 'public'` | - |
| "Users can view friends' collections" | SELECT | public | `visibility = 'friends' AND user_id IN (friends of auth.uid())` | - |
| "Users can view/create/update/delete own collections" | SELECT/INSERT/UPDATE/DELETE | public | `user_id = auth.uid()` | `user_id = auth.uid()` |
| "Users can view outfits in visible collections" | SELECT | public | `collection visibility logic` | - |
| "Users can add/update/delete outfits in own collections" | INSERT/UPDATE/DELETE | public | `collection belongs to auth.uid()` | `collection belongs to auth.uid()` |

### public.generated_outfits / public.outfit_generation_history

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view/create/update/delete own generated outfits" | SELECT/INSERT/UPDATE/DELETE | public | `auth.uid() = user_id` | `auth.uid() = user_id` |
| "Users can view/create own generation history" | SELECT/INSERT | public | `auth.uid() = user_id` | `auth.uid() = user_id` |

### public.friends / friendship policies

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view own friendships" | SELECT | public | `auth.uid() = requester_id OR auth.uid() = receiver_id` | - |
| "Users can send friend requests" | INSERT | public | - | `auth.uid() IS NOT NULL AND auth.uid() = requester_id AND requester_id < receiver_id AND status = 'pending' AND requester_id <> receiver_id` |
| "Users can accept friend requests" | UPDATE | public | `auth.uid() = receiver_id AND status was 'pending'` | `auth.uid() = receiver_id AND new status is in ('accepted','rejected')` |
| "Users can delete own friendships" | DELETE | public | `auth.uid() = requester_id OR auth.uid() = receiver_id` | - |
| "Friends can view each other" | SELECT | public | `removed_at IS NULL AND EXISTS(accepted friendship between auth.uid() and the other user)` | - |

### public.outfits / outfit_items / outfit_likes / outfit_shares

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view/create/update/delete their own outfits" | SELECT/INSERT/UPDATE/DELETE | public | `owner_id = auth.uid()` | `owner_id = auth.uid()` |
| "Anyone can view public outfits" | SELECT | public | `privacy = 'public' AND removed_at IS NULL` | - |
| "Friends can view friends outfits" | SELECT | public | `privacy = 'friends' AND removed_at IS NULL AND EXISTS(accepted friendship)` | - |
| "Users can view/create/update/delete outfit_items for their outfits" | SELECT/INSERT/UPDATE/DELETE | public | `outfit belongs to auth.uid()` | `outfit belongs to auth.uid()` |
| "Users can view/create/delete outfit likes" | SELECT/INSERT/DELETE | public | `(SELECT: true) / (INSERT: user_id = auth.uid()) / (DELETE: user_id = auth.uid())` | - |
| "Friends can share outfits" | INSERT | public | - | `sharer_id = auth.uid() AND EXISTS(accepted friendship between auth.uid() and recipient_id)` |
| "Users can view/update/delete shares they sent/received" | SELECT/UPDATE/DELETE | public | `sharer_id = auth.uid() OR recipient_id = auth.uid()` | - |

### public.notifications / push_subscriptions / notification_preferences / notification_delivery_log

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Users can view/update/delete their own notifications" | SELECT/UPDATE/DELETE | public | `recipient_id = auth.uid()` | - |
| "push_subscriptions_select_own" | SELECT | public | `user_id = auth.uid()` | - |
| "push_subscriptions_insert_own" | INSERT | public | - | `user_id = auth.uid()` |
| "push_subscriptions_update/delete_own" | UPDATE/DELETE | public | `user_id = auth.uid()` | - |
| "notification_preferences_select_insert_update_delete_own" | SELECT/INSERT/UPDATE/DELETE | public | `user_id = auth.uid()` | `user_id = auth.uid()` |
| "notification_delivery_log_select_own" | SELECT | public | `user_id = auth.uid()` | - |

### public.catalog_items

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Anyone can view active public catalog items" | SELECT | public | `is_active = true AND privacy = 'public'` | - |
| "Allow auto-contribution to catalog" | INSERT | public | - | `true` |

### public.system_logs

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Service role can manage system logs" | ALL | public | `auth.role() = 'service_role'` | - |

---

## 🔄 Realtime Schema Policies

### realtime.messages

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Topic membership access" | SELECT | public | `topic LIKE '%' || auth.uid() || '%'` | - |
| "Private channel access" | SELECT | public | `private = false OR (private = true AND topic LIKE '%' || auth.uid() || '%')` | - |
| "Message insertion by members" | INSERT | public | - | `topic LIKE '%' || auth.uid() || '%'` |

**Current Status**: ✅ RLS enabled  
**Key Columns**: `topic`, `payload`, `event`, `private`  
**Patterns**: Topic membership checks for SELECT/INSERT, private flag enforces private channels

---

## 📁 Storage Schema Policies

### storage.buckets

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Public bucket read access" | SELECT | public | `public = true` | - |
| "Owner bucket management" | ALL | public | `owner_id = auth.uid()` | `owner_id = auth.uid()` |

**Current Status**: ✅ RLS enabled  
**Key Columns**: `id`, `name`, `owner_id`, `public`  
**Patterns**: Public bucket read if `bucket.public = true`, owner-only management (`owner_id = auth.uid()`)

### storage.objects

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "Object access by owner" | ALL | public | `owner_id = auth.uid()` | `owner_id = auth.uid()` |
| "Object access by bucket policy" | SELECT | public | `bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)` | - |
| "Per-user folder access" | ALL | public | `storage.foldername(name)[1] = auth.uid()` | `storage.foldername(name)[1] = auth.uid()` |

**Current Status**: ✅ RLS enabled  
**Key Columns**: `id`, `bucket_id`, `name`, `owner_id`, `path_tokens`  
**Patterns**: Object access limited to `owner_id` or bucket policy, per-user folder pattern: `storage.foldername(name)[1] = auth.uid()`

### storage.prefixes / storage.s3_multipart_uploads

*RLS enabled on storage tables with similar patterns to buckets and objects.*

---

## 🛡️ Service Role Policies

### service_role policies

| Policy Name | Command | Roles | USING Condition | WITH CHECK |
|-------------|---------|-------|-----------------|------------|
| "service_role_insert" | INSERT | authenticated | `auth.jwt() ->> 'role' = 'service_role'` | - |
| "service_role_update" | UPDATE | authenticated | `auth.jwt() ->> 'role' = 'service_role'` | - |

*Used to allow service role scoped behavior*

---

## 🔍 Policy Analysis

### Common Patterns

1. **Ownership-Based Access**: Most policies use `auth.uid() = user_id` or `auth.uid() = owner_id`
2. **Friendship-Based Access**: Complex policies check for accepted friendships between users
3. **Privacy Levels**: Public, friends, and private visibility controls
4. **Service Role Access**: Special policies for system operations

### Security Features

- **Data Isolation**: Users can only access their own data by default
- **Friend Visibility**: Controlled access to friends' data based on privacy settings
- **Public Content**: Limited public access for catalog items and public outfits
- **System Operations**: Service role policies for administrative functions

---

## 🧪 Testing RLS Policies

### Verify Policy Existence

```sql
-- Check all policies for a specific table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check policies by schema
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Policy Enforcement

```sql
-- Test as authenticated user
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid-here"}';

-- Test policy enforcement
SELECT * FROM users; -- Should only return user's own data
```

---

## 📚 Related Documentation

- [Database Guide](../guides/DATABASE_GUIDE.md)
- [Authentication Guide](../guides/AUTHENTICATION_GUIDE.md)
- [Security Overview](./SECURITY_OVERVIEW.md)

---

**Last Updated**: Migration 041 - Edge Function Architecture
**Total Policies**: 91+ policies across all schemas
**Coverage**: All tables have RLS enabled with comprehensive policies
