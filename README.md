# Wayline NSW

Standalone Android-first (iOS later) NSW public transport tracker: saved trips, next departures, live vehicle location, connections. No backend; data stays on the device.

Start here: [AGENTS.md](AGENTS.md) -> [MEMORY.md](MEMORY.md) -> [docs/HANDOFF.md](docs/HANDOFF.md).

```
cd app
npm install
cp .env.example .env.local   # add your TfNSW key (see docs/API.md)
npx expo run:android
```
