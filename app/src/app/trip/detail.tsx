import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSelected } from '../../state/stores';
import { fetchVehicles, findVehicle } from '../../api/realtime';
import { MODES } from '../../domain/modes';
import { formatTime, minutesUntil, punctuality } from '../../domain/format';
import type { Leg } from '../../domain/types';
import { Empty, T } from '../../ui/kit';
import { LineSquare, ModeIcon } from '../../ui/parts';
import { color, rule, size, space } from '../../ui/theme';

const LIVE_MS = 15_000;
const PUNCT = { ontime: color.onTime, early: color.early, late: color.late, none: color.muted } as const;

function LegBlock({ leg }: { leg: Leg }) {
  const p = punctuality(leg.depPlanned, leg.depEstimated);
  return (
    <View style={{ borderLeftWidth: 8, borderLeftColor: leg.mode ? MODES[leg.mode].color : color.muted, backgroundColor: color.paper3 }}>
      <View style={{ padding: space.md, gap: space.xs, borderBottomWidth: rule.hair, borderBottomColor: color.rule }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <LineSquare line={leg.line} mode={leg.mode} />
          <T weight="bold" style={{ flex: 1 }} numberOfLines={2}>{leg.towards ? `Towards ${leg.towards}` : leg.description}</T>
        </View>
        <T fontSize={size.sm} tone="muted">{leg.originName}{leg.originPlatform ? `, ${leg.originPlatform}` : ''}</T>
        <T fontSize={size.sm} style={{ color: PUNCT[p.kind] }}>{p.label}</T>
      </View>
      {leg.stops.map((s, i) => {
        const edge = i === 0 || i === leg.stops.length - 1;
        return (
          <View key={`${s.name}-${i}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md, padding: space.md, borderBottomWidth: rule.hair, borderBottomColor: color.rule }}>
            <T weight={edge ? 'bold' : 'regular'} style={{ flex: 1 }}>{s.name}</T>
            <T weight={edge ? 'bold' : 'regular'}>{formatTime(s.arrival ?? s.departure)}</T>
          </View>
        );
      })}
    </View>
  );
}

export default function JourneyDetail() {
  const { journey, trip } = useSelected();
  const trackLeg = useMemo(() => journey?.legs.find((l) => !l.isWalk && l.mode && MODES[l.mode].vehicleFeeds.length), [journey]);
  const live = useQuery({
    queryKey: ['vehicles', trackLeg?.mode],
    enabled: !!trackLeg?.mode,
    refetchInterval: LIVE_MS,
    queryFn: () => fetchVehicles(trackLeg!.mode!),
  });
  const vehicle = useMemo(() => findVehicle(live.data ?? [], trackLeg?.realtimeTripId), [live.data, trackLeg]);

  if (!journey || !trip) return <Empty title="Nothing selected" hint="Open a service from a trip." />;

  const coords = journey.legs.flatMap((l) => l.path);
  const first = coords[0];
  const legs = journey.legs;
  const transit = legs.filter((l) => !l.isWalk);

  return (
    <ScrollView>
      {first ? (
        <MapView
          style={{ height: 240 }}
          initialRegion={{ latitude: vehicle?.latitude ?? first.latitude, longitude: vehicle?.longitude ?? first.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
          region={vehicle ? { latitude: vehicle.latitude, longitude: vehicle.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 } : undefined}
        >
          {legs.map((l, i) => l.path.length > 1 ? <Polyline key={i} coordinates={l.path} strokeWidth={4} strokeColor={l.isWalk ? color.muted : l.mode ? MODES[l.mode].color : color.ink} lineDashPattern={l.isWalk ? [6, 6] : undefined} /> : null)}
          {vehicle ? <Marker coordinate={vehicle} title={trackLeg?.line} /> : null}
        </MapView>
      ) : null}

      {trackLeg ? (
        <View style={{ padding: space.md, backgroundColor: color.paper2, gap: 2 }}>
          <T weight="bold">{vehicle ? `${MODES[trackLeg.mode!].label} is live on the map` : 'Live location not available'}</T>
          <T tone="muted" fontSize={size.sm}>
            {vehicle?.timestamp ? `Location updated at ${formatTime(new Date(vehicle.timestamp * 1000).toISOString())}` : live.isError ? 'Could not reach the realtime feed' : 'Checking every 15 seconds'}
          </T>
        </View>
      ) : null}

      {transit.length > 1 ? (
        <View style={{ padding: space.md, gap: space.xs, backgroundColor: color.ink }}>
          <T weight="bold" tone="amber">{transit.length - 1} change{transit.length > 2 ? 's' : ''}</T>
          {transit.slice(0, -1).map((l, i) => {
            const next = transit[i + 1];
            const wait = minutesUntil(next.depEstimated ?? next.depPlanned, new Date(l.arrEstimated ?? l.arrPlanned).getTime());
            return (
              <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                {next.mode ? <ModeIcon mode={next.mode} size={18} tint={color.paper} /> : null}
                <T tone="paper" fontSize={size.sm} style={{ flex: 1 }}>
                  Change at {l.destName}{l.destPlatform ? `, ${l.destPlatform}` : ''} for {next.line}{next.originPlatform ? ` from ${next.originPlatform}` : ''}{wait !== null ? `, ${wait} min wait` : ''}
                </T>
              </View>
            );
          })}
        </View>
      ) : null}

      {legs.map((l, i) =>
        l.isWalk ? (
          <View key={i} style={{ padding: space.md, backgroundColor: color.paper2 }}>
            <T tone="muted" fontSize={size.sm}>Walk {Math.max(1, Math.round(l.durationSec / 60))} min to {l.destName}</T>
          </View>
        ) : <LegBlock key={i} leg={l} />,
      )}
    </ScrollView>
  );
}
