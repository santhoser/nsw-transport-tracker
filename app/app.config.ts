import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wayline NSW',
  slug: 'wayline-nsw',
  scheme: 'wayline',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  android: {
    package: 'com.santhoser.waylinensw',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'POST_NOTIFICATIONS'],
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '' } },
  },
  ios: { supportsTablet: true, bundleIdentifier: 'com.santhoser.waylinensw' },
  plugins: ['expo-router', 'expo-sqlite', 'expo-secure-store', 'expo-notifications', 'expo-location'],
};

export default config;
