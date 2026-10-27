export type ModeId = 'train' | 'metro' | 'lightrail' | 'bus' | 'ferry';

export interface ModeInfo {
  id: ModeId;
  label: string;
  /** TfNSW product classes belonging to this mode */
  classes: number[];
  color: string;
  icon: string; // Ionicons / MaterialCommunityIcons name
  placeLabel: 'station' | 'stop' | 'wharf';
  /** GTFS-RT vehicle position feed path (null when unsupported) */
  vehicleFeed: string | null;
}

export const MODES: Record<ModeId, ModeInfo> = {
  train: { id: 'train', label: 'Train', classes: [1], color: '#f99d1c', icon: 'train', placeLabel: 'station', vehicleFeed: 'v2/gtfs/vehiclepos/sydneytrains' },
  metro: { id: 'metro', label: 'Metro', classes: [2], color: '#168388', icon: 'subway-variant', placeLabel: 'station', vehicleFeed: 'v2/gtfs/vehiclepos/metro' },
  lightrail: { id: 'lightrail', label: 'Light Rail', classes: [4], color: '#be1622', icon: 'tram', placeLabel: 'station', vehicleFeed: null },
  bus: { id: 'bus', label: 'Bus', classes: [5, 7, 11], color: '#00b5ef', icon: 'bus', placeLabel: 'stop', vehicleFeed: 'v1/gtfs/vehiclepos/buses' },
  ferry: { id: 'ferry', label: 'Ferry', classes: [9], color: '#5ab031', icon: 'ferry', placeLabel: 'wharf', vehicleFeed: 'v1/gtfs/vehiclepos/ferries/sydneyferries' },
};

export const MODE_ORDER: ModeId[] = ['train', 'metro', 'lightrail', 'bus', 'ferry'];

export const ALL_CLASSES = [1, 2, 4, 5, 7, 9, 11];

export function modeFromClass(cls: number | undefined): ModeId | null {
  for (const m of MODE_ORDER) if (MODES[m].classes.includes(cls ?? -1)) return m;
  return null;
}

const LINE_COLORS: Record<string, string> = {
  T1: '#f99d1c', T2: '#0098cd', T3: '#f37021', T4: '#005aa3', T5: '#c4258f',
  T6: '#7c3e21', T7: '#6f818e', T8: '#00954c', T9: '#d11f2f',
  M1: '#168388', L1: '#be1622', L2: '#dd1e25', L3: '#781140', L4: '#bb2d6f',
};

export function lineColor(line: string, mode: ModeId | null): string {
  const key = line.toUpperCase();
  return LINE_COLORS[key] ?? (mode ? MODES[mode].color : '#6f818e');
}
