# ⚠️ IMPORTANT: Run Database Migration

## You need to run this migration to fix the catalog function!

The catalog "Add to Closet" feature won't work until you run migration 047.

### Quick Steps:

**Option 1: Via Terminal (Recommended)**
```bash
# Make sure you're in the project root
cd X:\sgStyleSnap2025

# Run the migration (replace with your actual database URL)
psql YOUR_DATABASE_URL -f database/migrations/047_ensure_catalog_ownership_function.sql
```

**Option 2: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy the contents of `database/migrations/047_ensure_catalog_ownership_function.sql`
5. Paste into the editor
6. Click "Run" button

### What This Migration Does:
- Creates the `is_catalog_item_owned()` function
- Allows users to add catalog items to their closet
- Prevents duplicate items
- Fixes the 404 error you were seeing

### Verify It Worked:
After running the migration, try adding a catalog item to your closet. It should work without errors!

You can also check if the function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'is_catalog_item_owned';
```

Should return: `is_catalog_item_owned`

