# Design Document — Codebase Remediation
**Date:** 2026-04-17  
**Scope:** Surgical fixes for bugs BUG-01 through BUG-11 from bugfix.md

---

## Guiding Principle

Minimum viable change per bug. Preserve existing style, naming conventions, and module structure. No architectural rewrites unless the bug requires it.

---

## BUG-01 — `subscribe()` missing `await`

**Change:** Add `async` to `subscribe()` and `await` the `getUser()` call.

**Before:**
```js
subscribe(callback) {
  try {
    const { data: { user }, error: userError } = supabase.auth.getUser()
```

**After:**
```js
async subscribe(callback) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
```

**Dependency check:** `supabase.auth.getUser()` has always been async in `@supabase/supabase-js` v2. No version change needed. All callers of `subscribe()` must handle that it now returns a Promise — check call sites.

---

## BUG-02 — VAPID Signing Stub

**Decision:** The stub cannot be trivially fixed without the Web Push VAPID ES256 signing algorithm. Two options:

- **Option A (Recommended):** Remove the stub function and the entire push delivery loop from `send-push-notification/index.ts`. Replace function body with a clear `501 Not Implemented` response. Remove misleading "completed" status from documentation. This is safer than leaving broken code silently failing.
- **Option B:** Implement proper VAPID ES256 signing using the `SubtleCrypto` API available in Deno. Requires importing VAPID private key as a CryptoKey and signing the JWT payload. High complexity, out of scope for surgical fix.

**Selected:** Option A. Stub the function body to return 501. Document as "not implemented."

---

## BUG-03 — Outfit Sharing Non-Existent RPCs

**Decision:** Three options:

- **Option A:** Create `outfit_shares` table migration and the three missing RPC functions. High scope.
- **Option B (Recommended):** Add safe guard wrappers in `notificationsService.js` that return a clear `{ success: false, error: 'Feature not yet implemented' }` instead of letting the Supabase RPC call throw a silent error. Add a `TODO` comment. Zero DB changes required.
- **Option C:** Remove the dead methods entirely.

**Selected:** Option B. Graceful degradation — callers get a clear error object, UI can show a user-facing message. Zero migration risk.

---

## BUG-04 — Webhook Signature Bypass

**Change:** In `verifyWebhookSignature()`, when `WEBHOOK_SECRET` is set but svix headers are absent, return `false` (rejected) rather than `true`. Only skip verification when `WEBHOOK_SECRET` is explicitly not configured.

**Logic:**
```
if (!WEBHOOK_SECRET) → skip verification (return true) — dev/testing mode
if (WEBHOOK_SECRET is set AND svix headers are absent) → return false (reject)
if (WEBHOOK_SECRET is set AND headers present) → verify and return result
```

---

## BUG-05 — Production `console.error` Monkey-Patch

**Change:** Narrow the suppression pattern list in `src/main.js`. Remove generic patterns that can match real errors:
- Remove: `"Cannot read properties of undefined"`, `"reading 'control'"`, `"control'"`, `"shouldOfferCompletionListForField"`, `"utils.js"`, `"extensionState.js"`, `"heuristicsRedefinitions.js"`, `"content_script.js"`
- Keep only: `"No tab with id"`, `"runtime.lastError"`, `"Extension context"`, `"message channel closed"`, `"chrome-extension://"`, `"moz-extension://"`, `"ERR_FILE_NOT_FOUND"`

**Rationale:** These specific strings are unambiguously browser extension errors. The generic object/property strings are too broad.

---

## BUG-06 — `notify.js` Auth Gate Optional

**Change:** Make the `NOTIFY_INTERNAL_SECRET` check mandatory. If the env var is missing in production, log a startup warning but still reject unauthenticated requests with a 401. Add a `NODE_ENV` check: in development (`NODE_ENV !== 'production'`), allow unauthenticated calls for local testing.

**Logic:**
```
if (!internalSecret && NODE_ENV === 'production') → 401 (misconfiguration)
if (!internalSecret && NODE_ENV !== 'production') → allow (dev mode)
if (internalSecret && header matches) → allow
if (internalSecret && header missing/wrong) → 401
```

---

## BUG-07 — `notification_delivery_log` Missing Table

**Decision:** Two options:
- **Option A:** Create migration `049_notification_delivery_log.sql`
- **Option B (Recommended):** Remove the `.from('notification_delivery_log').insert()` calls from `send-push-notification/index.ts`. The delivery outcome is already tracked via `mark_subscription_failed` RPC. The log table is redundant.

**Selected:** Option B. No new migration, no new table dependency.

---

## BUG-08 — Duplicate Friend Closet Route

**Change:** Remove `/closet/view/friend/:username` → `Cabinet.vue` from `main.js`. The canonical route is `/friend/:username/closet` → `FriendCabinet.vue`. Audit any `router.push` calls that use the deprecated path and update them to the canonical route.

---

## BUG-09 — Debug Monkey-Patches in Production

**Change:** Wrap the three debug blocks in `src/main.js` with `if (import.meta.env.DEV)` guards:
1. `history.pushState` / `history.replaceState` override block
2. `setInterval` location change tracker
3. `console.error` override (also applying BUG-05 narrowing)

Vite exposes `import.meta.env.DEV` as `true` only in development mode. In production builds it is `false` and the dead code is tree-shaken.

---

## BUG-10 — Recommendation Deduplication

**Change:** In `generateOutfitCombinations()`, track generated combination signatures using a `Set<string>` keyed by sorted item IDs joined with `|`. Skip adding if signature already in set.

```js
const seen = new Set()
// before push:
const key = combo.map(i => i.id).sort().join('|')
if (!seen.has(key)) { seen.add(key); combinations.push(combo) }
```

---

## BUG-11 — `hybrid-api.js` Silent Mock Fallback

**Change:** In the `catch` block of each `EntityService` method, throw the error instead of silently falling back. Wrap in a try-catch at the call site in the entity method so Supabase errors propagate to the caller.

**Note:** The mock fallback for when `isSupabaseConfigured === false` (offline/dev mode) is intentional and should be preserved. Only the silent fallback *during a live Supabase error* needs to throw.

---

## Dependency & Compatibility Verification

| File | Runtime | Dependencies | Version Risk |
|---|---|---|---|
| `notificationsService.js` | Browser | `@supabase/supabase-js` v2 | None — `getUser()` has been async since v2.0 |
| `send-push-notification/index.ts` | Deno (Edge) | `@supabase/supabase-js` v2 via esm.sh | None |
| `sync-auth-users-realtime/index.ts` | Deno (Edge) | `@supabase/supabase-js` v2 via esm.sh | None |
| `api/notifications/notify.js` | Node.js (Vercel) | `@getbrevo/brevo` v3 | None |
| `src/main.js` | Browser (Vite) | `import.meta.env.DEV` guard | Available in Vite 2+ |
| `recommendation-service.js` | Browser | None (pure JS) | None |
| `hybrid-api.js` | Browser | `@supabase/supabase-js` v2 | None |

No dependency version changes required for any fix.
