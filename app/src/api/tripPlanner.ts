import { getJson } from './http';
import { ALL_CLASSES, MODES, modeFromClass, type ModeId } from '../domain/modes';
import type { Journey, Leg, Place, StopPoint } from '../domain/types';

const TP = 'v1/tp';
const COMMON = 'outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&version=10.2.1.42';


export function parseLocations(raw: any, mode?: ModeId): Place[] {
  const out: Place[] = [];
  for (const l of raw?.locations ?? []) {
    if (!l?.id || !['stop', 'platform', 'station', 'poi'].includes(l.type ?? 'stop')) continue;
    if (l.type === 'poi') continue;
    if (mode) {
      const classes: number[] = l.modes ?? [];
      if (classes.length && !classes.some((c) => MODES[mode].classes.includes(c))) continue;
    }
    out.push({ id: String(l.id), name: l.disassembledName && l.parent?.name ? `${l.disassembledName}, ${l.parent.name}` : String(l.name), lat: l.coord?.[0], lon: l.coord?.[1] });
  }
  return out;
}

export async function searchPlaces(query: string, mode?: ModeId): Promise<Place[]> {
  const q = encodeURIComponent(query.trim());
  const raw = await getJson(`${TP}/stop_finder?${COMMON}&type_sf=any&name_sf=${q}&TfNSWSF=true`);
  return parseLocations(raw, mode);
}

export async function placesNear(lat: number, lon: number, mode?: ModeId): Promise<Place[]> {
  const raw = await getJson(`${TP}/stop_finder?${COMMON}&type_sf=coord&name_sf=${lon}%3A${lat}%3AEPSG%3A4326&TfNSWSF=true`);
  return parseLocations(raw, mode);
}

const platformOf = (name?: string): string | undefined => {
  const m = /(Platform\s*\w+|Stand\s*\w+|Wharf\s*\w+)/i.exec(name ?? '');
  return m?.[1];
};

const toPoint = (s: any): StopPoint => ({
  name: s?.disassembledName ?? s?.name ?? '',
  arrival: s?.arrivalTimeEstimated ?? s?.arrivalTimePlanned,
  departure: s?.departureTimeEstimated ?? s?.departureTimePlanned,
  lat: s?.coord?.[0],
  lon: s?.coord?.[1],
});

export function parseLeg(l: any): Leg {
  const t = l.transportation ?? {};
  const cls: number | undefined = t.product?.class;
  const isWalk = cls === 99 || cls === 100 || !t.product || cls === undefined;
  const mode = modeFromClass(cls);
  const props = { ...(l.properties ?? {}), ...(t.properties ?? {}) };
  return {
    isWalk,
    mode,
    line: isWalk ? 'Walk' : (t.disassembledName ?? t.number ?? t.name ?? ''),
    description: t.description ?? t.name ?? '',
    towards: t.destination?.name ?? '',
    originName: l.origin?.parent?.name ?? l.origin?.name ?? '',
    originPlatform: platformOf(l.origin?.name),
    destName: l.destination?.parent?.name ?? l.destination?.name ?? '',
    destPlatform: platformOf(l.destination?.name),
    depPlanned: l.origin?.departureTimePlanned,
    depEstimated: l.origin?.departureTimeEstimated,
    arrPlanned: l.destination?.arrivalTimePlanned,
    arrEstimated: l.destination?.arrivalTimeEstimated,
    durationSec: l.duration ?? 0,
    stops: (l.stopSequence ?? []).map(toPoint),
    path: (l.coords ?? []).map((c: number[]) => ({ latitude: c[0], longitude: c[1] })),
    realtimeTripId: props.RealtimeTripId ?? props.AVMSTripID,
  };
}

export function parseJourneys(raw: any): Journey[] {
  return (raw?.journeys ?? []).map((j: any) => ({ legs: (j.legs ?? []).map(parseLeg) }));
}

export interface PlanOptions {
  fromId: string;
  toId: string;
  mode: ModeId;
  /** keep only journeys that use this line/route number */
  route?: string | null;
  count?: number;
  when?: Date;
}

const pad = (n: number) => String(n).padStart(2, '0');

export async function planJourneys(o: PlanOptions): Promise<Journey[]> {
  const excl = ALL_CLASSES.filter((c) => !MODES[o.mode].classes.includes(c))
    .map((c) => `&exclMOT_${c}=1`)
    .join('');
  const d = o.when ?? new Date();
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}${pad(d.getMinutes())}`;
  const raw = await getJson(
    `${TP}/trip?${COMMON}&depArrMacro=dep&type_origin=any&name_origin=${encodeURIComponent(o.fromId)}` +
      `&type_destination=any&name_destination=${encodeURIComponent(o.toId)}&calcNumberOfTrips=${o.count ?? 8}` +
      `&TfNSWTR=true&itdDate=${date}&itdTime=${time}&excludedMeans=checkbox${excl}`,
  );
  const journeys = parseJourneys(raw);
  const route = o.route?.trim().toUpperCase();
  return route ? journeys.filter((j) => j.legs.some((l) => l.line.toUpperCase() === route)) : journeys;
}

export async function fetchAlertCount(): Promise<number> {
  const raw = await getJson<any>(`${TP}/add_info?outputFormat=rapidJSON&filterPublicationStatus=current&filterMOTType=1`);
  return raw?.infos?.current?.length ?? 0;
}
