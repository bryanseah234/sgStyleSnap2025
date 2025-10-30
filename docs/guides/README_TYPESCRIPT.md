# TypeScript Integration Guide

## Overview

StyleSnap now includes TypeScript support for improved type safety and developer experience. While the existing JavaScript files remain compatible, you can gradually migrate to TypeScript for better code quality.

## What's Included

### 1. **TypeScript Configuration**
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.node.json` - Node-specific configuration for build tools
- Full Vue 3 and Vite support

### 2. **Type Definitions**
- `src/types/index.ts` - Core application types (User, ClothingItem, Outfit, etc.)
- `src/types/supabase.ts` - Supabase database type definitions
- `src/types/vue-shim.d.ts` - Vue component and library type shims
- `src/vite-env.d.ts` - Vite environment variable types

### 3. **Package Updates**
- TypeScript 5.3.3
- Vue TSC (Vue TypeScript Compiler)
- Updated build scripts with type checking

## Usage

### Building

**Fast Build (Default - Recommended for Production):**
```bash
npm run build
```
No type checking, works with JavaScript code.

**Build with Type Checking (Optional):**
```bash
npm run build:check
```
Includes TypeScript validation, use when ready.

### Type Checking

Run type checking without building:
```bash
npm run type-check
```

### Linting TypeScript

ESLint now supports TypeScript files:
```bash
npm run lint
npm run lint:fix
```

### Configuration Files

- **`tsconfig.json`** - Lenient config (allows JS, no strict checking)
- **`tsconfig.strict.json`** - Strict config (TypeScript only, full validation)

**Note:** The default build uses the lenient config, so your existing JavaScript code continues to work perfectly!

## Gradual Migration

You can migrate your JavaScript files to TypeScript gradually:

### 1. **Rename Files**
- `.js` → `.ts` for regular TypeScript files
- `.vue` files work out of the box with `<script setup lang="ts">`

### 2. **Add Type Annotations**

**Before (JavaScript):**
```javascript
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

**After (TypeScript):**
```typescript
import type { ClothingItem } from '@/types'

export function calculateTotal(items: ClothingItem[]): number {
  return items.reduce((sum, item) => sum + (item.purchase_price || 0), 0)
}
```

### 3. **Use Type Imports in Vue Components**

```vue
<script setup lang="ts">
import type { User, ClothingItem } from '@/types'
import { ref } from 'vue'

const user = ref<User | null>(null)
const items = ref<ClothingItem[]>([])
</script>
```

## Available Types

### Core Types
- `User` - User account and profile data
- `ClothingItem` - Clothing items in wardrobe
- `Outfit` - Outfit combinations
- `Friend` - Friend relationships
- `Notification` - User notifications

### Store Types
- `AuthStore` - Authentication state management
- `ThemeStore` - Theme state management

### Utility Types
- `ApiResponse<T>` - API response wrapper
- `PaginatedResponse<T>` - Paginated data response
- `Nullable<T>` - T | null
- `Optional<T>` - T | undefined

## Examples

### Using Types in Components

```vue
<script setup lang="ts">
import type { ClothingItem } from '@/types'
import { ref, onMounted } from 'vue'

// Typed refs
const items = ref<ClothingItem[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Typed function
async function fetchItems(): Promise<void> {
  loading.value = true
  try {
    // API call here
    items.value = await api.items.getAll()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchItems)
</script>
```

### Using Types in Stores

```typescript
import { defineStore } from 'pinia'
import type { User, AuthStore } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: (): Omit<AuthStore, keyof ReturnType<typeof actions>> => ({
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    setUser(user: User | null): void {
      this.user = user
    }
  }
})
```

### Using Supabase Types

```typescript
import type { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'

type ClothingItemRow = Database['public']['Tables']['clothing_items']['Row']
type ClothingItemInsert = Database['public']['Tables']['clothing_items']['Insert']

async function createItem(item: ClothingItemInsert): Promise<ClothingItemRow> {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

## Benefits

✅ **Type Safety** - Catch errors at compile time, not runtime
✅ **Better IntelliSense** - Improved autocomplete in your IDE
✅ **Refactoring Support** - Rename symbols safely across the codebase
✅ **Documentation** - Types serve as inline documentation
✅ **Reduced Bugs** - Prevent common type-related errors

## Best Practices

1. **Start with New Files** - Write new features in TypeScript
2. **Migrate Incrementally** - Convert files as you work on them
3. **Use Type Inference** - Let TypeScript infer types when obvious
4. **Avoid `any`** - Use specific types or `unknown` instead
5. **Create Custom Types** - Define types for your domain models

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Pinia TypeScript](https://pinia.vuejs.org/core-concepts/#typescript)

## Need Help?

Check the type definitions in `src/types/` for available types and interfaces. All core application types are documented with JSDoc comments.

