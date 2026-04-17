# Bug Log — Codebase Remediation
**Source:** reconciliation_audit.md + security_audit.md  
**Date:** 2026-04-17

---

## BUG-01 — Missing `await` on `supabase.auth.getUser()` in `subscribe()`
| Field | Value |
|---|---|
| Status | Open |
| File | `src/services/notificationsService.js` |
| Method | `subscribe()` |
| Root Cause | `supabase.auth.getUser()` is async and returns a Promise. Called without `await`, so `user` is the Promise object itself, not the resolved user. The realtime channel filter becomes `recipient_id=eq.undefined`. |
| Impact | CRITICAL. Every authenticated user receives every other user's notification events. Data leak across all active sessions. |

---

## BUG-02 — VAPID JWT Signing is a Stub (Push Notifications Non-Functional)
| Field | Value |
|---|---|
| Status | Open |
| File | `supabase/functions/send-push-notification/index.ts` |
| Function | `generateVapidAuthHeader()` |
| Root Cause | The JWT is assembled with a hardcoded literal `"signature"` string instead of a real ES256 HMAC signature over the VAPID key pair. The push service rejects all requests. |
| Impact | HIGH. All push notifications silently fail. No error is surfaced to the user or logged as a business-level failure. Feature is non-functional in production. |

---

## BUG-03 — Outfit Sharing Calls Non-Existent Database RPCs
| Field | Value |
|---|---|
| Status | Open |
| File | `src/services/notificationsService.js` |
| Methods | `shareOutfitWithFriends()`, `getSharedOutfits()`, `markOutfitShareViewed()` |
| Root Cause | Three `.rpc()` calls reference `share_outfit_with_friends`, `get_shared_outfits`, `mark_outfit_share_viewed` — none of which exist in any migration (001–048). No `outfit_shares` table exists. |
| Impact | HIGH. The `/outfits/add/friend/:username` UI route is reachable but fails silently end-to-end. User sees no error message. |

---

## BUG-04 — Unauthenticated POST Can Force-Upsert Any User Record
| Field | Value |
|---|---|
| Status | Open |
| File | `supabase/functions/sync-auth-users-realtime/index.ts` |
| Function | `verifyWebhookSignature()` |
| Root Cause | When `svix-id`, `svix-timestamp`, or `svix-signature` headers are absent, the function returns `true` (verified) regardless of whether a `WEBHOOK_SECRET` is set. Any unauthenticated HTTP POST with a crafted JSON body can upsert arbitrary records into `public.users`. |
| Impact | HIGH. Privilege escalation / account takeover if attacker knows a target user UUID. |

---

## BUG-05 — Production `console.error` Monkey-Patch Suppresses Real Errors
| Field | Value |
|---|---|
| Status | Open |
| File | `src/main.js` |
| Root Cause | `console.error` is globally overridden. The suppression pattern list includes generic strings like `"Cannot read properties of undefined"`, which matches legitimate application errors. Override is active in production. |
| Impact | MEDIUM. Application runtime errors are silently swallowed. Debugging in production is impaired. Real bugs go unreported. |

---

## BUG-06 — `notify.js` Auth Gate is Optional (Email Abuse Vector)
| Field | Value |
|---|---|
| Status | Open |
| File | `api/notifications/notify.js` |
| Root Cause | `NOTIFY_INTERNAL_SECRET` check only executes if the env var is set. If unset, the endpoint is fully public. Any actor can POST to send transactional emails via the Brevo account. |
| Impact | MEDIUM. Email abuse, Brevo quota exhaustion, potential domain blacklisting. |

---

## BUG-07 — `notification_delivery_log` Table Does Not Exist
| Field | Value |
|---|---|
| Status | Open |
| File | `supabase/functions/send-push-notification/index.ts` |
| Root Cause | Code inserts into `notification_delivery_log` on every push attempt (success and failure paths). This table is not in any migration. Every push attempt generates a silent secondary DB error. |
| Impact | MEDIUM. Push delivery audit trail is permanently absent. Secondary error noise in Supabase logs. |

---

## BUG-08 — Duplicate Route for Friend Closet (Navigation Inconsistency)
| Field | Value |
|---|---|
| Status | Open |
| File | `src/main.js` |
| Root Cause | `/closet/view/friend/:username` → `Cabinet.vue` and `/friend/:username/closet` → `FriendCabinet.vue` are both registered. Internal links from different areas resolve to different components with different UI states. |
| Impact | LOW-MEDIUM. Users may see different interfaces depending on which link they follow to a friend's closet. |

---

## BUG-09 — Debug Navigation Monkey-Patches Active in Production
| Field | Value |
|---|---|
| Status | Open |
| File | `src/main.js` |
| Root Cause | `history.pushState`, `history.replaceState`, and `console.error` are monkey-patched. A `setInterval` polls every 100ms to track location changes. These are debug artifacts never removed before production. |
| Impact | LOW-MEDIUM. Minor performance cost from 100ms polling. Risk of masking real errors. Confusing noise in production logs. |

---

## BUG-10 — Recommendation Combination Generator Has No Deduplication
| Field | Value |
|---|---|
| Status | Open |
| File | `src/services/recommendation-service.js` |
| Function | `generateOutfitCombinations()` |
| Root Cause | No Set or identity check on generated combinations. Items in overlapping category arrays can produce identical `[top, bottom]` pairs multiple times. |
| Impact | LOW. Duplicate outfit recommendations shown to users. Wastes scoring API calls against `ftransformer`. |

---

## BUG-11 — `hybrid-api.js` Silently Falls Back to Mock Data on Any DB Error
| Field | Value |
|---|---|
| Status | Open |
| File | `src/api/hybrid-api.js` |
| Class | `EntityService` |
| Root Cause | Any Supabase error in `list()`, `filter()`, `create()`, `update()`, `delete()` is caught and falls back to `localStorage` mock data with only `console.warn`. No error state is returned or propagated to callers. |
| Impact | LOW-MEDIUM. UI silently shows stale mock data when the database is unreachable. Users believe operations succeeded. |
