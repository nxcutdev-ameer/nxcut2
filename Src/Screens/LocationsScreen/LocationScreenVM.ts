import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../Store/useAuthStore";
//import { Navigation } from "lucide-react-native";
import { useEffect, useState } from "react";
import { authRepository } from "../../Repository/authRepository";
import { LocationBO } from "../../BOs/AuthBO";
import { useToast } from "react-native-toast-notifications";
import { dataHydrationService, HydrationProgress } from "../../Utils/dataHydration";
const useLocationScreenVM = () => {
  const toast = useToast();
  const [locationData, setLocationData] = useState<LocationBO[]>();
  const [isHydrating, setIsHydrating] = useState(false);
  const [hydrationProgress, setHydrationProgress] = useState<HydrationProgress>({
    dashboardComplete: false,
    calendarComplete: false,
    totalSteps: 6,
    completedSteps: 0,
    currentStep: "Initializing...",
  });
  const { session, currentLocation, setCurrentLocation, setIsFromLogin } = useAuthStore();

  const locations: string[] = session?.user?.user_metadata?.locations ?? [];
  const navigation: NavigationProp<any> = useNavigation();

  useEffect(() => {
    if (locations) {
      getLocationDetails();
    }
  }, []);

  const updateCurrentLocation = async (location: string) => {
    await setCurrentLocation(location);
  };

  const getLocationDetails = async () => {
    let responce = await authRepository.getLocationsByIds();
    console.log("in funtion screen location", responce);

    if (responce) {
      setLocationData(responce);
    }
  };
  const navigateToDashboard = async () => {
    if (currentLocation === null || currentLocation === undefined || currentLocation === "") {
      toast.show("Select any one location", {
        type: "danger",
        placement: "top",
        duration: 3000,
        animationDuration: 300,
      });
      return;
    }

    try {
      // Set loading state and start hydration
      console.log("[LocationScreen] Starting data hydration after login...");
      setIsHydrating(true);
      setIsFromLogin(true); // Mark that this is from login flow

      // Start data hydration
      await dataHydrationService.hydrateOnLogin((progress) => {
        setHydrationProgress(progress);
      });

      console.log("[LocationScreen] Data hydration complete, navigating to dashboard...");

      // Navigate to dashboard after hydration is complete
      navigation.reset({
        index: 0,
        routes: [{ name: "BottomTabNavigator" }],
      });
    } catch (error) {
      console.error("[LocationScreen] Error during hydration:", error);
      // Still navigate even if hydration fails
      navigation.reset({
        index: 0,
        routes: [{ name: "BottomTabNavigator" }],
      });
    } finally {
      setIsHydrating(false);
    }
  };
  return {
    session,
    currentLocation,
    locations,
    locationData,
    updateCurrentLocation,
    navigateToDashboard,
    isHydrating,
    hydrationProgress,
  };
};

export default useLocationScreenVM;
