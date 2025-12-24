import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useNotificationsStore } from "../../Store/useNotificationsStore";
import { ArrowLeft, BellOff, Settings } from "lucide-react-native";
import colors from "../../Constants/colors";
import { supabase } from "../../Utils/supabase";
import { routeFromNotificationData } from "../../Utils/notificationRouting";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
  formatTimeAgo,
} from "../../Utils/helpers";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  type: string | null;
  appointment_id: string | null;
  sale_id?: string | number | null;
  created_at: string;
};

const NotificationScreen = () => {
  const navigation: any = useNavigation();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  type TabKey = 'appointments' | 'tips_discounts' | 'products';
  const [currentTab, setCurrentTab] = useState<TabKey>('appointments');
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const underlineAnim = React.useRef(new Animated.Value(0)).current;
  const [tabsWidth, setTabsWidth] = useState(0);
  const tabWidth = tabsWidth > 0 ? tabsWidth / 3 : 0;

  // Title-based filters per tab
  const getTitlesForTab = (tab: TabKey) => {
    switch (tab) {
      case 'appointments':
        return ['New appointment', 'Appointment canceled', 'Appointment cancelled'];
      case 'tips_discounts':
        return [
          'Discounts & tips applied',
          'Tip added',
          'Manual discount',
          'Voucher applied',
          'Membership discount',
          'Discount applied',
          'Voucher sold',
          'Membership sold'
        ];
      case 'products':
        return ['Product Low stock'];
      default:
        return [] as string[];
    }
  };

  const fetchNotifications = useCallback(async (nextPage = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const titleFilter = getTitlesForTab(currentTab);

      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (titleFilter.length) {
        const orExpr = titleFilter.map((t) => `title.ilike.%${t}%`).join(',');
        query = query.or(orExpr);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = Array.isArray(data) ? (data as NotificationRow[]).filter(Boolean) : [];

      const dedupe = (list: NotificationRow[]) => {
        const map = new Map<string, NotificationRow>();
        for (const it of list) if (it && it.id) map.set(it.id, it);
        return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      };

      if (append) {
        setItems((prev) => dedupe([...prev, ...rows]));
      } else {
        setItems(dedupe(rows));
      }
      setHasMore(rows.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (e) {
      console.log("[NotificationScreen] fetch error", e);
    } finally {
      if (!append) setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    // move underline to tab index: 0 appointments, 1 tips, 2 products
    const index = currentTab === 'appointments' ? 0 : currentTab === 'tips_discounts' ? 1 : 2;
    Animated.timing(underlineAnim, {
      toValue: index,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true, // for transform only
    }).start();

    // crossfade list on tab change
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.2, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    fetchNotifications(0, false);
  }, [fetchNotifications, currentTab, fadeAnim, underlineAnim]);

  const isFocused = useIsFocused();

  // When entering the notification screen, mark notifications as read for this session
  // and persist last-seen timestamp so the initial badge check (App.tsx) is consistent.
  useFocusEffect(
    React.useCallback(() => {
      try {
        useNotificationsStore.getState().markRead();
        AsyncStorage.setItem(
          "notifications:lastSeenAt",
          new Date().toISOString()
        );
      } catch {}
      return () => {};
    }, [])
  );

  // Debounced refresh requests to avoid multiple rapid reloads
  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRefresh = useCallback(() => {
    try { if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current); } catch {}
    refreshDebounceRef.current = setTimeout(() => {
      fetchNotifications(0, false);
    }, 400);
  }, [fetchNotifications]);

  // Live refresh with Expo notifications (foreground receive and tap)
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      // Foreground push received; refresh current tab
      try {
        if (isFocused) {
          // User is already reading notifications; don't show a badge.
          useNotificationsStore.getState().markRead();
          AsyncStorage.setItem(
            "notifications:lastSeenAt",
            new Date().toISOString()
          );
        } else {
          useNotificationsStore.getState().setUnread(true);
        }
      } catch {}
      requestRefresh();
    });
    const responded = Notifications.addNotificationResponseReceivedListener(() => {
      // User tapped a notification; refresh as well
      requestRefresh();
    });
    return () => {
      try { (received as any)?.remove?.(); } catch {}
      try { (responded as any)?.remove?.(); } catch {}
    };
  }, [isFocused, requestRefresh]);

  // Live refresh with Supabase realtime on notifications insert
  useEffect(() => {
    const channel = supabase
      .channel('notifications_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          try {
            if (isFocused) {
              useNotificationsStore.getState().markRead();
              AsyncStorage.setItem(
                "notifications:lastSeenAt",
                new Date().toISOString()
              );
            } else {
              useNotificationsStore.getState().setUnread(true);
            }
          } catch {}
          requestRefresh();
        },
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [isFocused, requestRefresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(0, false);
    setRefreshing(false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchNotifications(nextPage, true);
    setLoadingMore(false);
  }, [loadingMore, loading, hasMore, page, fetchNotifications]);

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
          <ArrowLeft size={20} color={colors.colors.text}  strokeWidth={1.9}/>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.colors.text }]}>
            Notifications
          </Text>
        </View>

        {/* <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.colors.text} strokeWidth={1.9}/>
        </TouchableOpacity>  */}
      </View>

      {/* Tabs above header border */}
      <View style={styles.tabsRow} onLayout={(e) => setTabsWidth(e.nativeEvent.layout.width)} >
        {([
          { key: 'appointments', label: 'Appointments' },
          { key: 'tips_discounts', label: 'Tips & Discount' },
          { key: 'products', label: 'Products' },
        ] as { key: TabKey; label: string }[]).map((t) => {
          const active = currentTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => {
                if (currentTab !== t.key) {
                  setCurrentTab(t.key);
                }
              }}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: active ? colors.colors.text : colors.colors.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* animated underline that slides between tabs */}
        <Animated.View
         style={[
           styles.animatedUnderline,
           {
             width: tabWidth-5-10 || undefined,
             transform: [
               {
                 translateX: underlineAnim.interpolate({
                   inputRange: [0, 1, 2],
                   outputRange: [0, tabWidth, tabWidth * 2],
                 }),
               },
             ],
             backgroundColor: colors.colors.black,
           },
         ]}
       />
      </View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        data={(items || []).filter(Boolean)}
        keyExtractor={(n) => n.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={loading ? (
          <View style={{ paddingHorizontal: getWidthEquivalent(16), paddingTop: getHeightEquivalent(12) }}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.colors.white, marginBottom: getHeightEquivalent(12) }]}>
                <View style={{ height: 16, backgroundColor: colors.colors.gray[200], borderRadius: 6, marginBottom: 8 }} />
                <View style={{ height: 12, backgroundColor: colors.colors.gray[200], borderRadius: 6, marginBottom: 6 }} />
                <View style={{ height: 10, width: '60%', backgroundColor: colors.colors.gray[200], borderRadius: 6 }} />
              </View>
            ))}
          </View>
        ) : renderEmptyState}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator color={colors.colors.primary} />
          </View>
        ) : null}
        renderItem={({ item: n }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.colors.white }]}
            activeOpacity={0.8}
            onPress={() =>
              routeFromNotificationData({
                title: n.title,
                body: n.body,
                appointment_id: n.appointment_id || undefined,
                saleId:
                  n.sale_id !== undefined && n.sale_id !== null
                    ? String(n.sale_id)
                    : undefined,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.colors.text }]} numberOfLines={1}>
                {n.title}
              </Text>
              <Text style={[styles.cardType, { color: colors.colors.primary }]}>
                {n.type || 'info'}
              </Text>
            </View>
            <Text style={[styles.cardDate, { color: colors.colors.textSecondary }]}>
              {formatTimeAgo(n.created_at)}
            </Text>
            <Text style={[styles.cardBody, { color: colors.colors.black }]}>
              {n.body}
            </Text>
          </TouchableOpacity>
        )}
      />
      </Animated.View>
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
    paddingBottom: getHeightEquivalent(18),
    borderBottomWidth: 0,
    borderBottomColor: colors.colors.border,
    position: 'relative',
    zIndex: 2,
  },
  backButton: {
    padding: getWidthEquivalent(8),
    marginLeft: -getWidthEquivalent(8),
  },
  headerCenter: {
    flex: 1,
    alignItems: "flex-start",
    paddingVertical:  getHeightEquivalent(20),
  },
  headerTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(20),
     fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: "600",
  },
  settingsButton: {
    padding: getWidthEquivalent(8),
    marginRight: -getWidthEquivalent(8),
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: getWidthEquivalent(8),
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: '600',
    marginBottom: getHeightEquivalent(8),
  },
  animatedUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 10,
    height: 2.9,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.colors.background,
    paddingTop: getHeightEquivalent(10),
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
    borderRadius: getWidthEquivalent(8),
    padding: getWidthEquivalent(14),
    marginHorizontal:getWidthEquivalent(14),
    marginVertical: getHeightEquivalent(8),
    borderWidth: 1,
    borderColor: colors.colors.gray[300],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getHeightEquivalent(3),
  },
  cardTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: '700',
    flex: 1,
    marginRight: getWidthEquivalent(8),
  },
  cardType: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(2),
    borderRadius: getHeightEquivalent(999),
    overflow: 'hidden',
    backgroundColor: colors.colors.primaryLight,
    color: colors.colors.primary,
  },
  cardBody: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    lineHeight: fontEq(20),
    marginBottom: getHeightEquivalent(6),
  },
  cardDate: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    marginBottom: getHeightEquivalent(12),
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
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(24),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: "700",
    marginBottom: getHeightEquivalent(16),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
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
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : "Helvetica",
    fontWeight: "600",
  },
});

export default NotificationScreen;
