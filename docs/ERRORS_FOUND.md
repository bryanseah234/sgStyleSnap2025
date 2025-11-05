# Errors and Issues Found in Codebase

## ✅ FIXED

### 1. ESLint Configuration Error
**File:** `.eslintrc.cjs`  
**Issue:** `vitest` environment is unknown to ESLint  
**Fix:** Changed `vitest: true` to `node: true` in test file overrides

---

## 🔴 CRITICAL ISSUES

### 2. Duplicate Migration Numbers
**Location:** `database/migrations/`  
**Impact:** HIGH - Can cause migration conflicts and tracking issues

**Duplicate Migration 009:**
- `009_clothing_types.sql`
- `009_enhanced_categories.sql`
- `009_notifications_system.sql`

**Duplicate Migration 028:**
- `028_fix_notifications_insert_policy.sql`
- `028_fix_user_creation_rls.sql`

**Duplicate Migration 035:**
- `035_fix_approve_friend_suggestion.sql`
- `035_implement_soft_caps.sql`

**Duplicate Migration 041:**
- `041_cleanup_old_user_sync_triggers.sql`
- `041_fix_friends_rls_insert_policy.sql`

**Duplicate Migration 050:**
- `050_add_slippers_category.sql` (uses `category` field, lowercase 'slippers')
- `050_email_notifications.sql` (no transaction wrapper)

**Duplicate Migration 051:**
- `051_add_ai_description.sql`
- `051_add_slippers_clothing_type.sql` (uses `clothing_type` field, capitalized 'Slippers')
- `051_fix_email_notification_message_field.sql`

**Action Required:** Renumber migrations to ensure unique sequence numbers.

---

### 3. Missing Transaction Wrapper
**File:** `database/migrations/050_email_notifications.sql`  
**Issue:** No `BEGIN;`/`COMMIT;` transaction wrapper  
**Impact:** MEDIUM - Inconsistent with other migrations, potential rollback issues

**Action Required:** Add `BEGIN;` at start and `COMMIT;` at end for consistency.

---

## ⚠️ WARNINGS

### 4. ESLint TypeScript Parsing Errors
**Files:** 
- `src/types/index.ts`
- `src/types/supabase.ts`
- `src/types/vue-shim.d.ts`
- `src/vite-env.d.ts`
- `supabase/functions/*.ts`

**Issue:** ESLint doesn't parse TypeScript files correctly  
**Error:** `Parsing error: Unexpected token interface/type/module`

**Fix:** Add `@typescript-eslint/parser` to ESLint config for TypeScript files, or exclude TypeScript files from ESLint linting.

---

### 5. Unused Variables (Potential Logic Errors)
**Files with unused variables:**

**High Priority:**
- `src/pages/Closet.vue`:
  - Line 700: `'Undo'` is defined but never used
  - Line 701: `'Redo'` is defined but never used
  - Line 703: `'Save'` is defined but never used
  - Line 719: `'authStore'` is assigned a value but never used

- `src/pages/Profile.vue`:
  - Line 319: `'theme'` is assigned a value but never used
  - Line 509: `'handleThemeToggle'` is assigned a value but never used

- `src/pages/OutfitCreator.vue`:
  - Line 413: `'theme'` is assigned a value but never used

**Medium Priority:**
- `src/services/friendsService.js`: Line 3: `'safeError'` is defined but never used
- `src/services/llamaDescriptionService.js`: Line 12: `'sanitizeToken'` is defined but never used
- `src/services/virtualTryOnService.js`: 
  - Line 12: `'sanitizeToken'` is defined but never used
  - Line 49: `'modelImageUrl'` is assigned a value but never used
- `src/stores/auth-store.js`: Line 45: `'sanitizeToken'` is defined but never used
- `src/stores/theme-store.js`: Line 193: `'event'` is defined but never used

**Action Required:** Review and remove unused variables or use them if they're needed.

---

### 6. Logic Potential Issue: Category vs Clothing Type
**Files:** 
- `050_add_slippers_category.sql` (adds 'slippers' to `category` constraint)
- `051_add_slippers_clothing_type.sql` (adds 'Slippers' to `clothing_type` constraint)

**Note:** These are different fields (`category` vs `clothing_type`) with different casing, so this may be intentional. Verify that both fields should support slippers and that the casing is correct.

---

## 📊 Summary

- **Build Errors:** ✅ None (TypeScript compiles successfully)
- **Syntax Errors:** ⚠️ ESLint parsing errors for TypeScript files (config issue, not code)
- **Logic Errors:** ⚠️ Several unused variables (potential incomplete code)
- **Critical:** 🔴 Duplicate migration numbers need to be fixed
- **Warnings:** 1997 ESLint style warnings (mostly Vue template formatting - non-blocking)

---

## 🎯 Recommended Action Plan

1. **URGENT:** Fix duplicate migration numbers
2. **HIGH:** Add transaction wrapper to `050_email_notifications.sql`
3. **MEDIUM:** Fix ESLint TypeScript parsing or exclude TS files
4. **LOW:** Clean up unused variables
5. **LOW:** Address ESLint style warnings (can be done incrementally)

