import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";

type ReportCardProps = {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isFavourite?: boolean;
  onPress?: () => void;
};

const typeColors: Record<string, string> = {
  Sales: "#22c55e", // green
  Finance: "#3b82f6", // blue
  Inventory: "#ef4444", // red
  Team: "#f97316", // orange
  Appointment: "#9333ea", // purple
};

const ReportCard: React.FC<ReportCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
  isFavourite,
  onPress,
}) => {
  const color = typeColors[type] || "#6b7280"; // fallback gray

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Favourite star - Top right corner */}
      <View style={styles.starContainer}>
        <Star
          size={18}
          color={isFavourite ? "#fbbf24" : "#d1d5db"}
          fill={isFavourite ? "#fbbf24" : "transparent"}
        />
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={22} color={color} />
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 80, // Static height for all cards
    position: "relative",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  starContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 24, // Add padding to avoid overlap with star
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18, // Control line height for consistency
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 16, // Control line height for 2-line consistency
  },
});

export default ReportCard;
