# Architecture

```
src/app        expo-router screens (index, trips, add/*, pick, routes, trip/[id], trip/detail, settings)
src/ui         theme tokens (Wayfind), kit (T, Button, Field, states), parts (TripCard, DepartureRow, LineSquare)
src/state      Zustand: add-trip draft + picker target, selected journey
src/data       expo-sqlite repo (trips)
src/domain     modes, types, formatting (Sydney time, punctuality)
src/api        config (key/base URL in SecureStore), http, tripPlanner (+parsers), realtime (GTFS-RT)
src/notifications  permission + Android channel (alerts logic later)
```

Flow: Home -> Add trip -> choose mode -> form (route for bus, From/To via picker by name or map) -> save -> Trip board (planJourneys, refetch 30 s) -> tap a row -> Journey detail (map, live vehicle matched by `RealtimeTripId`, interchange summary, stops).

Edit trip = "Edit as new" prefills the form from an existing trip and saves a new row.

Data is local only. The API client reads base URL and key from `config.ts`, so a caching proxy is a configuration change.
