import React from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listTrips } from '../data/trips';
import { Empty, ErrorState, Loading } from '../ui/kit';
import { TripCard } from '../ui/parts';
import { space } from '../ui/theme';

export default function AllTrips() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['trips'], queryFn: () => listTrips() });
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.length) return <Empty title="No trips yet" />;
  return (
    <FlatList
      data={data}
      keyExtractor={(t) => String(t.id)}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      renderItem={({ item }) => <TripCard trip={item} onPress={() => router.push(`/trip/${item.id}`)} />}
    />
  );
}
