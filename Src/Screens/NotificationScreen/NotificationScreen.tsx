import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
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
        return ['Discounts & tips applied', 'Tip added', 'Manual discount'];
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

      if (append) {
        setItems((prev) => [...prev, ...rows]);
      } else {
        setItems(rows);
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

        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.colors.text} strokeWidth={1.9}/>
        </TouchableOpacity> 
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
             width: tabWidth || undefined,
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
            onPress={() => {
              const t = (n.title || '').toLowerCase();
              if (t.includes('new appointment')) {
                if (n.appointment_id) {
                  navigation.navigate('AppointmentDetailsScreen', {
                    appointment_id: n.appointment_id || undefined,
                  } as any);
                } else {
                  Alert.alert('Appointment', 'No appointment id found');
                }
              } else if (t.includes('appointment canceled') || t.includes('appointment cancelled')) {
                Alert.alert('Appointment Canceled', 'This appointment was canceled.');
              } else if (t.includes('product low stock')) {
                Alert.alert(
                  'Low Stock Alert',
                  n.body || 'One or more products are running low on stock. Please restock soon to avoid shortages.',
                  [{ text: 'OK', style: 'default' }]
                );
              } else if (
                t.includes('discounts & tips applied') ||
                t.includes('tip added') ||
                t.includes('manual discount')
              ) {
                const saleIdMatch = (n.body || '').match(/sale[_\s-]*id[:#\s-]*([A-Za-z0-9_-]+)/i);
                const saleId = saleIdMatch?.[1];
                navigation.navigate('TransactionDetailsScreen', {
                  saleId: saleId,
                } as any);
              }
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.colors.text }]} numberOfLines={1}>
                {n.title}
              </Text>
              <Text style={[styles.cardType, { color: colors.colors.primary }]}>
                {n.type || 'info'}
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.colors.black }]}>
              {n.body}
            </Text>
            <Text style={[styles.cardDate, { color: colors.colors.textSecondary }]}>
              {new Date(n.created_at).toLocaleString()}
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
    paddingBottom: getHeightEquivalent(0),
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
    fontSize: fontEq(20),
    fontWeight: "600",
    fontFamily: "Helvetica",
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
    fontSize: fontEq(14),
    fontWeight: '600',
    marginBottom: getHeightEquivalent(8),
  },
  animatedUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
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
    marginBottom: getHeightEquivalent(6),
  },
  cardTitle: {
    fontSize: fontEq(16),
    fontWeight: '700',
    flex: 1,
    marginRight: getWidthEquivalent(8),
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica",
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
