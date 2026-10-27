import React from 'react';
import { FlatList, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listTrips } from '../data/trips';
import { Button, Empty, ErrorState, Loading, T } from '../ui/kit';
import { TripCard } from '../ui/parts';
import { color, space } from '../ui/theme';
import { getApiKey } from '../api/config';

const HOME_LIMIT = 5;

export default function Home() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['trips'], queryFn: () => listTrips() });
  const trips = data ?? [];
  const shown = trips.slice(0, HOME_LIMIT);

  return (
    <View style={{ flex: 1 }}>
      {!getApiKey() ? (
        <Link href="/settings" style={{ backgroundColor: color.amber, padding: space.md }}>
          <T weight="bold">Add your TfNSW API key in Settings to load live data.</T>
        </Link>
      ) : undefined}
      {isLoading ? <Loading /> : error ? <ErrorState error={error} onRetry={refetch} /> : trips.length === 0 ? (
        <Empty title="No trips yet" hint="Save a trip to see its next departures here." action={{ title: 'Add a trip', onPress: () => router.push('/add') }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ padding: space.lg, gap: space.md }}
          ListHeaderComponent={<T weight="bold" fontSize={18}>Saved trips</T>}
          renderItem={({ item }) => <TripCard trip={item} onPress={() => router.push(`/trip/${item.id}`)} />}
          ListFooterComponent={trips.length > HOME_LIMIT ? <Button variant="outline" title={`Show all ${trips.length} trips`} onPress={() => router.push('/trips')} /> : undefined}
        />
      )}
      <View style={{ flexDirection: 'row', gap: space.md, padding: space.lg, borderTopWidth: 2, borderTopColor: color.ink, backgroundColor: color.paper3 }}>
        <Button title="Add trip" onPress={() => router.push('/add')} style={{ flex: 1 }} />
        <Button title="Settings" variant="outline" onPress={() => router.push('/settings')} />
      </View>
    </View>
  );
}

export const unstable_settings = { initialRouteName: 'index' };
