import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from './kit';
import { color, rule, size, space } from './theme';
import { lineColor, MODES, type ModeId } from '../domain/modes';
import { formatTime, minsLabel, minutesUntil, punctuality } from '../domain/format';
import type { Journey, SavedTrip } from '../domain/types';

export function ModeIcon({ mode, size: sz = 24, tint = color.ink }: { mode: ModeId; size?: number; tint?: string }) {
  return <MaterialCommunityIcons name={MODES[mode].icon as never} size={sz} color={tint} />;
}

export function LineSquare({ line, mode }: { line: string; mode: ModeId | null }) {
  return (
    <View style={[s.square, { backgroundColor: lineColor(line, mode) }]}>
      <T weight="bold" fontSize={size.xs} tone="paper">{line.slice(0, 4)}</T>
    </View>
  );
}

export function TripCard({ trip, onPress }: { trip: SavedTrip; onPress: () => void }) {
  const m = MODES[trip.mode];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.card, pressed && { backgroundColor: color.paper2 }]}>
      <View style={[s.cardBar, { backgroundColor: m.color }]}>
        <ModeIcon mode={trip.mode} tint={color.paper} />
      </View>
      <View style={{ flex: 1, padding: space.md, gap: 2 }}>
        <T weight="bold" numberOfLines={1}>{trip.from.name}</T>
        <T tone="muted" fontSize={size.sm} numberOfLines={1}>to {trip.to.name}</T>
        {trip.route ? <T tone="muted" fontSize={size.xs}>Route {trip.route}</T> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={color.ink} style={{ alignSelf: 'center', marginRight: space.sm }} />
    </Pressable>
  );
}

const PUNCT = { ontime: color.onTime, early: color.early, late: color.late, none: color.muted } as const;

/** One departure row, mirroring Trip View: minutes plate, from/to times, status, lines. */
export function DepartureRow({ journey, now, onPress }: { journey: Journey; now: number; onPress: () => void }) {
  const legs = journey.legs.filter((l) => !l.isWalk);
  const first = legs[0] ?? journey.legs[0];
  const last = legs[legs.length - 1] ?? first;
  if (!first) return null;
  const dep = first.depEstimated ?? first.depPlanned;
  const arr = last.arrEstimated ?? last.arrPlanned;
  const { value, unit } = minsLabel(minutesUntil(dep, now));
  const p = punctuality(first.depPlanned, first.depEstimated);
  const barColor = lineColor(first.line, first.mode);
  const lines = legs.map((l) => l.line).join(',');
  const changes = legs.length - 1;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.row, pressed && { backgroundColor: color.paper2 }]}>
      <View style={[s.mins, { backgroundColor: barColor }]}>
        <T weight="bold" fontSize={size.xl} tone="paper">{value}</T>
        {unit ? <T fontSize={size.xs} tone="paper">{unit}</T> : null}
      </View>
      <View style={s.rowBody}>
        <View style={s.rowTop}>
          <T tone="muted" fontSize={size.sm} numberOfLines={1} style={{ flex: 1 }}>{first.originName}{first.originPlatform ? ` ${first.originPlatform}` : ''}</T>
          <T tone="muted" fontSize={size.sm} numberOfLines={1}>{last.destName}</T>
        </View>
        <View style={s.rowTop}>
          <T weight="bold" fontSize={size.xl}>{formatTime(dep)}</T>
          <T weight="bold" fontSize={size.xl}>{formatTime(arr)}</T>
        </View>
        <View style={s.rowTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 }}>
            <View style={[s.dot, { backgroundColor: PUNCT[p.kind] }]} />
            <T tone={p.kind === 'none' ? 'muted' : 'ink'} fontSize={size.sm} numberOfLines={1} style={{ flex: 1 }}>{p.label}</T>
          </View>
          <T tone="muted" fontSize={size.sm}>{lines}{changes > 0 ? ` (${changes} change${changes > 1 ? 's' : ''})` : ''}</T>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  square: { minWidth: 28, height: 24, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', borderWidth: rule.bar, borderColor: color.ink, backgroundColor: color.paper3 },
  cardBar: { width: 56, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: rule.hair, borderBottomColor: color.rule, backgroundColor: color.paper3 },
  mins: { width: 84, alignItems: 'center', justifyContent: 'center', paddingVertical: space.md },
  rowBody: { flex: 1, padding: space.md, gap: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  dot: { width: 12, height: 12 },
});
