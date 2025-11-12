import { useState } from "react";
import { NavigationProp } from "@react-navigation/native";

interface LoginScreenVMProps {
  navigation: NavigationProp<any>;
}

const useLoginScreenVM = ({ navigation }: LoginScreenVMProps) => {
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean | string>("");
  const updateEmail = (email: string) => {
    setEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setIsEmailValid(emailRegex.test(email));
  };

  const handleContinuePress = () => {
    if (isEmailValid) {
      navigation.navigate("RegisterScreen");
    }
  };

  // const handleSignupPress = () => {
  //   navigation.navigate("RegisterScreen");
  // };

  return {
    email,
    updateEmail,
    isEmailValid,
    handleContinuePress,
   // handleSignupPress,
  };
};

export default useLoginScreenVM;
