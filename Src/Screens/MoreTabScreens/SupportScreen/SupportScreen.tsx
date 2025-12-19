import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

const SupportScreen = () => {
  const navigation: any = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL("mailto:legal@nxcut.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+971553962629");
  };

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: () => handleEmailPress(),
    },
    // {
    //   icon: MessageCircle,
    //   title: "Live Chat",
    //   description: "Chat with our support team",
    //   action: () => {},
    //   comingSoon: true,
    // },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us at +971 55 396 2629",
      action: () => handlePhonePress(),
    },
  ];

  const renderSupportOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.supportOptionCard,
        { backgroundColor: colors.colors.surface },
        option.comingSoon && styles.disabledCard,
      ]}
      onPress={option.action}
      disabled={option.comingSoon}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.colors.primary },
        ]}
      >
        <option.icon size={24} color={colors.colors.white} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: colors.colors.text }]}>
          {option.title}
        </Text>
        <Text
          style={[
            styles.optionDescription,
            { color: colors.colors.textSecondary },
          ]}
        >
          {option.description}
        </Text>
      </View>
      {option.comingSoon ? (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      ) : (
        <ExternalLink size={20} color={colors.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const renderContactSection = () => (
    <View
      style={[
        styles.contactSection,
        { backgroundColor: colors.colors.surface },
      ]}
    >
      <View style={styles.contactHeader}>
        <Shield size={32} color={colors.colors.primary} />
        <Text style={[styles.contactTitle, { color: colors.colors.text }]}>
          CONTACT US
        </Text>
      </View>

      <Text
        style={[
          styles.contactDescription,
          { color: colors.colors.textSecondary },
        ]}
      >
        For more information about our privacy practices, if you have questions,
        or if you would like to make a complaint, please contact us by e‑mail at
      </Text>

      <TouchableOpacity
        style={styles.emailContainer}
        onPress={handleEmailPress}
      >
        <Mail size={20} color={colors.colors.primary} />
        <Text style={[styles.emailText, { color: colors.colors.primary }]}>
          legal@nxcut.com
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickInfo = () => (
    <View style={styles.quickInfoContainer}>
      <View
        style={[
          styles.quickInfoCard,
          { backgroundColor: colors.colors.surface },
        ]}
      >
        <Users size={24} color={colors.colors.primary} />
        <Text style={[styles.quickInfoTitle, { color: colors.colors.text }]}>
          Dedicated Support Team
        </Text>
        <Text
          style={[
            styles.quickInfoDescription,
            { color: colors.colors.textSecondary },
          ]}
        >
          Our experts are here to help you succeed
        </Text>
      </View>

      <View
        style={[
          styles.quickInfoCard,
          { backgroundColor: colors.colors.surface },
        ]}
      >
        <Clock size={24} color={colors.colors.primary} />
        <Text style={[styles.quickInfoTitle, { color: colors.colors.text }]}>
          Quick Response
        </Text>
        <Text
          style={[
            styles.quickInfoDescription,
            { color: colors.colors.textSecondary },
          ]}
        >
          Most emails answered within 24 hours
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={[styles.container, { backgroundColor: colors.colors.white }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.colors.text }]}>
            Help & Support
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.colors.text }]}>
            How can we help you?
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.colors.textSecondary },
            ]}
          >
            Choose the best way to get in touch with our support team
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.supportOptionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.colors.text }]}>
            Get Support
          </Text>
          {supportOptions.map(renderSupportOption)}
        </View>

        {/* Quick Info Cards */}
        {renderQuickInfo()}

        {/* Contact Section */}
        {renderContactSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
  },
  backButton: {
    padding: getWidthEquivalent(8),
    marginLeft: -getWidthEquivalent(8),
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(20),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
  },
  headerSpacer: {
    // width: getWidthEquivalent(40),
    // borderWidth:1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getHeightEquivalent(40),
  },
  heroSection: {
    paddingHorizontal: getWidthEquivalent(24),
    paddingVertical: getHeightEquivalent(32),
    alignItems: "center",
  },
  heroTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(28),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: getHeightEquivalent(12),
  },
  heroSubtitle: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    textAlign: "center",
    lineHeight: fontEq(24),
  },
  supportOptionsContainer: {
    paddingHorizontal: getWidthEquivalent(24),
    marginBottom: getHeightEquivalent(32),
  },
  sectionTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(20),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    marginBottom: getHeightEquivalent(16),
  },
  supportOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: getWidthEquivalent(20),
    borderRadius: 12,
    marginBottom: getHeightEquivalent(12),
    borderWidth: 1,
    borderColor: colors.colors.border,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: getWidthEquivalent(48),
    height: getHeightEquivalent(48),
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: getWidthEquivalent(16),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    marginBottom: getHeightEquivalent(4),
  },
  optionDescription: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    lineHeight: fontEq(20),
  },
  comingSoonBadge: {
    backgroundColor: colors.colors.primary,
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(4),
    borderRadius: 12,
  },
  comingSoonText: {
    color: colors.colors.white,
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
  },
  quickInfoContainer: {
    flexDirection: "row",
    paddingHorizontal: getWidthEquivalent(24),
    marginBottom: getHeightEquivalent(32),
    gap: getWidthEquivalent(12),
  },
  quickInfoCard: {
    flex: 1,
    alignItems: "center",
    padding: getWidthEquivalent(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.colors.border,
  },
  quickInfoTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    marginTop: getHeightEquivalent(12),
    marginBottom: getHeightEquivalent(4),
    textAlign: "center",
  },
  quickInfoDescription: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    textAlign: "center",
    lineHeight: fontEq(20),
  },
  contactSection: {
    marginHorizontal: getWidthEquivalent(24),
    padding: getWidthEquivalent(24),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.colors.border,
  },
  contactHeader: {
    alignItems: "center",
    marginBottom: getHeightEquivalent(20),
  },
  contactTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(20),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    marginTop: getHeightEquivalent(12),
    letterSpacing: 1,
  },
  contactDescription: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    lineHeight: fontEq(24),
    textAlign: "center",
    marginBottom: getHeightEquivalent(20),
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.colors.background,
    padding: getWidthEquivalent(16),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.colors.primary,
  },
  emailText: {
     fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    marginLeft: getWidthEquivalent(8),
  },
});

export default SupportScreen;
