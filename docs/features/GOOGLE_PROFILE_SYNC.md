# Google Profile Synchronization

This feature automatically synchronizes user profile data with their Google account, ensuring that all profile information in StyleSnap always matches the current Google profile data.

## 🚀 Features

### Automatic Synchronization
- **On Login**: Profile is automatically synced when users sign in via Edge Function
- **Edge Function**: `sync-auth-users-realtime` handles real-time user synchronization
- **Manual Sync**: Users can manually trigger sync from the profile page

### Comprehensive Field Sync
- **Email**: Syncs current Google email address
- **Name**: Syncs full name from Google profile
- **Avatar URL**: Syncs profile photo URL
- **Google ID**: Syncs Google account identifier
- **Additional Data**: Locale, email verification status, etc.

### Smart Detection
- **Multi-field Detection**: Checks all profile fields for changes
- **Efficient Updates**: Only updates fields that have actually changed
- **Detailed Logging**: Tracks which specific fields were updated
- **Error Handling**: Graceful handling of sync failures with user feedback

## 🛠️ Implementation

### Database Functions

#### `get_current_google_profile_data(user_id UUID)`
Returns comprehensive Google profile data from auth.users table including name, email, avatar, locale, etc.

#### `get_current_google_profile_photo(user_id UUID)`
Returns the current Google profile photo URL from auth.users table (legacy function).

#### `update_user_google_profile(user_id UUID)`
Updates user profile with current Google data if there are changes to any field (email, name, avatar, google_id).

#### `sync_user_profile_photo(user_id UUID)`
Manually sync a specific user's profile with comprehensive Google data.

#### `sync_all_user_profiles()`
Sync all user profiles with their current Google data.

### Edge Function Integration

**Note**: As of Migration 041, database triggers have been replaced with Edge Functions for better scalability and error handling.

```typescript
// Edge Function: sync-auth-users-realtime
// Handles real-time user synchronization when auth.users changes
// Provides better error handling and logging than database triggers
```

The Edge Function automatically updates the public.users table whenever Google profile data changes in auth.users.

### Frontend Integration

#### AuthService Methods

```javascript
// Check if profile needs sync
const needsSync = await authService.needsProfileSync()

// Sync profile with Google
const result = await authService.syncProfileWithGoogle()

// Get comprehensive Google profile data
const googleData = await authService.getCurrentGoogleProfileData()

// Get current Google profile photo (legacy)
const googlePhoto = await authService.getCurrentGoogleProfilePhoto()

// Auto-sync on authentication (called automatically)
await authService.autoSyncProfileOnAuth()
```

#### Profile Page UI

The profile page includes a "Google Profile Sync" section with:
- Sync button to manually trigger synchronization
- Status indicators (success, error, up-to-date)
- Detailed sync information showing what was updated
- Google profile data display for verification
- Real-time feedback during sync process

## 📋 Usage

### For Users

1. **Automatic Sync**: Profile photos are automatically synced when you sign in
2. **Manual Sync**: Visit your profile page and click "Sync with Google"
3. **Status Feedback**: See immediate feedback about sync status

### For Developers

1. **Run Migration**: Execute the database migration to add sync functions
2. **Test Functions**: Use the test script to verify functionality
3. **Monitor Logs**: Check console logs for sync activity

## 🔧 Setup

### 1. Run Database Migration

```bash
node scripts/run-migrations.js
```

### 2. Test the Functions

```bash
node scripts/test-profile-sync.js
```

### 3. Verify in App

1. Sign in with Google
2. Visit the profile page
3. Click "Sync with Google" button
4. Check that profile photo updates if there's a mismatch

## 🔍 How It Works

### Sync Process

1. **Detection**: Compare stored `avatar_url` with current Google photo URL
2. **Update**: If different, update the database with current Google data
3. **Feedback**: Provide user feedback about sync status
4. **Cache**: Update cached profile data in AuthService

### Data Flow

```
Google OAuth → auth.users → Edge Function → public.users → Frontend Cache
     ↓
Profile Page UI ← AuthService ← Database Functions ← RPC Calls
```

**Architecture Change**: Database triggers have been replaced with Edge Functions for better scalability and error handling.

## 🛡️ Security

### Row Level Security (RLS)
- All functions use `SECURITY DEFINER` for proper permissions
- Users can only sync their own profiles
- Service role key required for admin functions

### Data Privacy
- Only profile photo URL and basic info are synced
- No sensitive Google data is stored
- Sync is opt-in through the UI

## 🐛 Troubleshooting

### Common Issues

#### "Function does not exist"
- Run the migration: `node scripts/run-migrations.js`
- Check that migration 024 was executed successfully
- Verify Edge Function `sync-auth-users-realtime` is deployed and active

#### "Permission denied"
- Ensure RLS policies are properly configured
- Check that user is authenticated

#### "Profile not updating"
- Verify Google OAuth is working correctly
- Check that auth.users contains current Google data
- Run manual sync from profile page

### Debug Steps

1. Check database functions exist:
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%sync%';
```

2. Test sync function manually:
```sql
SELECT sync_user_profile_photo('user-uuid-here');
```

3. Check auth.users data:
```sql
SELECT id, email, raw_user_meta_data->>'picture' 
FROM auth.users 
WHERE id = 'user-uuid-here';
```

## 📊 Monitoring

### Console Logs

The sync process provides detailed logging:
- `🔄 AuthService: Syncing profile with Google data`
- `✅ AuthService: Profile synchronized successfully`
- `ℹ️ AuthService: Profile already up-to-date`

### Database Logs

Check Supabase logs for:
- Trigger execution
- Function calls
- Error messages

## 🔮 Future Enhancements

### Planned Features
- **Batch Sync**: Sync multiple users at once
- **Sync History**: Track when profiles were last synced
- **Custom Avatars**: Allow users to override Google photos
- **Sync Scheduling**: Automatic periodic sync for all users

### Configuration Options
- **Sync Frequency**: How often to check for updates
- **Sync Scope**: Which fields to sync (photo, name, etc.)
- **Fallback Behavior**: What to do when Google data is unavailable

## 📚 API Reference

### Database Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_current_google_profile_photo` | `user_id UUID` | `TEXT` | Get current Google photo URL |
| `update_user_google_profile` | `user_id UUID` | `BOOLEAN` | Update profile if changed |
| `sync_user_profile_photo` | `user_id UUID` | `JSON` | Sync single user profile |
| `sync_all_user_profiles` | None | `JSON` | Sync all user profiles |

### Frontend Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `needsProfileSync()` | `Promise<boolean>` | Check if sync is needed |
| `syncProfileWithGoogle()` | `Promise<Object>` | Sync current user profile |
| `getCurrentGoogleProfilePhoto()` | `Promise<string>` | Get current Google photo |
| `autoSyncProfileOnAuth()` | `Promise<Object>` | Auto-sync on login |

## 🤝 Contributing

When contributing to this feature:

1. **Test Thoroughly**: Always test with real Google accounts
2. **Handle Errors**: Ensure graceful error handling
3. **Update Documentation**: Keep this doc up-to-date
4. **Consider Edge Cases**: What happens with deleted Google accounts?
5. **Performance**: Consider impact on database performance

## 📝 Changelog

### v2.0.0 (Edge Function Architecture)
- ✅ Edge Function-based user synchronization (Migration 041)
- ✅ Improved error handling and logging
- ✅ Better scalability for concurrent user registrations
- ✅ Real-time synchronization via Supabase Edge Functions

### v1.0.0 (Initial Release)
- ✅ Automatic profile sync on authentication
- ✅ Manual sync from profile page
- ✅ Database triggers for real-time updates (deprecated)
- ✅ Comprehensive error handling
- ✅ User-friendly UI feedback
