import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "../Constants/colors";
import {
  getHeightEquivalent,
  getWidthEquivalent,
  fontEq,
} from "../Utils/helpers";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  error?: string;
  placeholder?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  error,
  placeholder = "Enter your password",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        focused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.textMuted} />
          ) : (
            <Eye size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: getHeightEquivalent(52),
    borderWidth: getWidthEquivalent(1),
    borderColor: colors.border,
    borderRadius: getWidthEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    backgroundColor: colors.white,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputContainerError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    color: colors.text,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: getWidthEquivalent(8),
    marginLeft: getWidthEquivalent(8),
  },
  errorText: {
    color: colors.danger,
        fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    marginTop: getHeightEquivalent(4),
    marginLeft: getWidthEquivalent(4),
  },
});