# MEMORY.md - shared project memory (append-only, newest first)

Format: `YYYY-MM-DD [agent] note`. Do not rewrite history; add a new entry that supersedes an old one.

## Decisions
- 2026-10-28 [copilot] App name: **Wayline NSW** (package `com.santhoser.waylinensw`, scheme `wayline`). Not official TfNSW branding; avoid "Opal"/"Trip View" in names. Play Store/trademark availability unchecked.
- 2026-10-28 [copilot] Stack: Expo SDK 58 + React Native 0.88, TypeScript, expo-router, TanStack Query, Zustand, expo-sqlite (raw SQL, no ORM), react-native-maps, gtfs-realtime-bindings, expo-notifications, expo-secure-store. Chosen over Capacitor (native HTTP/no CORS, maps, background).
- 2026-10-28 [copilot] Android pilot first; iOS starts about 1-2 months after pilot, informed by customer feedback.
- 2026-10-28 [copilot] Alerts = notifications. Plumbing only now (permission + Android channel in `src/notifications/setup.ts`); alert logic is a later phase.
- 2026-10-28 [copilot] Public-release plan for API limits (~5 req/s, ~60k/day per key; keys are per portal account, cannot be issued per device): pilot uses one key; before wide release add a stateless caching proxy (key hidden, GTFS-RT cached). API base URL is configurable in Settings to make that switch config-only. BYO-key remains an option.
- 2026-10-28 [copilot] UI theme: Hallmark "Wayfind" (cool grey paper, blue-black ink, Chivo Mono, square 2px borders, cobalt = live, amber = figures). Layout mirrors Trip View: minutes plate on the left in line colour, from/to times, status, line labels; map above stop list on detail.
- 2026-10-28 [copilot] Bus route list is a bundled JSON (`app/assets/data/bus-routes.json`, seed of 6 routes). Generate the full list with `scripts/build-bus-routes.mjs` (needs API key; downloads GTFS). Route trips = route number + from/to stops; board filters journeys to that line.

## Gotchas
- 2026-10-28 [copilot] `npm install` needs `legacy-peer-deps` (in `app/.npmrc`) because of a react-dom peer mismatch.
- 2026-10-28 [copilot] TS 6: `tsconfig.json` sets `"types": ["jest"]` explicitly.
- 2026-10-28 [copilot] `expo export` Hermes step fails with `spawn EPERM` in the sandboxed dev environment; Metro bundling itself succeeds. Use a real device/emulator build to verify.
- 2026-10-28 [copilot] UNVERIFIED against live API (no key available when written): field names in `src/api/tripPlanner.ts` (rapidJSON: `departureTimePlanned/Estimated`, `transportation.product.class`, `stopSequence`, `coords`), `RealtimeTripId` for matching GTFS-RT vehicles, and GTFS-RT feed paths in `src/domain/modes.ts`. Verify with a real key and fix + add fixtures.
- 2026-10-28 [copilot] Light rail has no vehicle-position feed wired yet (`vehicleFeed: null`); per-line feeds exist upstream.
- 2026-10-28 [copilot] Bus vehicle feed is large; polled every 15 s only while the detail screen is open.
