import React from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { T } from '../../ui/kit';
import { ModeIcon } from '../../ui/parts';
import { MODES, MODE_ORDER } from '../../domain/modes';
import { color, rule, space, size } from '../../ui/theme';

export default function ChooseMode() {
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
      <T weight="bold" fontSize={size.xl}>How are you travelling?</T>
      {MODE_ORDER.map((id) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          onPress={() => router.push(`/add/${id}`)}
          style={({ pressed }) => ({ flexDirection: 'row', borderWidth: rule.bar, borderColor: color.ink, backgroundColor: pressed ? color.paper2 : color.paper3 })}
        >
          <View style={{ width: 64, minHeight: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: MODES[id].color }}>
            <ModeIcon mode={id} size={30} tint={color.paper} />
          </View>
          <View style={{ padding: space.md, justifyContent: 'center' }}>
            <T weight="bold" fontSize={size.lg}>{MODES[id].label}</T>
            <T tone="muted" fontSize={size.sm}>{id === 'bus' ? 'By route or by stop' : `By ${MODES[id].placeLabel}`}</T>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
