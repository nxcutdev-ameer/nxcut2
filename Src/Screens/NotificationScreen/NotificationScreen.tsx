import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, BellOff, Settings } from "lucide-react-native";
import colors from "../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../Utils/helpers";

const NotificationScreen = () => {
  const navigation: any = useNavigation();

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <BellOff
          size={80}
          color={colors.colors.textSecondary}
          strokeWidth={1}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.colors.text }]}>
        No notifications yet
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: colors.colors.textSecondary }]}
      >
        All your notifications will appear here.{"\n"}
        Stay tuned for important updates about{"\n"}
        appointments, payments, and more!
      </Text>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>No notifications yet</Text>
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
          <ArrowLeft size={20} color={colors.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.colors.text }]}>
            Notifications
          </Text>
        </View>

        {/* <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.colors.text} />
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: getHeightEquivalent(40),
    backgroundColor: colors.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(10),
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
    fontSize: fontEq(20),
    fontWeight: "700",
  },
  settingsButton: {
    padding: getWidthEquivalent(8),
    marginRight: -getWidthEquivalent(8),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(40),
    paddingVertical: getHeightEquivalent(60),
  },
  emptyIconContainer: {
    marginBottom: getHeightEquivalent(32),
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: fontEq(24),
    fontWeight: "700",
    marginBottom: getHeightEquivalent(16),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontEq(16),
    lineHeight: fontEq(24),
    textAlign: "center",
    marginBottom: getHeightEquivalent(32),
  },
  comingSoonBadge: {
    backgroundColor: colors.colors.primary,
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(8),
    borderRadius: 20,
  },
  comingSoonText: {
    color: colors.colors.white,
    fontSize: fontEq(14),
    fontWeight: "600",
  },
});

export default NotificationScreen;
