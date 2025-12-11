import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../Utils/supabase';

export type NotificationData = {
  type?: 'booked' | 'canceled' | string;
  appointmentId?: string;
  [key: string]: any;
};

// Foreground behavior: show alert + sound when app is open
// Initialize this once from App.tsx to avoid multiple registrations and linter warnings
let _handlerInitialized = false;
export function initializeNotificationHandler() {
  if (_handlerInitialized) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // Newer SDKs/types expect these iOS presentation options
      shouldShowBanner: true,
      shouldShowList: true,
    } as Notifications.NotificationBehavior),
  });
  _handlerInitialized = true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  });
}

export async function requestPermissionsAndGetToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }

    await ensureAndroidChannel();

    // When using EAS-managed projects, getting the token without a project ID works
    const tokenResp = await Notifications.getExpoPushTokenAsync();
    const token = tokenResp.data;
    return token ?? null;
  } catch (e) {
    console.log('[Notifications] request/token error', e);
    return null;
  }
}

export async function registerDevicePushToken(userId: string, token: string) {
  try {
    // Store or update the token for this user
    // Table: user_push_tokens(user_id uuid primary key, expo_push_token text, updated_at timestamp)
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert(
        { user_id: userId, expo_push_token: token, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    if (error) throw error;
  } catch (e) {
    console.log('[Notifications] registerDevicePushToken error', e);
  }
}

export function addNotificationListeners(onTap?: (data: NotificationData) => void) {
  const receivedSub = Notifications.addNotificationReceivedListener(() => {
    // Optional: could update in-app inbox, badge, etc.
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = (
      response &&
      response.notification &&
      response.notification.request &&
      response.notification.request.content &&
      response.notification.request.content.data
        ? (response.notification.request.content.data as NotificationData)
        : ({} as NotificationData)
    );
    try { onTap && onTap(data); } catch (_e) {}
  });

  return () => {
    try { (receivedSub as any)?.remove?.(); } catch (_e) {}
    try { (responseSub as any)?.remove?.(); } catch (_e) {}
  };
}

export async function presentLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: 'default',
      },
      trigger: null, // show immediately
    });
  } catch (e) {
    console.log('[Notifications] presentLocalNotification error', e);
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await supabase.rpc('mark_notifications_read', { p_user_id: userId });
  } catch (e) {
    // rpc is optional; implement in backend if needed
    console.log('[Notifications] markAllAsRead noop/error', e);
  }
}
