import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  GestureResponderEvent,
  Platform,
} from "react-native";
import { colors, theme } from "../Constants/colors";
import { ChevronRight } from "lucide-react-native";
import { fontEq } from "../Utils/helpers";

interface ListItemProps {
  title: string;
  icon: React.ReactNode;
  showBadge?: boolean;
  badgeValue?: number | string;
  onPress?: (event: GestureResponderEvent) => void;
  isLast?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  icon,
  showBadge = false,
  badgeValue,
  onPress,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isLast && { borderBottomWidth: 0 }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Left: icon + title */}
      <View style={styles.left}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: badge (optional) + chevron */}
      <View style={styles.right}>
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeValue}</Text>
          </View>
        )}
        <ChevronRight size={18} color={colors.black} />
      </View>
    </TouchableOpacity>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  title: {
    fontSize:Platform.OS === 'android' ?fontEq(13): fontEq(15),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.black,
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  badge: {
    minWidth: 28,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.black,
  },
});
