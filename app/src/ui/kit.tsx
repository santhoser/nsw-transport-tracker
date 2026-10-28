import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type PressableProps, type TextInputProps, type TextProps, type ViewStyle } from 'react-native';
import { color, font, hit, rule, size, space } from './theme';

export function T({ weight = 'regular', fontSize = size.md, tone = 'ink', style, ...rest }: TextProps & { weight?: keyof typeof font; fontSize?: number; tone?: 'ink' | 'muted' | 'paper' | 'amber' }) {
  const c = { ink: color.ink, muted: color.muted, paper: color.paper, amber: color.amber }[tone];
  return <Text {...rest} style={[{ fontFamily: font[weight], fontSize, color: c }, style]} />;
}

export function Button({ title, onPress, variant = 'primary', disabled, style }: { title: string; onPress: () => void; variant?: 'primary' | 'outline'; disabled?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, focused }: PressableProps & { focused?: boolean } & { pressed: boolean }) => [
        s.btn,
        variant === 'primary' ? s.btnPrimary : s.btnOutline,
        pressed && { backgroundColor: variant === 'primary' ? color.ink : color.paper2 },
        focused && s.focus,
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {({ pressed }) => (
        <T weight="bold" fontSize={size.sm} style={{ color: variant === 'primary' || pressed ? (pressed && variant === 'outline' ? color.ink : color.accentInk) : color.ink }}>
          {title}
        </T>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={color.muted} {...props} style={[s.input, props.style]} />;
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={s.state} accessibilityLiveRegion="polite">
      <ActivityIndicator color={color.accent} />
      <T tone="muted" fontSize={size.sm}>{label}</T>
    </View>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: { title: string; onPress: () => void } }) {
  return (
    <View style={s.state}>
      <T weight="bold" fontSize={size.lg}>{title}</T>
      {hint ? <T tone="muted" fontSize={size.sm} style={{ textAlign: 'center' }}>{hint}</T> : null}
      {action ? <Button title={action.title} onPress={action.onPress} /> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <View style={s.state} accessibilityLiveRegion="assertive">
      <T weight="bold" fontSize={size.lg}>Could not load</T>
      <T tone="muted" fontSize={size.sm} style={{ textAlign: 'center' }}>{msg}</T>
      {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export const s = StyleSheet.create({
  btn: { minHeight: hit, paddingHorizontal: space.lg, alignItems: 'center', justifyContent: 'center', borderWidth: rule.bar },
  btnPrimary: { backgroundColor: color.accent, borderColor: color.accent },
  btnOutline: { backgroundColor: 'transparent', borderColor: color.ink },
  focus: { borderColor: color.amber },
  input: { minHeight: hit, borderWidth: rule.bar, borderColor: color.ink, backgroundColor: color.paper3, paddingHorizontal: space.md, fontFamily: font.regular, fontSize: size.md, color: color.ink },
  state: { padding: space.xl, gap: space.md, alignItems: 'center', justifyContent: 'center' },
});
