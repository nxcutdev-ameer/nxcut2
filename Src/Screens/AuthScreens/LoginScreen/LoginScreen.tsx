import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { loginScreenStyles } from "./LoginScreenStyles";
import { EmailInput } from "../../../Components/EmailInput";
import { useAuthStore } from "../../../Store/useAuthStore";

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { email, setEmail } = useAuthStore();
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (emailText: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailText);
  };

  const handleEmailChange = (emailText: string) => {
    setEmail(emailText);
    setIsEmailValid(validateEmail(emailText));
  };

  const handleContinuePress = () => {
    if (isEmailValid) {
      navigation.navigate("PasswordScreen");
    }
  };

  // const handleSignupPress = () => {
  //   navigation.navigate("RegisterScreen");
  // };

  return (
    <View style={loginScreenStyles.container}>
      <View style={loginScreenStyles.content}>
        <Text style={loginScreenStyles.title}>Welcome Back</Text>
        <Text style={loginScreenStyles.subtitle}>
          Enter your email to continue
        </Text>

        <View style={loginScreenStyles.inputContainer}>
          <EmailInput
            value={email}
            onChangeText={handleEmailChange}
            onSubmit={handleContinuePress}
            error={
              !isEmailValid && email.length > 0
                ? "Please enter a valid email"
                : undefined
            }
          />
        </View>

        <TouchableOpacity
          style={[
            loginScreenStyles.continueButton,
            !isEmailValid && loginScreenStyles.continueButtonDisabled,
          ]}
          onPress={handleContinuePress}
          disabled={!isEmailValid}
        >
          <Text
            style={[
              loginScreenStyles.continueButtonText,
              !isEmailValid && loginScreenStyles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>

        {/* <View style={loginScreenStyles.signupContainer}>
          <Text style={loginScreenStyles.signupText}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={handleSignupPress}>
            <Text style={loginScreenStyles.signupLink}>Create one!</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

export default LoginScreen;
