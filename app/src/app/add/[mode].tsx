import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, T } from '../../ui/kit';
import { MODES, type ModeId } from '../../domain/modes';
import type { Place, TripKind } from '../../domain/types';
import { addTrip, getTrip } from '../../data/trips';
import { usePicker } from '../../state/stores';
import { color, rule, size, space } from '../../ui/theme';

function PlaceRow({ label, place, onPress }: { label: string; place: Place | null; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ borderWidth: rule.bar, borderColor: color.ink, backgroundColor: pressed ? color.paper2 : color.paper3, padding: space.md, minHeight: 64, justifyContent: 'center' })}>
      <T tone="muted" fontSize={size.xs}>{label}</T>
      <T weight={place ? 'bold' : 'regular'} tone={place ? 'ink' : 'muted'}>{place?.name ?? 'Choose'}</T>
    </Pressable>
  );
}

export default function AddTrip() {
  const { mode: modeParam, from: editFrom } = useLocalSearchParams<{ mode: string; from?: string }>();
  const mode = modeParam as ModeId;
  const info = MODES[mode];
  const qc = useQueryClient();
  const { from, to, route, setRoute, setPlace, begin, reset } = usePicker();
  const [kind, setKind] = useState<TripKind>(mode === 'bus' ? 'route' : 'station');

  useEffect(() => {
    reset();
    if (editFrom) {
      getTrip(Number(editFrom)).then((t) => {
        if (!t) return;
        setKind(t.kind);
        setPlace('from', t.from);
        setPlace('to', t.to);
        setRoute(t.route);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editFrom]);

  if (!info) return null;
  const isBus = mode === 'bus';
  const effectiveKind: TripKind = isBus ? kind : 'station';
  const ready = !!from && !!to && from.id !== to.id && (effectiveKind !== 'route' || !!route);

  const choose = (t: 'from' | 'to') => {
    begin(t);
    router.push(`/pick?mode=${mode}`);
  };

  const save = async () => {
    if (!from || !to) return;
    const id = await addTrip({ mode, kind: effectiveKind, from, to, route: effectiveKind === 'route' ? route : null });
    await qc.invalidateQueries({ queryKey: ['trips'] });
    reset();
    router.dismissAll();
    router.push(`/trip/${id}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
      <T weight="bold" fontSize={size.xl}>{editFrom ? 'Edit as new ' : ''}{info.label} trip</T>
      {isBus ? (
        <View style={{ flexDirection: 'row' }}>
          {(['route', 'stop'] as const).map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: kind === k }} onPress={() => setKind(k)}
              style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: rule.bar, borderColor: color.ink, backgroundColor: kind === k ? color.ink : color.paper3 }}>
              <T weight="bold" fontSize={size.sm} tone={kind === k ? 'paper' : 'ink'}>{k === 'route' ? 'By route' : 'By stop'}</T>
            </Pressable>
          ))}
        </View>
      ) : null}
      {isBus && kind === 'route' ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/routes')} style={({ pressed }) => ({ borderWidth: rule.bar, borderColor: color.ink, backgroundColor: pressed ? color.paper2 : color.paper3, padding: space.md, minHeight: 64, justifyContent: 'center' })}>
          <T tone="muted" fontSize={size.xs}>Route</T>
          <T weight={route ? 'bold' : 'regular'} tone={route ? 'ink' : 'muted'}>{route ?? 'Choose a route'}</T>
        </Pressable>
      ) : null}
      <PlaceRow label={`From ${info.placeLabel}`} place={from} onPress={() => choose('from')} />
      <PlaceRow label={`To ${info.placeLabel}`} place={to} onPress={() => choose('to')} />
      <Button title="Save trip" disabled={!ready} onPress={save} />
    </ScrollView>
  );
}
