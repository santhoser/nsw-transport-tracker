import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Field, T } from '../ui/kit';
import { usePicker } from '../state/stores';
import { color, rule, size, space } from '../ui/theme';
import routesData from '../../assets/data/bus-routes.json';

interface BusRoute { number: string; name: string }

export default function Routes() {
  const [q, setQ] = useState('');
  const setRoute = usePicker((s) => s.setRoute);
  const term = q.trim().toUpperCase();
  const list = useMemo(() => (routesData as BusRoute[]).filter((r) => !term || r.number.toUpperCase().includes(term) || r.name.toUpperCase().includes(term)), [term]);

  const choose = (n: string) => {
    setRoute(n);
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: space.lg, gap: space.md }}>
      <Field value={q} onChangeText={setQ} placeholder="Route number or name" autoCapitalize="characters" autoCorrect={false} />
      <FlatList
        data={list}
        keyExtractor={(r) => r.number}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={term ? (
          <Pressable accessibilityRole="button" onPress={() => choose(term)} style={{ padding: space.md, minHeight: 48, justifyContent: 'center' }}>
            <T tone="muted" fontSize={size.sm}>Route not listed? Use &quot;{term}&quot;</T>
          </Pressable>
        ) : undefined}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => choose(item.number)} style={({ pressed }) => ({ flexDirection: 'row', gap: space.md, alignItems: 'center', minHeight: 56, borderBottomWidth: rule.hair, borderBottomColor: color.rule, backgroundColor: pressed ? color.paper2 : 'transparent' })}>
            <View style={{ minWidth: 64, padding: space.sm, backgroundColor: color.accent, alignItems: 'center' }}>
              <T weight="bold" tone="paper">{item.number}</T>
            </View>
            <T style={{ flex: 1 }} fontSize={size.sm}>{item.name}</T>
          </Pressable>
        )}
      />
    </View>
  );
}
