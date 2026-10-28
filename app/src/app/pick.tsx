import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, Empty, ErrorState, Field, Loading, T } from '../ui/kit';
import { placesNear, searchPlaces } from '../api/tripPlanner';
import { MODES, type ModeId } from '../domain/modes';
import type { Place } from '../domain/types';
import { usePicker } from '../state/stores';
import { color, rule, size, space } from '../ui/theme';

const SYDNEY: Region = { latitude: -33.8688, longitude: 151.2093, latitudeDelta: 0.08, longitudeDelta: 0.08 };

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setV(value), ms);
    return () => clearTimeout(h);
  }, [value, ms]);
  return v;
}

export default function Pick() {
  const { mode: modeParam } = useLocalSearchParams<{ mode: string }>();
  const mode = modeParam as ModeId;
  const pick = usePicker((s) => s.pick);
  const [tab, setTab] = useState<'name' | 'map'>('name');
  const [text, setText] = useState('');
  const q = useDebounced(text.trim(), 350);
  const [region, setRegion] = useState<Region>(SYDNEY);
  const debouncedRegion = useDebounced(region, 600);
  const mapRef = useRef<MapView>(null);

  const search = useQuery({ queryKey: ['search', mode, q], queryFn: () => searchPlaces(q, mode), enabled: tab === 'name' && q.length >= 2 });
  const near = useQuery({
    queryKey: ['near', mode, debouncedRegion.latitude.toFixed(3), debouncedRegion.longitude.toFixed(3)],
    queryFn: () => placesNear(debouncedRegion.latitude, debouncedRegion.longitude, mode),
    enabled: tab === 'map' && debouncedRegion.latitudeDelta < 0.05,
  });

  const choose = (p: Place) => {
    pick(p);
    router.back();
  };

  const locate = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return;
    const pos = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  const label = MODES[mode]?.placeLabel ?? 'stop';

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        {(['name', 'map'] as const).map((k) => (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)}
            style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: rule.bar, borderColor: color.ink, backgroundColor: tab === k ? color.ink : color.paper3 }}>
            <T weight="bold" fontSize={size.sm} tone={tab === k ? 'paper' : 'ink'}>{k === 'name' ? 'By name' : 'On map'}</T>
          </Pressable>
        ))}
      </View>

      {tab === 'name' ? (
        <View style={{ flex: 1, padding: space.lg, gap: space.md }}>
          <Field value={text} onChangeText={setText} placeholder={`Search ${label} name`} autoFocus autoCorrect={false} />
          {q.length < 2 ? <Empty title={`Find a ${label}`} hint="Type at least two letters." /> : search.isLoading ? <Loading label="Searching" /> : search.error ? <ErrorState error={search.error} onRetry={search.refetch} /> : (
            <FlatList
              data={search.data}
              keyExtractor={(p) => p.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Empty title="No matches" hint={`No ${MODES[mode]?.label ?? ''} ${label}s match that name.`} />}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="button" onPress={() => choose(item)} style={({ pressed }) => ({ padding: space.md, minHeight: 48, borderBottomWidth: rule.hair, borderBottomColor: color.rule, backgroundColor: pressed ? color.paper2 : 'transparent' })}>
                  <T>{item.name}</T>
                </Pressable>
              )}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={SYDNEY} onRegionChangeComplete={setRegion} showsUserLocation>
            {(near.data ?? []).filter((p) => p.lat !== undefined && p.lon !== undefined).map((p) => (
              <Marker key={p.id} coordinate={{ latitude: p.lat!, longitude: p.lon! }} title={p.name} pinColor={MODES[mode]?.color} onCalloutPress={() => choose(p)} />
            ))}
          </MapView>
          <View style={{ position: 'absolute', left: space.md, right: space.md, bottom: space.md, gap: space.sm }}>
            <View style={{ backgroundColor: color.ink, padding: space.md }}>
              <T tone="paper" fontSize={size.sm}>
                {debouncedRegion.latitudeDelta >= 0.05 ? 'Zoom in to see stops.' : near.isFetching ? 'Finding stops' : `${near.data?.length ?? 0} found. Tap a pin, then its label to select.`}
              </T>
            </View>
            <Button title="Use my location" variant="outline" onPress={locate} style={{ backgroundColor: color.paper3 }} />
          </View>
        </View>
      )}
    </View>
  );
}
