import "react-native-url-polyfill/auto";
import StackNavigator from "./Src/Navigations/RootStackNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";
import { colors } from "./Src/Constants/colors";
import { Provider as PaperProvider } from "react-native-paper";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { en, registerTranslation } from "react-native-paper-dates";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from "expo-updates";
import { useAuthStore } from "./Src/Store/useAuthStore";
registerTranslation("en", en);
SplashScreen.preventAutoHideAsync();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("[GLOBAL ERROR]", error, isFatal);
  throw error;
});
export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    async function initialize() {
      // Initialize notifications (foreground handler, listeners, token)
      const {
        initializeNotificationHandler,
        requestPermissionsAndGetToken,
        addNotificationListeners,
      } = await import('./Src/Services/NotificationService');
      const { supabase } = await import('./Src/Utils/supabase');
      const { useNotificationsStore } = await import('./Src/Store/useNotificationsStore');
      const { routeFromNotificationData } = await import('./Src/Utils/notificationRouting');
      let pendingRouteData: any | null = null;
      try {
        // Initialize authentication (restore session if exists)
        await initializeAuth();

        // Notifications: set handler and register token
        initializeNotificationHandler();
        const token = await requestPermissionsAndGetToken();
        if (token) {
          const { registerDevicePushTokenGeneric } = await import('./Src/Services/NotificationService');
          await registerDevicePushTokenGeneric(token);
        }
        // Listen for taps on notifications
        

        addNotificationListeners((_data) => {
          // handled below using expo-notifications listener for full content
        });

        // Handle taps while app is running (foreground/background)
        const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
          const content = response?.notification?.request?.content;
          const data = { ...(content?.data || {}), title: content?.title as any, body: content?.body as any };
          routeFromNotificationData(data);
        });

        // Cold start: if app launched from a notification
        (async () => {
          try {
            const last = await Notifications.getLastNotificationResponseAsync();
            if (last) {
              const content = last?.notification?.request?.content;
              const data = { ...(content?.data || {}), title: content?.title as any, body: content?.body as any };
              // Defer routing until navigation is ready; show splash until ready
              pendingRouteData = data;
            }
          } catch {}
        })();

        // Cleanup
        return () => { try { (responseSub as any)?.remove?.(); } catch {} };

        // Initial badge state: check if there are new notifications since last seen
        try {
          const lastSeenAt = await AsyncStorage.getItem('notifications:lastSeenAt');
          const { data: latestRows, error: latestErr } = await supabase
            .from('notifications')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1);
          if (!latestErr && latestRows && latestRows.length > 0) {
            const latest = new Date(latestRows[0].created_at).getTime();
            const lastSeen = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
            if (!lastSeenAt || (isFinite(latest) && latest > lastSeen)) {
              useNotificationsStore.getState().setUnread(true);
            }
          }
        } catch (e) {
          // non-fatal
        }

        // Check for updates (only in production builds, not in Expo Go)
        if (!__DEV__) {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          } catch (updateError) {
            console.log("[App] Update check skipped:", updateError);
          }
        }
      } catch (error) {
        console.error("[App] Initialization error:", error);
      } finally {
        // Hide splash screen only when navigation is ready (or no pending route)
        try {
          const { navigationRef } = await import('./Src/Navigations/navigationRef');
          if (pendingRouteData) {
            const waitReady = () => new Promise<void>((resolve) => {
              if (navigationRef.isReady()) return resolve();
              const i = setInterval(() => { if (navigationRef.isReady()) { clearInterval(i); resolve(); } }, 50);
            });
            const withTimeout = (ms: number) => new Promise<'ready' | 'timeout'>(async (resolve) => {
              let done = false;
              const t = setTimeout(() => { if (!done) { done = true; resolve('timeout'); } }, ms);
              try {
                await waitReady();
                if (!done) { done = true; clearTimeout(t); resolve('ready'); }
              } catch {
                if (!done) { done = true; clearTimeout(t); resolve('timeout'); }
              }
            });

            const result = await withTimeout(5000);
            if (result === 'ready') {
              await routeFromNotificationData(pendingRouteData);
            } else {
              // Fallback: don't block splash; route as soon as navigator is ready in background
              const poll = setInterval(async () => {
                try {
                  if (navigationRef.isReady()) {
                    clearInterval(poll);
                    await routeFromNotificationData(pendingRouteData);
                  }
                } catch {}
              }, 200);
            }
          }
        } catch {}
        await SplashScreen.hideAsync();
      }
    }

    initialize();
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <PaperProvider>
            <ToastProvider
              placement="top"
              duration={3000}
              animationDuration={300}
              animationType="slide-in"
              successColor={colors.success}
              dangerColor={colors.danger}
              warningColor={colors.warning}
              normalColor={colors.primary}
              textStyle={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.white,
              }}
              offset={50}
              offsetTop={30}
              swipeEnabled={true}
              style={{
                borderRadius: 12,
                marginHorizontal: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <StackNavigator />
            </ToastProvider>
          </PaperProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
