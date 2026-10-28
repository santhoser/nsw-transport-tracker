const TZ = 'Australia/Sydney';

export function formatTime(iso?: string): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ }).replace(/\s?([ap])m/i, (_, c) => ` ${c.toLowerCase()}m`);
}

export function minutesUntil(iso: string | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - now) / 60000);
}

export type Punctuality = { kind: 'ontime' | 'early' | 'late' | 'none'; label: string; delta: number };

export function punctuality(planned?: string, estimated?: string): Punctuality {
  if (!planned || !estimated) return { kind: 'none', label: 'Real-time data unavailable', delta: 0 };
  const delta = Math.round((new Date(estimated).getTime() - new Date(planned).getTime()) / 60000);
  if (delta === 0) return { kind: 'ontime', label: 'On time', delta };
  const est = formatTime(estimated).replace(/\s?[ap]m$/i, '');
  const n = Math.abs(delta);
  return delta < 0
    ? { kind: 'early', label: `${est} running ${n} min early`, delta }
    : { kind: 'late', label: `${est} running ${n} min late`, delta };
}

export function minsLabel(m: number | null): { value: string; unit: string } {
  if (m === null) return { value: '--', unit: '' };
  if (m <= 0) return { value: 'Now', unit: '' };
  return { value: String(m), unit: 'mins' };
}
