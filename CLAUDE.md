# TripCopycat — Claude Working Document

> This file is the single source of truth for any Claude session working on TripCopycat.
> Read this before writing any code. Update it at the end of every session.

---

## Project Identity

- **Product:** TripCopycat — crowd-sourced travel itinerary platform
- **Entity:** Bishop Creek Ventures LLC, Canton OH (EIN obtained)
- **Owner:** Andrew Crouch — non-technical solo founder
- **Domain:** tripcopycat.com (Porkbun DNS → Vercel)
- **Admin email:** andrew@tripcopycat.com
- **Notifications email:** notifications@tripcopycat.com (Resend, domain verified)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite SPA |
| Database | Supabase (Postgres + Auth) — client in `src/supabaseClient.js` — never create a second instance |
| Image storage | Cloudflare R2 (`tripcopycat` bucket) |
| Hosting | Vercel Pro (under LLC, project name: tripcopycat) |
| Payments | Stripe live ($1.99 Blueprint purchases) |
| AI | Gemini 2.5 Flash (via `api/gemini.js`) |
| Email | Resend (via `api/notify-submission.js`) |
| Maps | Google Maps JS API + Geocoding API |

---

## Local Environment

- **Repo:** `C:\Users\crouc\tripcopycat`
- **Main file:** `src/App.jsx` (~3,150 lines after component split)
- **Deploy:** `git push origin main` ONLY — **never** `vercel`, `npx vercel`, `vercel deploy`, or any Vercel CLI commands
- **GitHub:** github.com/crouch36/TripCopycat
- **OS:** Windows (CRLF line endings — see critical section below)
- **Build command:** `cmd /c "npm run build"` — PowerShell blocks npm by default on this machine

---

## CRITICAL: Deployment Rules

- NEVER run `vercel`, `npx vercel`, `vercel --prod`, or `vercel deploy`
- All deployments happen automatically via `git push origin main`
- Vercel watches the repo and auto-deploys — no manual deploy ever needed
- Always run `cmd /c "npm run build"` locally before git push — must show ✓ built with no errors

---

## CRITICAL: File Handling — CRLF vs LF

**This has caused file corruption twice. Follow exactly.**

- Windows files use `\r\n` (CRLF). Linux Python uses `\n` (LF)
- **Always normalize before editing:** `content = content.replace("\r\n", "\n").replace("\r", "\n")`
- **Always write with LF:** `open(path, "w", encoding="utf-8", newline="\n")`
- **Never split lines and rejoin** on a CRLF file without normalizing first — doubles line count
- **Never use `newline="\r\n"`** when writing — causes line doubling

---

## File Delivery Rules (Andrew's Workflow)

- Deliver complete replacement files — never partial edits or diffs
- Git commands in isolated code blocks — never mixed with file content or prose
- Always work from the most recently uploaded file — stale uploads have caused cascading issues
- Never run `vercel deploy` — deploy is `git push origin main` only
- Copy changes for review and approval before applying to code

---

## Source File Map

| File | Lines | Purpose |
|---|---|---|
| `src/App.jsx` | ~3,150 | Main app shell, routing, all non-submit components |
| `src/constants.js` | ~82 | `C`, `REGIONS`, `TAGS`, `PRIMARY_TAGS`, `EXTENDED_TAGS`, `DURATION_FILTERS`, `catConfig`, `typeStyles`, `REGION_GRADIENTS`, `REGION_EMOJI` — imported by all split components |
| `src/SubmitTripModal.jsx` | ~711 | Step navigation, draft I/O, photo uploads, submission logic. Owns: `step`, `coverPhoto`, `focalPoint`, `galleryFiles`. Does NOT hold form text state. |
| `src/SubmitFormStep.jsx` | ~280 | Form fields, gallery, submitter details, footer. Owns all text state via `forwardRef`/`useImperativeHandle`. Always mounted in SubmitTripModal (display:none when hidden). |
| `src/HybridProcessor.jsx` | ~143 | AI brain dump + photo processing. Uses R2 upload flow. |
| `src/PhotoImportModal.jsx` | ~263 | Photo album import, EXIF extraction. Uses R2 upload flow. |
| `src/supabaseClient.js` | — | Single Supabase instance — never create a second |

---

## Code Stability Rules

- Never declare a `useState` or `useRef` AFTER a `useEffect` that references it — causes temporal dead zone crashes
- Never use `transition: "all"` — always specify individual properties (transform, opacity, box-shadow, border-color)
- Never add `overflow:hidden` to the TripModal overlay — breaks mobile scroll
- Never change `zIndex` on TripModal overlay without checking all other modal zIndex values
- The Supabase client lives in `src/supabaseClient.js` — never create a second instance in any file
- Window globals in use: `__openTrip`, `__closeTripModal`, `__setViewingProfile`, `__setShowLegal`, `__INITIAL_TRIP_ID__` — do not remove or rename

---

## Vercel Environment Variables (all set)

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
SUPABASE_ANON_KEY
VITE_GOOGLE_MAPS_KEY          # browser-restricted Maps JS key
GOOGLE_GEOCODING_KEY          # unrestricted server-side geocoding key
VITE_GEMINI_API_KEY
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY             # sk_live_...
STRIPE_WEBHOOK_SECRET
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME                # tripcopycat
R2_PUBLIC_URL                 # https://pub-f680025b41de449893423994b6e1c42b.r2.dev
RESEND_API_KEY
GEOCODE_SECRET
VITE_GEOCODE_SECRET
```

---

## API Functions (`api/`)

| File | Purpose | Notes |
|---|---|---|
| `gemini.js` | Proxies Gemini AI requests | Handles `{ contents }` (legacy) and `{ imageUrls, prompt }` (current R2 flow) |
| `upload-image.js` | Uploads raw binary to R2 | Reads raw request body — NOT JSON |
| `approve-submission.js` | Approves a submission → inserts into `trips` | Uses `SUPABASE_SERVICE_KEY` to bypass RLS. Protected by `x-admin-secret` header (reuses `GEOCODE_SECRET`). Also updates `submissions.status` to approved. Geocoding is fired client-side after success. |
| `geocode-venues.js` | Geocodes venues on trip approval | Uses `GOOGLE_GEOCODING_KEY`, protected by `GEOCODE_SECRET` header |
| `notify-submission.js` | Sends email on new submission | From `notifications@tripcopycat.com`, links to `/#admin` |
| `trip/[id].js` | Server-renders trip pages for SEO | Canonical URL uses `/trips/:id` (plural — must match sitemap) |
| `sample-blueprint.js` | Serves sample Blueprint page | Injects `VITE_GOOGLE_MAPS_KEY` server-side |
| `stripe-webhook.js` | Handles Stripe checkout events | Live keys only |
| `create-checkout.js` | Creates Stripe checkout session | |
| `sitemap.xml.js` | Dynamic sitemap | Uses `/trips/:id` URLs |
| `image.js` | Image proxy for OG images | |

---

## CRITICAL: Gemini Photo Upload Flow

**This was broken and fixed — do not revert to inline base64.**

### Problem
Vercel has a hard 4.5MB payload limit on serverless functions. Sending mobile photos as base64 inline to `/api/gemini` exceeds this and returns HTTP 413. The `export const config` bodyParser trick does NOT work in plain Vercel functions (Next.js only).

### Solution (currently implemented)
1. Client compresses each photo to blob (1200px / 0.7q) using canvas
2. Each blob uploads directly to R2 via `POST /api/upload-image?folder=temp&type=image%2Fjpeg&name=photo.jpg` as **raw binary body**
3. R2 URLs collected into `photoUrls` array
4. Client sends `{ imageUrls: [...], prompt: "..." }` to `/api/gemini` — tiny JSON payload, no 413
5. `gemini.js` detects `imageUrls` format, fetches each image from R2 server-side, converts to base64, builds `inline_data` parts, calls Gemini

### Two files that use this pattern
- `src/PhotoImportModal.jsx` — photo album import
- `src/HybridProcessor.jsx` — submit trip brain dump + photos

---

## CRITICAL: SubmitTripModal Form Performance

### Root cause of mobile freeze (resolved Apr 11 2026)
Every keystroke previously called `setForm()` in `SubmitTripModal` → re-rendered the entire modal tree including the header and X button → rapid typing across multiple fields queued enough re-renders to block click events.

### Current architecture (fully implemented)
- **Form state lives in `SubmitFormStep`** — keystrokes only re-render that component
- `SubmitTripModal` reads values at submit time via `formStepRef.current.getForm()` and `formStepRef.current.getSubmitterInfo()`
- `SubmitFormStep` uses `forwardRef` + `useImperativeHandle` to expose: `getForm()`, `getSubmitterInfo()`, `mergeForm(data)`, `setFormData(data)`
- `SubmitFormStep` is **always mounted** inside `SubmitTripModal` (wrapped in `display:none` when hidden) — form state survives step transitions
- Draft status indicator uses **DOM manipulation** (`document.getElementById("draft-status")`) — zero re-renders
- `draftSaving` and `draftSaved` state variables **do not exist** — do NOT add them back
- Every keystroke writes to `localStorage` immediately via `useEffect` on `form` in `SubmitFormStep`
- Supabase auto-save runs every 20 seconds via timer in `SubmitTripModal` — calls `formStepRef.current?.getForm()`
- Unmount effect in `SubmitFormStep` does final localStorage save

### What SubmitTripModal owns (do not move to SubmitFormStep)
`coverPhoto`, `coverPhotoPreview`, `focalPoint`, `galleryFiles`, `galleryError`, `photoError` — needed by `handleSubmit` for upload logic

---

## Pre-Push Checklist — Modal Navigation (ALWAYS VERIFY)

After ANY change to TripModal, routing, scroll, or App state:

1. Open a trip card → modal opens with animation
2. Close via X → returns to homepage, URL changes to /
3. Close via backdrop → returns to homepage
4. Scroll inside modal → X button still works after scrolling
5. Tab switching (Daily Itinerary, All Details, Overview) → X still works
6. Direct URL `/trips/:id` → correct trip modal opens
7. Author click → modal closes, ProfilePage opens
8. Back from ProfilePage → homepage shows, no modal re-opens
9. Share button → URL copied, modal stays open
10. Mobile: scroll modal content → background page does not scroll

If ANY fail → do not push. Fix first.

---

## Known Fragile Areas

- **TripModal X button:** must remain `position:fixed` at viewport level (zIndex:1100) — do not move inside scroll container
- **popstate listener:** must NOT call `handlePath()` immediately on mount — only on actual browser back/forward events
- **allTrips useEffect:** changes to `allTrips` trigger re-renders — effects depending on `[allTrips]` must not re-open modals as side effect
- **iOS touch events:** header buttons in TripModal need both `onClick` AND `onTouchEnd` to fire reliably after scrolling
- **Instagram template:** `public/instagram-template.html` must be excluded from SPA catch-all in `vercel.json`
- **SubmitFormStep always mounted:** do not convert to conditional render — form state would be lost on step transitions

---

## Supabase Schema Notes

### Tables
- `trips` — published trips. Key columns: `venue_coords` (jsonb), `image`, `gallery` (jsonb array), `focal_point` (jsonb), `featured` (bool), `user_id`
- `submissions` — user submissions. Key columns: `approved_trip_id` (uuid), `ai_flag_reason`, `status` (pending/flagged/approved/rejected)
- `blueprint_purchases` — Stripe purchases. Columns: `id`, `trip_id`, `stripe_session_id`, `customer_email`, `amount_paid`, `paid_at`. **No `user_id` column.**
- `profiles` — user profiles
- `analytics_events` — page/event tracking
- `drafts` — one row per user, `form_data` jsonb

### RLS (all secured Apr 10 2026)
- All tables have RLS enabled
- `trips`: public read, service role insert/delete, users update own — **client anon key cannot insert into trips**. All trip inserts must go through `api/approve-submission.js` or `api/` functions using `SUPABASE_SERVICE_KEY`
- `submissions`: public read, anon/authenticated insert, service role update
- `blueprint_purchases`: public read, service role insert
- `analytics_events`: anon/authenticated insert
- `profiles`: public read, users insert own

---

## Google Maps / Geocoding

- `VITE_GOOGLE_MAPS_KEY` — browser-restricted, used in BlueprintPage and sample-blueprint.js
- `GOOGLE_GEOCODING_KEY` — **unrestricted** server key, used only in `api/geocode-venues.js`
- `venue_coords` jsonb column stores geocoded lat/lng in `trips` table
- "🗺 Regeocode All" button in admin queue regenerates coords for all published trips
- KML export uses `venue_coords` with `xmlEsc()` sanitization

---

## SEO Infrastructure

- `api/trip/[id].js` server-renders trip pages for Googlebot — always returns 200, no redirects inside
- Canonical URL format: `/trips/:id` (plural — matches both sitemaps)
- `vercel.json` rewrites: both `/trip/:id` AND `/trips/:id` route to `api/trip/[id].js` — transparent rewrites, not redirects
- JSON-LD: `TouristTrip` + `FAQPage` schema on each trip page

### Sitemaps — CRITICAL: both files must use `https://www.tripcopycat.com` (www) and `/trips/` (plural)
- `scripts/generate-sitemap.js` — build-time, writes `public/sitemap.xml`. Runs as part of `npm run build`.
- `api/sitemap.xml.js` — runtime serverless, served at `/sitemap.xml` via vercel.json rewrite.
- **Previous bug (fixed Apr 11 2026):** `generate-sitemap.js` was using `https://tripcopycat.com` (no www) and `api/sitemap.xml.js` was using `/trip/` (singular). This caused Google to flag all 8 trip pages as redirect errors and refuse to index them. Both files now use www + `/trips/`.
- Do NOT change SITE_URL in either file without updating both simultaneously.

### Console noise — not a bug
- Travelpayouts `[tp] config is not valid` error in browser console — harmless. Their tracker script is noisy when no affiliate widgets are present. Ignore it.

### Current indexing status (Apr 11 2026)
- 8 trip pages resubmitted for indexing after sitemap fix — expect Google to recrawl within days
- `www.tripcopycat.com/index.html` showing as "Alternate page with proper canonical" — harmless, Google correctly deferring to canonical homepage

---

## Image Storage

### Cloudflare R2 (current — all new uploads)
- Public URL: `https://pub-f680025b41de449893423994b6e1c42b.r2.dev`
- Subfolders: `photos/` (cover), `gallery/` (gallery), `temp/` (Gemini analysis)
- Upload: `POST /api/upload-image?folder=X&type=image%2Fjpeg&name=filename.jpg` with raw binary body

### Supabase Storage (legacy)
- Bucket `trip-photos` still exists but no longer used for new uploads
- Egress grace period until May 6 2026 — watch for usage emails

### Missing gallery photos
Scotland, Prague, Amalfi, Ireland gallery photos were lost pre-R2 migration. Re-upload via admin edit modal (📤 Add Photos button). Cover photos are intact.

---

## Authentication

- Admin login: password-protected via `AdminLoginModal` — `/#admin` opens it
- User auth: Supabase email/password
- Leaked password protection: PENDING — requires custom SMTP in Supabase

---

## Stripe

- Live keys in Vercel (`sk_live_...`)
- Webhook registered under **live mode** at `https://www.tripcopycat.com/api/stripe-webhook`
- Sandbox webhook failure emails: expected, stopped Apr 11 2026 — ignore

---

## Email (Resend)

- Domain `tripcopycat.com` verified
- From: `TripCopycat <notifications@tripcopycat.com>`
- Trigger: Supabase webhook on INSERT to `submissions` table
- Admin link: `https://www.tripcopycat.com/#admin`

---

## Admin Queue

- Two tabs: **Needs Review** (pending/flagged) and **Completed** (approved/rejected)
- Opens on Needs Review by default
- Approve: inserts to `trips`, fires geocoding, updates `submissions.approved_trip_id`

---

## Known Pending Items

- [ ] Gallery re-upload: Scotland, Prague, Amalfi, Ireland — via admin edit modal
- [ ] Leaked password protection — enable once Supabase custom SMTP configured
- [ ] SVG favicon not square — `copycat.svg` viewBox is 953×1166, needs squaring then re-index in Search Console
- [ ] Auto-approve low-risk submissions (AI filter passed → publish immediately)
- [ ] Supabase egress resets May 6 2026
- [ ] Continue App.jsx component split — remaining large components: `TripModal`, `AdminQueueModal`, `BlueprintPage`

---

## Color System (C object — key tokens)

```js
C.slate      = "#1C2B3A"   // Primary dark navy
C.amber      = "#C1692A"   // Primary orange / CTA
C.cta        = "#C4A882"   // Warm sand CTA button color
C.ctaText    = "#1C2B3A"   // Dark text on CTA buttons
C.white      = "#FFFFFF"   // Card backgrounds
C.seafoam    = "#FAF7F2"   // Page/modal background
C.tide       = "#E8DDD0"   // Borders
C.muted      = "#A89080"   // Muted text
C.green      = "#7A9E5A"   // Success
C.red        = "#B03A2E"   // Error/danger
```

Full `C` object now lives in `src/constants.js` and is imported by all split components.

---

*Last updated: April 11, 2026 — Component split complete. Form freeze fixed. Approval 403 fixed (service role via api/approve-submission.js). Cover photo empty string bug fixed. Sitemap www/plural bug fixed — all 8 trip pages resubmitted for indexing. Gallery photos restored on all pre-migration trips. All trips published and confirmed working.*
