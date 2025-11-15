import { StyleSheet, View, Animated, Easing } from "react-native";
import React, { FC, useEffect, useState, useRef } from "react";
import { NavigationProp } from "@react-navigation/native";
import { supabase } from "../../Utils/supabase";
import { useAuthStore } from "../../Store/useAuthStore";
import {
  getHeightEquivalent,
  getWidthEquivalent,
  fontEq,
} from "../../Utils/helpers";
import {
  AppMetadataBO,
  IdentityBO,
  SessionBO,
  UserBO,
  UserMetadataBO,
} from "../../BOs/AuthBO";
import { Session, User } from "@supabase/supabase-js";
import {
  dataHydrationService,
  HydrationProgress,
} from "../../Utils/dataHydration";
import colors from "../../Constants/colors";

interface SplashScreenProps {
  navigation: NavigationProp<any>;
}

const SplashScreen: FC<SplashScreenProps> = ({ navigation }) => {
  const { setUser, setSession, setCurrentLocation, setIsFromLogin } =
    useAuthStore();

  const [hydrationProgress, setHydrationProgress] = useState<HydrationProgress>(
    {
      dashboardComplete: false,
      calendarComplete: false,
      totalSteps: 6,
      completedSteps: 0,
      currentStep: "Initializing...",
    }
  );
  const [isHydrating, setIsHydrating] = useState(false);
  const [splashStartTime] = useState(Date.now());
  const heartbeatScale = useRef(new Animated.Value(1)).current;

  const ensureMinimumSplashTime = async (callback: () => void) => {
    const elapsedTime = Date.now() - splashStartTime;
    const minimumTime = 2000; // 2 seconds

    if (elapsedTime < minimumTime) {
      const remainingTime = minimumTime - elapsedTime;
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    callback();
  };

  useEffect(() => {
    const heartbeatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatScale, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    heartbeatAnimation.start();

    return () => {
      heartbeatAnimation.stop();
      heartbeatScale.setValue(1);
    };
  }, [heartbeatScale]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log("[Splash] Session check error:", error.message);
          await ensureMinimumSplashTime(goToLogin);
          return;
        }

        if (session) {
          console.log("[Splash] Session restored:", session);

          if (session !== null) {
            // hydrate AuthStore
            let processedSession = mapSessionToBO(session);
            setUser(processedSession.user);
            setSession(processedSession);
            setCurrentLocation(session.user?.user_metadata?.location_id);
            // Reset isFromLogin flag since this is app startup authentication
            setIsFromLogin(false);
          }

          // Start data hydration
          console.log("[Splash] Starting data hydration...");
          setIsHydrating(true);
          await dataHydrationService.hydrateInitialData((progress) => {
            setHydrationProgress(progress);
          });

          // Navigate after hydration is complete
          console.log(
            "[Splash] Data hydration complete - navigating to BottomTabs"
          );
          await ensureMinimumSplashTime(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "BottomTabNavigator" }],
            });
          });
        } else {
          console.log("[Splash] No active session");
          await ensureMinimumSplashTime(goToLogin);
        }
      } catch (err) {
        console.log("[Splash] Unexpected error:", err);
        await ensureMinimumSplashTime(goToLogin);
      }
    };

    const goToLogin = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    };

    checkSession();
  }, [navigation]);
  const mapSessionToBO = (session: Session): SessionBO => {
    return {
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
      user: mapUserToBO(session.user),
      weak_password: null,
    };
  };

  const mapUserToBO = (user: User): UserBO => {
    return {
      id: user.id,
      aud: user.aud,
      role: user.role,
      email: user.email ?? undefined,
      email_confirmed_at: user.email_confirmed_at ?? null,
      phone: user.phone ?? "",
      confirmed_at: user.confirmed_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      app_metadata: user.app_metadata as AppMetadataBO, // TODO: type as AppMetadataBO
      user_metadata: user.user_metadata as UserMetadataBO, // TODO: type as UserMetadataBO
      identities: (user.identities ?? []) as IdentityBO[], // TODO: type as IdentityBO[]
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_anonymous: user.is_anonymous,
    };
  };
  return (
    <View style={splashScreenStyles.container}>
      <Animated.Image
        resizeMode="contain"
        style={[
          splashScreenStyles.imageContainer,
          { transform: [{ scale: heartbeatScale }] },
        ]}
        source={require("../../Assets/Images/nxcut.png")}
      />

      {/*{isHydrating && (
        <View style={splashScreenStyles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.colors.primary}
            style={splashScreenStyles.loadingIndicator}
          />
          <Text style={splashScreenStyles.loadingText}>
            {hydrationProgress.currentStep}
          </Text>
          <View style={splashScreenStyles.progressContainer}>
            <View style={splashScreenStyles.progressBarBackground}>
              <View
                style={[
                  splashScreenStyles.progressBarFill,
                  {
                    width: `${
                      (hydrationProgress.completedSteps /
                        hydrationProgress.totalSteps) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={splashScreenStyles.progressText}>
              {hydrationProgress.completedSteps}/{hydrationProgress.totalSteps}
            </Text>
          </View>
        </View>
      )}*/}
    </View>
  );
};

export default SplashScreen;

const splashScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.colors.white,
  },
  imageContainer: {
    width: getWidthEquivalent(400),
    height: getHeightEquivalent(400),
  },
  loadingContainer: {
    position: "absolute",
    bottom: getHeightEquivalent(100),
    alignItems: "center",
    width: "100%",
    paddingHorizontal: getWidthEquivalent(40),
  },
  loadingIndicator: {
    marginBottom: getHeightEquivalent(20),
  },
  loadingText: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(20),
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: getHeightEquivalent(6),
    backgroundColor: colors.colors.border,
    borderRadius: 3,
    marginBottom: getHeightEquivalent(8),
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.colors.primary,
    borderRadius: 3,
    minWidth: "5%",
  },
  progressText: {
    fontSize: fontEq(12),
    color: colors.colors.textSecondary,
  },
});
