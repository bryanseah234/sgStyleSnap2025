# Tasks — Codebase Remediation
**Date:** 2026-04-17  
**Source:** bugfix.md + design.md

Execute sequentially. Mark `[x]` when complete.

---

- [x] 1. Fix missing `await` in `notificationsService.subscribe()` (BUG-01)
  - [x] 1.1 Add `async` keyword to `subscribe()` method signature
  - [x] 1.2 Add `await` before `supabase.auth.getUser()` call
  - [x] 1.3 Verify all callers of `subscribe()` handle async return correctly
  - Acceptance: `subscribe()` is `async`, `user.id` resolves to a real UUID, channel filter is `recipient_id=eq.<uuid>`

- [x] 2. Stub push notification function to 501 (BUG-02)
  - [x] 2.1 Replace `generateVapidAuthHeader()` with a comment noting it is unimplemented
  - [x] 2.2 Replace the main `serve()` handler body with a `501 Not Implemented` response
  - [x] 2.3 Remove `notification_delivery_log` insert calls (also fixes BUG-07)
  - Acceptance: Function returns `{ error: 'Push notifications not yet implemented' }` with HTTP 501. No fake JWT generation.

- [x] 3. Add graceful degradation to outfit sharing RPCs (BUG-03)
  - [x] 3.1 Wrap `shareOutfitWithFriends()` to return `{ success: false, error: 'Feature not yet implemented' }` without calling RPC
  - [x] 3.2 Wrap `getSharedOutfits()` to return `[]` with a console warning
  - [x] 3.3 Wrap `markOutfitShareViewed()` to return `{ success: false, error: 'Feature not yet implemented' }`
  - Acceptance: Calling these methods returns a safe error object. No Supabase RPC call is made. No uncaught exception thrown.

- [x] 4. Harden webhook signature verification (BUG-04)
  - [x] 4.1 In `verifyWebhookSignature()`: when `WEBHOOK_SECRET` is set AND svix headers are absent, return `false`
  - [x] 4.2 Only return `true` without verification when `WEBHOOK_SECRET` is explicitly `undefined`/empty
  - Acceptance: A POST with no svix headers to a function with `WEBHOOK_SECRET` set returns HTTP 401.

- [x] 5. Narrow `console.error` suppression patterns (BUG-05)
  - [x] 5.1 Remove from `extensionErrorPatterns` array: `"Cannot read properties of undefined"`, `"reading 'control'"`, `"control'"`, `"shouldOfferCompletionListForField"`, `"utils.js"`, `"extensionState.js"`, `"heuristicsRedefinitions.js"`, `"heuristicsRedefinitions.js"`, `"content_script.js"`
  - Acceptance: Patterns array contains only unambiguous browser-extension-specific strings.

- [x] 6. Wrap debug monkey-patches in `import.meta.env.DEV` guard (BUG-09)
  - [x] 6.1 Wrap `history.pushState` override block in `if (import.meta.env.DEV) { ... }`
  - [x] 6.2 Wrap `history.replaceState` override block in same guard
  - [x] 6.3 Wrap `setInterval` location-change tracker in same guard
  - [x] 6.4 Wrap `console.error` override block in same guard
  - [x] 6.5 Wrap blank-page recovery `startBlankPageMonitor` call in same guard
  - Acceptance: Production build (`npm run build`) has none of these overrides active. Dev build retains them.

- [x] 7. Make `NOTIFY_INTERNAL_SECRET` mandatory in production (BUG-06)
  - [x] 7.1 Update auth check logic: if secret is missing AND `NODE_ENV === 'production'`, return 401 with message `"Server misconfiguration: NOTIFY_INTERNAL_SECRET not set"`
  - [x] 7.2 If secret is missing AND not production, log a warning and allow (dev mode bypass)
  - Acceptance: Unauthenticated POST to `/api/notifications/notify` in production returns 401 regardless of whether the env var is set.

- [x] 8. Remove duplicate friend closet route (BUG-08)
  - [x] 8.1 Remove `{ path: '/closet/view/friend/:username', component: Cabinet, meta: { requiresAuth: true, subRoute: 'friend' } }` from `main.js` routes array
  - [x] 8.2 Search codebase for any `router.push('/closet/view/friend/` usages and update to `/friend/:username/closet`
  - Acceptance: Only one route resolves to a friend closet view. `/closet/view/friend/*` returns 404.

- [x] 9. Add deduplication to `generateOutfitCombinations()` (BUG-10)
  - [x] 9.1 Add `const seen = new Set()` before combination loops
  - [x] 9.2 Before each `combinations.push(combo)`, compute key as `combo.map(i => i.id).sort().join('|')` and skip if already in `seen`
  - Acceptance: No two entries in the returned array have the same sorted set of item IDs.

- [x] 10. Propagate errors in `hybrid-api.js` EntityService (BUG-11)
  - [x] 10.1 In `list()`: when `isSupabaseConfigured` is true and Supabase throws, re-throw the error instead of falling back to mock
  - [x] 10.2 In `filter()`: same
  - [x] 10.3 In `create()`: same
  - [x] 10.4 In `update()`: same
  - [x] 10.5 In `delete()`: same
  - [x] 10.6 Preserve existing mock fallback path when `isSupabaseConfigured === false`
  - Acceptance: A Supabase error in any method throws and propagates to the caller. The mock path still works when Supabase is not configured.
