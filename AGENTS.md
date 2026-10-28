# AGENTS.md - shared rules for every coding agent (GitHub Copilot, Codex, others)

Read this file, then `MEMORY.md`, then `docs/HANDOFF.md` before doing anything. Update `MEMORY.md` and `docs/HANDOFF.md` before you finish. `.github/copilot-instructions.md` and any Codex config only point here; do not fork the rules.

## Product
**Wayline NSW**: a standalone Android-first (iOS later) app for NSW public transport (train, metro, light rail, bus, ferry), modelled on Trip View. No backend: data is stored on-device (SQLite) and the app calls Transport for NSW (TfNSW) Open Data APIs directly. Saved trips, next departures, journey detail (interchanges, live vehicle on map). Alerts are a later phase and will be notifications.

## Layout
- `app/` Expo (React Native, TypeScript) project. Routes in `app/src/app` (expo-router). Non-route code in `app/src/{api,data,domain,state,ui,notifications}`.
- `docs/` ARCHITECTURE, API, ROADMAP, HANDOFF, DESIGN. `scripts/` developer tools. `MEMORY.md` decisions and gotchas.

## Commands (run in `app/`)
```
npm install                 # .npmrc sets legacy-peer-deps (react-dom peer conflict)
npx expo install <pkg>      # ALWAYS use for new deps (SDK-compatible versions)
npx tsc --noEmit            # typecheck
npx expo lint               # lint
npx jest                    # unit tests
npx expo run:android        # dev build (needed: react-native-maps, notifications; Expo Go is not enough)
```
Run typecheck, lint and tests before declaring work done.

## Rules
1. Expo changes fast (SDK 58). Check https://docs.expo.dev/versions/v58.0.0/ or https://docs.expo.dev/llms.txt before touching Expo/RN APIs; do not trust memory.
2. Never hand-edit `android/` or `ios/` (Continuous Native Generation). Configure through `app/app.config.ts` and config plugins.
3. Never commit secrets. The TfNSW key comes from Settings (SecureStore) or `EXPO_PUBLIC_TFNSW_API_KEY` in a git-ignored `.env.local`. Google Maps key via `GOOGLE_MAPS_API_KEY` at build time.
4. All HTTP goes through `src/api/http.ts` (base URL + key come from `src/api/config.ts`) so a caching proxy can replace direct calls by configuration.
5. UI follows `docs/DESIGN.md` (Hallmark "Wayfind" theme): use tokens from `src/ui/theme.ts` and components from `src/ui/kit.tsx`/`parts.tsx`. No literal colours or font names in screens, square 2px-bordered surfaces, sentence-case untracked labels, no emoji icons, every region has loading/empty/error states, 48px hit targets.
6. Keep the Android and iOS code paths shared. Do not build or test iOS until the roadmap says so.
7. Parsing of API payloads lives in pure functions with unit tests (`app/__tests__`). Add a test with each parser change.
8. Keep changes small and surgical. Do not refactor unrelated code.

## Handoff protocol (so Copilot and Codex stay in sync)
- Start: read AGENTS.md, MEMORY.md, docs/HANDOFF.md, docs/ROADMAP.md.
- During: record non-obvious decisions and API gotchas in MEMORY.md (append-only, newest first, prefix `YYYY-MM-DD [agent]`).
- End: rewrite docs/HANDOFF.md (done, in progress, next, blockers), tick items in docs/ROADMAP.md, commit with a clear message.
