# Handoff (rewrite at the end of every session)

Last updated: 2026-10-28 by copilot

## Done
- Expo SDK 58 app scaffolded in `app/`, typecheck, lint and 4 unit tests pass; Android Metro bundle compiles.
- Data layer: SQLite `trips` table + repo (`src/data/trips.ts`).
- API layer: TfNSW Trip Planner client (stop search by name/coord, trip planning with mode filter) and GTFS-RT vehicle decoder.
- Screens: Home (last 5 + show all, add), All trips, Add trip (mode -> form), Place picker (by name / on map), Bus route picker, Trip board (Trip View style, 30 s refresh, reverse, edit-as-new, delete), Journey detail (map, live vehicle, interchange summary, stops), Settings (API key, base URL, notifications permission).
- API key obtained and verified: stop_finder, trip and GTFS-RT feeds work (see docs/API.md). Light rail live feeds wired.
- Not yet run on a device/emulator.

## Next
1. Run on an Android device/emulator (`npx expo run:android`) and verify the UI end to end; add API fixtures to `app/__tests__`.
2. Run `node scripts/build-bus-routes.mjs` to generate the full bus route list.
3. Add a Google Maps API key (`GOOGLE_MAPS_API_KEY`) for Android map tiles.
4. App icon/splash with the Wayline NSW identity.
5. Roadmap phase "Alerts" (see docs/ROADMAP.md).

## Blockers / open questions
- No API key was available during build; live behaviour is unverified.
- Confirm metro endpoints on the Open Data portal.
