# TripCopycat — Project Rules

## Stack
- React + Vite, single-page app
- Main app: src/App.jsx (~3,600 lines)
- Database: Supabase (Postgres)
- Hosting: Vercel (project name: tripcopycat)
- Domain: tripcopycat.com via Porkbun
- Repo: github.com/crouch36/TripCopycat

## Deployment Rules — CRITICAL
- NEVER run `vercel`, `npx vercel`, or any Vercel CLI commands
- NEVER run `vercel --prod` or `vercel deploy`
- All deployments happen automatically via git push to GitHub
- Vercel watches the repo and auto-deploys — no manual deploy needed

## Development Rules
- Always read src/App.jsx before making changes
- Always run `npm run build` locally before git push — must show ✓ built with no errors
- All external services (Supabase, Gemini API, Porkbun, Google Search Console) are already configured — do not modify credentials or connections
- End every session with the standard git push only

## Code Stability Rules
- Never declare a useState or useRef AFTER a useEffect that references it — this causes temporal dead zone crashes
- Never use `transition: "all"` — always specify individual properties (transform, opacity, box-shadow, border-color)
- Never add overflow:hidden to the TripModal overlay — it breaks mobile scroll
- Never change zIndex on TripModal overlay without checking all other modal zIndex values
- The Supabase client lives in src/supabaseClient.js — never create a second instance in any file

## Pre-Push Checklist — Modal Navigation (ALWAYS VERIFY)
This is a primary user flow. After ANY change to TripModal, routing, scroll, or App state — manually verify all of the following before pushing:

1. **Open a trip** — click a trip card on homepage → modal opens with animation
2. **Close via X** — tap/click X button → returns to homepage, URL changes to /
3. **Close via backdrop** — tap outside the modal card → returns to homepage
4. **Scroll inside modal** — scroll through trip content → X button still works after scrolling
5. **Tab switching** — tap Daily Itinerary, All Details, back to Overview → X still works
6. **Direct link** — visit tripcopycat.com/trip/[id] → correct trip modal opens
7. **Author click** — click author name in modal header → modal closes, ProfilePage opens
8. **Back from ProfilePage** — close ProfilePage → homepage shows, no modal re-opens
9. **Share button** — tap 🔗 in modal → URL copied, modal stays open
10. **Mobile scroll** — on phone, scroll modal content → does not scroll background page

If ANY of these fail, do not push. Fix first.

## Known Fragile Areas
- TripModal X button: must remain position:fixed at viewport level (zIndex:1100) — do not move back inside scroll container
- popstate listener: must NOT call handlePath() immediately on mount — only on actual browser back/forward events
- allTrips useEffect: changes to allTrips trigger re-renders — any effect depending on [allTrips] must not re-open modals as a side effect
- window globals in use: __openTrip, __closeTripModal, __setViewingProfile, __setShowLegal, __INITIAL_TRIP_ID__ — do not remove or rename these
- iOS touch events: header buttons in TripModal need both onClick AND onTouchEnd to fire reliably after scrolling
