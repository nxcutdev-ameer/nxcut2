import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { colors } from "../Constants/colors";
import {
  getHeightEquivalent,
  getWidthEquivalent,
  fontEq,
} from "../Utils/helpers";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = "primary",
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];

    switch (variant) {
      case "secondary":
        baseStyle.push(styles.buttonSecondary);
        break;
      case "outline":
        baseStyle.push(styles.buttonOutline);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    switch (variant) {
      case "secondary":
        baseStyle.push(styles.buttonTextSecondary);
        break;
      case "outline":
        baseStyle.push(styles.buttonTextOutline);
        break;
      default:
        baseStyle.push(styles.buttonTextPrimary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonTextDisabled);
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: getHeightEquivalent(52),
    borderRadius: getWidthEquivalent(12),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: getWidthEquivalent(1),
    borderColor: colors.border,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: getWidthEquivalent(1),
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    borderColor: colors.buttonDisabled,
  },
  buttonText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.buttonTextDisabled,
  },
});
