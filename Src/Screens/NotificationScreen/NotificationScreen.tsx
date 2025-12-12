import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, BellOff, Settings } from "lucide-react-native";
import colors from "../../Constants/colors";
import { supabase } from "../../Utils/supabase";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../Utils/helpers";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  type: string | null;
  appointment_id: string | null;
  created_at: string;
};

const NotificationScreen = () => {
  const navigation: any = useNavigation();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data as NotificationRow[]) ?? []);
    } catch (e) {
      console.log("[NotificationScreen] fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.listContainer}>
            {items.map((n) => (
              <View key={n.id} style={[styles.card, { backgroundColor: colors.colors.surface }] }>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.colors.text }]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={[styles.cardType, { color: colors.colors.primary }]}>
                    {n.type || "info"}
                  </Text>
                </View>
                <Text style={[styles.cardBody, { color: colors.colors.textSecondary }]}>
                  {n.body}
                </Text>
                <Text style={[styles.cardDate, { color: colors.colors.textSecondary }]}>
                  {new Date(n.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  listContainer: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    gap: getHeightEquivalent(12),
  },
  card: {
    borderRadius: 12,
    padding: getWidthEquivalent(14),
    borderWidth: 1,
    borderColor: colors.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getHeightEquivalent(6),
  },
  cardTitle: {
    fontSize: fontEq(16),
    fontWeight: '700',
    flex: 1,
    marginRight: getWidthEquivalent(8),
  },
  cardType: {
    fontSize: fontEq(12),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    fontSize: fontEq(14),
    lineHeight: fontEq(20),
    marginBottom: getHeightEquivalent(6),
  },
  cardDate: {
    fontSize: fontEq(12),
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
