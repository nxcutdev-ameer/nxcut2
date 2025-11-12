import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../Constants/colors";
import {
  getHeightEquivalent,
  getWidthEquivalent,
  fontEq,
} from "../Utils/helpers";

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  error?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Common email domains
  const emailDomains = [
    "@gmail.com",
    "@hotmail.com",
    "@yahoo.com",
    "@outlook.com",
  ];

  // Split email into username and domain parts
  const emailParts = localValue.split("@");
  const username = emailParts[0];
  const domain = emailParts.length > 1 ? `@${emailParts[1]}` : "";

  const handleDomainSelect = (selectedDomain: string) => {
    const newEmail = username + selectedDomain;
    setLocalValue(newEmail);
    onChangeText(newEmail);
  };

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholder="Enter your email address"
        value={localValue}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={onSubmit}
        placeholderTextColor={colors.textMuted}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.domainsContainer}
      >
        {emailDomains.map((emailDomain) => (
          <TouchableOpacity
            key={emailDomain}
            style={styles.domainButton}
            onPress={() => handleDomainSelect(emailDomain)}
          >
            <Text style={styles.domainText}>{emailDomain}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    height: getHeightEquivalent(45),
    borderWidth: getWidthEquivalent(1),
    borderColor: colors.border,
    borderRadius: getWidthEquivalent(8),
    paddingHorizontal: getWidthEquivalent(16),
    fontSize: fontEq(16),
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.textMuted,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontEq(14),
    marginTop: getHeightEquivalent(4),
    marginLeft: getWidthEquivalent(4),
  },
  domainsContainer: {
    marginTop: getHeightEquivalent(12),
    // paddingRight: getWidthEquivalent(16),
  },
  domainButton: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(10),
    borderRadius: getWidthEquivalent(100),
    backgroundColor: colors.white,
    borderWidth: getWidthEquivalent(1),
    borderColor: colors.border,
    marginRight: getWidthEquivalent(5),
  },
  domainText: {
    fontSize: fontEq(14),
    color: colors.text,
  },
});
