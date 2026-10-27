import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, ChivoMono_400Regular, ChivoMono_500Medium, ChivoMono_800ExtraBold } from '@expo-google-fonts/chivo-mono';
import { loadApiConfig } from '../api/config';
import '../notifications/setup';
import { getDb } from '../data/trips';
import { color, font, size } from '../ui/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10_000 } } });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ChivoMono_400Regular, ChivoMono_500Medium, ChivoMono_800ExtraBold });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadApiConfig(), getDb()]).finally(() => setReady(true));
  }, []);

  if (!fontsLoaded || !ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: color.ink },
          headerTintColor: color.paper,
          headerTitleStyle: { fontFamily: font.bold, fontSize: size.lg },
          contentStyle: { backgroundColor: color.paper },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Wayline NSW' }} />
        <Stack.Screen name="trips" options={{ title: 'Saved trips' }} />
        <Stack.Screen name="add/index" options={{ title: 'New trip' }} />
        <Stack.Screen name="add/[mode]" options={{ title: 'New trip' }} />
        <Stack.Screen name="pick" options={{ title: 'Choose place' }} />
        <Stack.Screen name="routes" options={{ title: 'Bus routes' }} />
        <Stack.Screen name="trip/[id]" options={{ title: 'Trip' }} />
        <Stack.Screen name="trip/detail" options={{ title: 'Journey' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </QueryClientProvider>
  );
}
