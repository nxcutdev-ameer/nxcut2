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
      try {
        // Initialize authentication (restore session if exists)
        await initializeAuth();

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
        // Hide splash screen after initialization
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
