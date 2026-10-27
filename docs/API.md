# TfNSW API reference

## Access
All APIs need a free key. Steps:
1. Create an account at https://opendata.transport.nsw.gov.au and sign in.
2. Open "My applications", create an application.
3. Add the APIs below to the application; copy the API key.
4. Requests send header `Authorization: apikey <KEY>`.
5. In the app: Settings -> API key. For dev builds you may set `EXPO_PUBLIC_TFNSW_API_KEY` in `app/.env.local` (git-ignored).

Limits (verify on the portal): about 5 requests/second and 60,000/day per key. Per-device keys are not possible (keys are per portal account). See MEMORY.md for the public-release plan (caching proxy).

## APIs to subscribe to
| API | Base path (host `https://api.transport.nsw.gov.au`) | Used for |
| --- | --- | --- |
| Trip Planner | `/v1/tp/stop_finder`, `/v1/tp/trip`, `/v1/tp/departure_mon`, `/v1/tp/add_info` | place search, journeys, alerts |
| Realtime vehicle positions (GTFS-RT, protobuf) | `/v1/gtfs/vehiclepos/buses`, `/v2/gtfs/vehiclepos/sydneytrains`, `/v2/gtfs/vehiclepos/metro`, `/v1/gtfs/vehiclepos/ferries/sydneyferries`, light rail per line | live location |
| Realtime trip updates / alerts (GTFS-RT) | `/v1/gtfs/realtime/...`, `/v2/gtfs/alerts/...` | later: delays, notifications |
| Static timetables (GTFS zip) | `/v1/publictransport/timetables/complete/gtfs` | bus route list (script only) |

Paths marked here come from documentation memory; confirm them in the portal's API explorer and update `src/domain/modes.ts` if they differ.

## Trip Planner (rapidJSON)
Common params: `outputFormat=rapidJSON&coordOutputFormat=EPSG:4326&version=10.2.1.42`.
- Search by name: `stop_finder?type_sf=any&name_sf=<text>&TfNSWSF=true`
- Search by coordinate: `stop_finder?type_sf=coord&name_sf=<lon>:<lat>:EPSG:4326&TfNSWSF=true`
- Plan: `trip?depArrMacro=dep&type_origin=any&name_origin=<id>&type_destination=any&name_destination=<id>&calcNumberOfTrips=8&TfNSWTR=true&itdDate=YYYYMMDD&itdTime=HHMM&excludedMeans=checkbox&exclMOT_<class>=1`
- Product classes: 1 train, 2 metro, 4 light rail, 5 bus, 7 coach, 9 ferry, 11 school bus, 99/100 walk.

Parsers: `app/src/api/tripPlanner.ts`. Realtime: `app/src/api/realtime.ts`.
