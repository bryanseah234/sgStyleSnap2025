# 🚨 URGENT: Fix for New User Signup Issue

## Problem Summary

**Issue**: New users cannot sign up with Google OAuth  
**Error**: "server_error: Database error saving new user"  
**Impact**: Existing users can login, but new registrations fail  
**Status**: ✅ Fix ready - see below

---

## Quick Fix (5 minutes)

### Step 1: Diagnose (Optional)
Run this query in Supabase SQL Editor to confirm the issue:
- File: `database/migrations/DIAGNOSE_USER_CREATION_ISSUE.sql`
- Copy → Paste → Run
- Look for: ❌ "NO INSERT policy for service_role/postgres"

### Step 2: Apply Fix
Run this migration in Supabase SQL Editor:
- File: `database/migrations/028_fix_user_creation_rls.sql`
- Copy → Paste → Run  
- Should see: ✅ "MIGRATION 028 COMPLETED SUCCESSFULLY!"

### Step 3: Test
1. Try signing up a new user
2. Check Supabase → Logs → Postgres Logs
3. Should see: ✅ "Successfully created user in public.users"

---

## What Was Wrong?

The database trigger `sync_auth_user_to_public()` creates a user record in `public.users` when someone signs up via Google OAuth.

**The Problem**: Row Level Security (RLS) policy was blocking the trigger from inserting new users.

**The Fix**: Added explicit RLS policy allowing `service_role` and `postgres` to insert users.

---

## Files Created

1. **`database/migrations/028_fix_user_creation_rls.sql`**  
   → The fix migration (run this!)

2. **`database/migrations/DIAGNOSE_USER_CREATION_ISSUE.sql`**  
   → Diagnostic query to confirm the problem

3. **`database/migrations/FIX_USER_SIGNUP_ISSUE.md`**  
   → Detailed documentation and troubleshooting

---

## Security Note

This fix is **safe and follows best practices**:
- ✅ Only system roles (`service_role`, `postgres`) can insert users
- ✅ Regular users still cannot insert users directly
- ✅ Google OAuth validation still enforced
- ✅ All other security policies unchanged

---

## If Fix Doesn't Work

See `database/migrations/FIX_USER_SIGNUP_ISSUE.md` for:
- Manual SQL commands (if migration fails)
- Detailed troubleshooting steps
- Common issues and solutions

---

## Technical Details

**Root Cause**: RLS policy didn't specify roles for INSERT operations

**Before**:
```sql
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (true);
```

**After**:
```sql
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT TO service_role, postgres
    WITH CHECK (true);
```

**Additional Changes**:
- Granted EXECUTE permissions to trigger function
- Granted INSERT/SELECT permissions to service_role
- Added UNIQUE constraint on username (prevents duplicates)

---

## Quick Test Command

After applying fix, run this to verify:

```sql
-- Check the new policy exists
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';
```

Should return 1 row showing the policy for INSERT operations.

---

**Ready to fix? Go to Supabase → SQL Editor and run `028_fix_user_creation_rls.sql`! 🚀**

