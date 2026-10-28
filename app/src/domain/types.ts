import type { ModeId } from './modes';

export interface Place {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
}

export type TripKind = 'station' | 'stop' | 'route';

export interface SavedTrip {
  id: number;
  mode: ModeId;
  kind: TripKind;
  from: Place;
  to: Place;
  /** bus route number (kind === 'route') */
  route: string | null;
  createdAt: number;
}

export type NewTrip = Omit<SavedTrip, 'id' | 'createdAt'>;

export interface StopPoint {
  name: string;
  arrival?: string;
  departure?: string;
  lat?: number;
  lon?: number;
}

export interface Leg {
  isWalk: boolean;
  mode: ModeId | null;
  line: string;
  description: string;
  towards: string;
  originName: string;
  originPlatform?: string;
  destName: string;
  destPlatform?: string;
  depPlanned: string;
  depEstimated?: string;
  arrPlanned: string;
  arrEstimated?: string;
  durationSec: number;
  stops: StopPoint[];
  path: { latitude: number; longitude: number }[];
  realtimeTripId?: string;
  occupancy?: string;
}

export interface Journey {
  legs: Leg[];
}

export interface Vehicle {
  tripId: string;
  routeId?: string;
  latitude: number;
  longitude: number;
  timestamp?: number;
  occupancy?: number;
}
