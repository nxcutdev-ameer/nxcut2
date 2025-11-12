import { View, Text, Alert, BackHandler, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../Store/useAuthStore";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const usePasswordScreenVM = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { email, setPassword: setAuthPassword, login } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get("window");
  const navigation: NavigationProp<any, any> = useNavigation();
  // Prevent back navigation during login process on Android
  useEffect(() => {
    const backAction = () => {
      if (isLoading) {
        console.log("[PasswordScreen] Back navigation blocked during login");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isLoading]);

  const handleLogin = async () => {
    console.log("[PasswordScreenVM] handleLogin called");

    if (isLoading) {
      console.log(
        "[PasswordScreenVM] Login already in progress, ignoring additional press"
      );
      return;
    }

    console.log("[PasswordScreenVM] Clearing error and setting loading state");
    setError("");
    setIsLoading(true);

    if (!password) {
      console.log("[PasswordScreenVM] Password validation failed");
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    if (!email) {
      console.log("[PasswordScreenVM] Email validation failed");
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    try {
      console.log(
        "[PasswordScreenVM] Starting login process with email:",
        email
      );
      console.log("[PasswordScreenVM] Password present:", !!password);

      // Set the password in the auth store
      console.log("[PasswordScreenVM] Setting password in auth store...");
      setAuthPassword(password);

      // Call the login function from the auth store
      console.log("[PasswordScreenVM] Calling auth store login...");
      await login();

      console.log(
        "[PasswordScreenVM] Login function completed, checking auth state..."
      );

      // Check if login was actually successful by checking the auth store state
      const authState = useAuthStore.getState();
      console.log("[PasswordScreenVM] Auth state after login:", {
        user: !!authState.user,
        session: !!authState.session,
        error: authState.error,
        loading: authState.loading,
      });

      if (authState.user && authState.session && !authState.error) {
        console.log(
          "[PasswordScreenVM] Login successful, navigating to bottom tabs..."
        );
        navigateToLocationScreen();
      } else {
        console.log("[PasswordScreenVM] Login failed:", authState.error);
        setError(authState.error || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("[PasswordScreenVM] Login error caught:", error);
      console.error("[PasswordScreenVM] Error message:", error.message);
      console.error("[PasswordScreenVM] Error stack:", error.stack);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      console.log("[PasswordScreenVM] Setting loading to false");
      setIsLoading(false);
    }
  };
  const navigateToLocationScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "LocationScreen" }],
    });
  };
  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link will be sent to your email address.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Link",
          onPress: () => console.log("Password reset requested for:", email),
        },
      ]
    );
  };
  return {
    email,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
    handleForgotPassword,
    screenHeight,
    insets,
  };
};

export default usePasswordScreenVM;
