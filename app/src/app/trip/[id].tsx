import React, { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteTrip, getTrip } from '../../data/trips';
import { planJourneys } from '../../api/tripPlanner';
import { DepartureRow } from '../../ui/parts';
import { Empty, ErrorState, Loading, T } from '../../ui/kit';
import { useSelected } from '../../state/stores';
import { formatTime } from '../../domain/format';
import { color, rule, size, space } from '../../ui/theme';

const REFRESH_MS = 30_000;

function HeaderButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name={icon as never} size={24} color={color.paper} />
    </Pressable>
  );
}

export default function TripBoard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const select = useSelected((s) => s.select);
  const [reversed, setReversed] = useState(false);
  const trip = useQuery({ queryKey: ['trip', id], queryFn: () => getTrip(Number(id)) });
  const t = trip.data;
  const fromPlace = t ? (reversed ? t.to : t.from) : null;
  const toPlace = t ? (reversed ? t.from : t.to) : null;

  const board = useQuery({
    queryKey: ['board', id, reversed],
    enabled: !!t,
    refetchInterval: REFRESH_MS,
    queryFn: () => planJourneys({ fromId: fromPlace!.id, toId: toPlace!.id, mode: t!.mode, route: t!.route }),
  });

  const confirmDelete = () =>
    Alert.alert('Delete trip?', 'This removes it from your saved trips.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTrip(Number(id)); await qc.invalidateQueries({ queryKey: ['trips'] }); router.back(); } },
    ]);

  const now = board.dataUpdatedAt;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: fromPlace ? `${fromPlace.name}\n${toPlace?.name}` : 'Trip',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <HeaderButton icon="swap-vertical" label="Reverse direction" onPress={() => setReversed((r) => !r)} />
              <HeaderButton icon="content-copy" label="Edit as new trip" onPress={() => t && router.push(`/add/${t.mode}?from=${t.id}`)} />
              <HeaderButton icon="trash-can-outline" label="Delete trip" onPress={confirmDelete} />
            </View>
          ),
        }}
      />
      {trip.isLoading || board.isLoading ? <Loading label="Finding next services" /> : board.error ? <ErrorState error={board.error} onRetry={board.refetch} /> : !board.data?.length ? (
        <Empty title="No upcoming services" hint={t?.route ? `No route ${t.route} services found between these places.` : 'Nothing found for this trip right now.'} />
      ) : (
        <FlatList
          data={board.data}
          keyExtractor={(_, i) => String(i)}
          refreshControl={<RefreshControl refreshing={board.isRefetching} onRefresh={async () => { await board.refetch(); }} />}
          renderItem={({ item }) => (
            <DepartureRow journey={item} now={now} onPress={() => { select(item, t!); router.push('/trip/detail'); }} />
          )}
        />
      )}
      <View style={{ padding: space.md, backgroundColor: color.ink, borderTopWidth: rule.bar, borderTopColor: color.ink }}>
        <T tone="paper" fontSize={size.sm}>
          {board.dataUpdatedAt ? `Real-time data updated at ${formatTime(new Date(board.dataUpdatedAt).toISOString())}` : 'Waiting for data'}
        </T>
      </View>
    </View>
  );
}
