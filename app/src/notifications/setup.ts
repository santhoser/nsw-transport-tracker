import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const ALERTS_CHANNEL = 'service-alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Plumbing only: alert logic (which services notify, when) is a later phase. */
export async function enableNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // 3 = AndroidImportance.DEFAULT
    await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL, { name: 'Service alerts', importance: 3 });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}
