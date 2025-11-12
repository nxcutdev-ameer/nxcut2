import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider as SafeAreaViewContext,
  SafeAreaView,
} from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { PasswordInput } from "../../../Components/PasswordInput";
import { Button } from "../../../Components/Button";
import { colors } from "../../../Constants/colors";
import { getHeightEquivalent } from "../../../Utils/helpers";
import { PasswordScreenStyles } from "./PasswordScreenStyles";
import usePasswordScreenVM from "./PasswordScreenVM";
import LottieView from "lottie-react-native";

const PasswordScreen = ({ navigation }: { navigation: any }) => {
  const {
    isLoading,
    error,
    setPassword: setAuthPassword,
    handleForgotPassword,
    handleLogin,
    screenHeight,
    password,
    setPassword,
    insets,
  } = usePasswordScreenVM();

  return (
    <SafeAreaView
      style={PasswordScreenStyles.safeArea}
      edges={
        Platform.OS === "ios" ? ["top", "left", "right"] : ["left", "right"]
      }
    >
      <View
        style={[
          PasswordScreenStyles.backButtonContainer,
          {
            top:
              Platform.OS === "ios"
                ? getHeightEquivalent(28)
                : Math.max(insets.top + 16, 20),
            left: 10,
          },
        ]}
      >
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => navigation.goBack()}
          style={PasswordScreenStyles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
          <Text style={PasswordScreenStyles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView
          style={PasswordScreenStyles.keyboardAvoid}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[
              PasswordScreenStyles.centeredContent,
              {
                minHeight: screenHeight - insets.top - insets.bottom,
                paddingTop: 80,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={PasswordScreenStyles.container}>
              <View
                style={[
                  PasswordScreenStyles.logoContainer,
                  {
                    height: Math.min(screenHeight * 0.2, 180),
                    marginBottom: 24,
                  },
                ]}
              >
                <LottieView
                  source={{
                    uri: "https://lottie.host/cb7dd915-f634-468b-8f78-7ad30a9f44e5/zs4zsrSxqx.lottie",
                  }}
                  autoPlay
                  loop={false}
                  style={PasswordScreenStyles.loadingLottie}
                />
              </View>
              <Text style={PasswordScreenStyles.title}>
                Sign in to your account
              </Text>
              <View style={PasswordScreenStyles.formContainer}>
                <PasswordInput
                  value={password}
                  onChangeText={(text) =>
                    isLoading ? undefined : setPassword(text)
                  }
                  onSubmit={isLoading ? undefined : handleLogin}
                  error={error}
                  placeholder="Enter your password"
                />
                <Button
                  title={isLoading ? "Signing in..." : "Continue"}
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={PasswordScreenStyles.continueButton}
                />
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={PasswordScreenStyles.forgotPasswordContainer}
                >
                  <Text style={PasswordScreenStyles.forgotPasswordText}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        // Android: Use ScrollView with windowSoftInputMode instead of KeyboardAvoidingView
        <ScrollView
          contentContainerStyle={[
            PasswordScreenStyles.centeredContent,
            {
              minHeight: screenHeight - insets.top - insets.bottom,
              paddingTop: Math.max(insets.top + 80, 100),
              paddingBottom: 50, // Extra padding for Android keyboard
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={PasswordScreenStyles.container}>
            <View
              style={[
                PasswordScreenStyles.logoContainer,
                {
                  height: Math.min(screenHeight * 0.2, 180),
                  marginBottom: 24,
                },
              ]}
            >
              <View style={PasswordScreenStyles.logoPlaceholder}>
                <Text style={PasswordScreenStyles.logoText}>🔐</Text>
              </View>
            </View>
            <Text style={PasswordScreenStyles.title}>
              Sign in to your account
            </Text>
            <View style={PasswordScreenStyles.formContainer}>
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                onSubmit={handleLogin}
                error={error}
                placeholder="Enter your password"
              />
              <Button
                title={isLoading ? "Signing in..." : "Continue"}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={PasswordScreenStyles.continueButton}
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={PasswordScreenStyles.forgotPasswordContainer}
              >
                <Text style={PasswordScreenStyles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PasswordScreen;
