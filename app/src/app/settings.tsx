import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Field, T } from '../ui/kit';
import { DEFAULT_BASE_URL, getApiKey, getBaseUrl, saveApiConfig } from '../api/config';
import { enableNotifications } from '../notifications/setup';
import { size, space } from '../ui/theme';

export default function Settings() {
  const [key, setKey] = useState(getApiKey() ?? '');
  const [base, setBase] = useState(getBaseUrl());
  const [msg, setMsg] = useState('');

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }} keyboardShouldPersistTaps="handled">
      <T weight="bold" fontSize={size.lg}>TfNSW API key</T>
      <T tone="muted" fontSize={size.sm}>Free key from opendata.transport.nsw.gov.au. It is stored on this device only.</T>
      <Field value={key} onChangeText={setKey} placeholder="API key" autoCapitalize="none" autoCorrect={false} secureTextEntry />
      <T weight="bold" fontSize={size.lg}>API base URL</T>
      <T tone="muted" fontSize={size.sm}>Leave as default unless you run a caching proxy.</T>
      <Field value={base} onChangeText={setBase} placeholder={DEFAULT_BASE_URL} autoCapitalize="none" autoCorrect={false} />
      <Button title="Save" onPress={async () => { await saveApiConfig(key, base); setMsg('Saved.'); }} />
      <T weight="bold" fontSize={size.lg}>Notifications</T>
      <T tone="muted" fontSize={size.sm}>Allow notifications so service alerts can reach you when alerts launch.</T>
      <Button variant="outline" title="Enable notifications" onPress={async () => setMsg((await enableNotifications()) ? 'Notifications enabled.' : 'Notifications not allowed.')} />
      {msg ? <T accessibilityLiveRegion="polite" fontSize={size.sm}>{msg}</T> : null}
    </ScrollView>
  );
}
