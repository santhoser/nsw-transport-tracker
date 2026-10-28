import { transit_realtime } from 'gtfs-realtime-bindings';
import { getBytes } from './http';
import { MODES, type ModeId } from '../domain/modes';
import type { Vehicle } from '../domain/types';

export function decodeVehicles(bytes: Uint8Array): Vehicle[] {
  const feed = transit_realtime.FeedMessage.decode(bytes);
  const out: Vehicle[] = [];
  for (const e of feed.entity) {
    const v = e.vehicle;
    if (!v?.position || !v.trip?.tripId) continue;
    out.push({
      tripId: v.trip.tripId,
      routeId: v.trip.routeId ?? undefined,
      latitude: v.position.latitude,
      longitude: v.position.longitude,
      timestamp: v.timestamp ? Number(v.timestamp) : undefined,
      occupancy: v.occupancyStatus ?? undefined,
    });
  }
  return out;
}

export async function fetchVehicles(mode: ModeId): Promise<Vehicle[]> {
  const results = await Promise.allSettled(MODES[mode].vehicleFeeds.map(async (f) => decodeVehicles(await getBytes(f))));
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

/** Prefer exact trip id; fall back to matching trip id as a suffix/prefix (feeds differ in id decoration). */
export function findVehicle(vehicles: Vehicle[], tripId?: string): Vehicle | undefined {
  if (!tripId) return undefined;
  return vehicles.find((v) => v.tripId === tripId) ?? vehicles.find((v) => v.tripId.includes(tripId) || tripId.includes(v.tripId));
}
