import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { getHeightEquivalent, getWidthEquivalent } from "../Utils/helpers";
import { colors } from "../Constants/colors";
import LottieView from "lottie-react-native";
import { PasswordScreenStyles } from "../Screens/AuthScreens/PasswordScreen/PasswordScreenStyles";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[200], colors.gray[300]],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height: getHeightEquivalent(height),
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// Specific skeleton components for dashboard sections
export const LineGraphSkeleton = () => (
  <View style={skeletonStyles.lineGraphContainer}>
    {/* Title skeleton */}
    {/* <SkeletonLoader
      width="45%"
      height={20}
      style={{ marginBottom: getHeightEquivalent(6) }}
    /> */}
    {/* Subtitle skeleton */}
    {/* <SkeletonLoader
      width="65%"
      height={14}
      style={{ marginBottom: getHeightEquivalent(8) }}
    /> */}
    {/* Amount skeleton */}
    {/* <SkeletonLoader
      width="35%"
      height={28}
      style={{ marginBottom: getHeightEquivalent(4) }}
    /> */}
    {/* Stats skeleton */}
    {/* <SkeletonLoader
      width="50%"
      height={16}
      style={{ marginBottom: getHeightEquivalent(4) }}
    /> */}
    {/* <SkeletonLoader
      width="55%"
      height={16}
      style={{ marginBottom: getHeightEquivalent(16) }}
    /> */}
    {/* Graph skeleton */}
    {/* <SkeletonLoader width="100%" height={200} borderRadius={8} /> */}
    {/* Legend skeleton */}
    <View style={skeletonStyles.legendContainer}>
      <LottieView
        source={{
          uri: "https://lottie.host/b1f0ca80-63e3-4432-9f44-4542a8f713db/3tO2P7NJBk.lottie",
        }}
        autoPlay
        loop={false}
        style={{
          height: getWidthEquivalent(300),
          width: getWidthEquivalent(450),
        }}
      />
      {/* <SkeletonLoader width={60} height={120} />
      <SkeletonLoader width={80} height={12} /> */}
    </View>
  </View>
);

export const BarGraphSkeleton = () => (
  <View style={skeletonStyles.barGraphContainer}>
    {/* Title skeleton */}
    <SkeletonLoader
      width="55%"
      height={20}
      style={{ marginBottom: getHeightEquivalent(6) }}
    />
    {/* Subtitle skeleton */}
    <SkeletonLoader
      width="60%"
      height={14}
      style={{ marginBottom: getHeightEquivalent(8) }}
    />
    {/* Count skeleton */}
    <SkeletonLoader
      width="25%"
      height={24}
      style={{ marginBottom: getHeightEquivalent(4) }}
    />
    {/* Stats skeleton */}
    <SkeletonLoader
      width="45%"
      height={16}
      style={{ marginBottom: getHeightEquivalent(4) }}
    />
    <SkeletonLoader
      width="40%"
      height={16}
      style={{ marginBottom: getHeightEquivalent(16) }}
    />
    {/* Bar chart skeleton */}
    <View style={skeletonStyles.barsContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
        <SkeletonLoader
          key={index}
          width={getWidthEquivalent(22)}
          height={Math.random() * 120 + 40}
          borderRadius={6}
          style={{ marginHorizontal: getWidthEquivalent(8) }}
        />
      ))}
    </View>
    {/* Legend skeleton */}
    <View style={skeletonStyles.legendContainer}>
      <SkeletonLoader width={70} height={12} />
      <SkeletonLoader width={65} height={12} />
    </View>
  </View>
);

export const ActivitySkeleton = () => (
  <View style={skeletonStyles.activityContainer}>
    {[1, 2, 3, 4].map((_, index) => (
      <View key={index} style={skeletonStyles.activityCard}>
        <View style={skeletonStyles.activityDateColumn}>
          <SkeletonLoader
            width={getWidthEquivalent(40)}
            height={24}
            borderRadius={6}
          />
          <SkeletonLoader
            width={getWidthEquivalent(35)}
            height={14}
            style={{ marginTop: getHeightEquivalent(4) }}
          />
        </View>
        <View style={skeletonStyles.activityContentColumn}>
          <SkeletonLoader
            width="40%"
            height={16}
            style={{ marginBottom: getHeightEquivalent(4) }}
          />
          <SkeletonLoader
            width="25%"
            height={14}
            style={{ marginBottom: getHeightEquivalent(4) }}
          />
          <SkeletonLoader
            width="75%"
            height={16}
            style={{ marginBottom: getHeightEquivalent(4) }}
          />
          <SkeletonLoader
            width="65%"
            height={14}
            style={{ marginBottom: getHeightEquivalent(8) }}
          />
          {/* Status indicator skeleton */}
          <View style={skeletonStyles.statusContainer}>
            <SkeletonLoader width={60} height={20} borderRadius={10} />
            <SkeletonLoader width={24} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

export const TableSkeleton = () => (
  <View style={skeletonStyles.tableContainer}>
    {/* Table header skeleton */}
    <View
      style={[skeletonStyles.tableRow, { backgroundColor: colors.gray[100] }]}
    >
      <SkeletonLoader width="45%" height={16} />
      <SkeletonLoader width="20%" height={16} />
      <SkeletonLoader width="20%" height={16} />
    </View>
    {/* Table data rows skeleton */}
    {[1, 2, 3, 4, 5].map((_, index) => (
      <View key={index} style={skeletonStyles.tableRow}>
        <SkeletonLoader width="50%" height={16} />
        <SkeletonLoader width="18%" height={16} />
        <SkeletonLoader width="22%" height={16} />
      </View>
    ))}
  </View>
);

export const PieChartSkeleton = () => (
  <View style={skeletonStyles.pieChartContainer}>
    {/* Title skeleton */}
    <SkeletonLoader
      width="60%"
      height={18}
      style={{ marginBottom: getHeightEquivalent(16) }}
    />
    {/* Pie chart circle skeleton */}
    <View style={skeletonStyles.pieChartCircleContainer}>
      <SkeletonLoader
        width={getWidthEquivalent(140)}
        height={getWidthEquivalent(140)}
        borderRadius={getWidthEquivalent(70)}
      />
    </View>
    {/* Legend skeleton */}
    <View style={skeletonStyles.pieChartLegend}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={skeletonStyles.pieChartLegendItem}>
          <SkeletonLoader
            width={12}
            height={12}
            borderRadius={2}
            style={{ marginRight: getWidthEquivalent(8) }}
          />
          <SkeletonLoader width="40%" height={14} />
          <SkeletonLoader width="25%" height={14} />
        </View>
      ))}
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  lineGraphContainer: {
    padding: getWidthEquivalent(16),
  },
  barGraphContainer: {
    padding: getWidthEquivalent(16),
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: getHeightEquivalent(170),
    marginVertical: getHeightEquivalent(16),
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(20),
  },
  activityContainer: {
    paddingHorizontal: getWidthEquivalent(16),
  },
  activityCard: {
    flexDirection: "row",
    paddingVertical: getHeightEquivalent(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  activityDateColumn: {
    width: "20%",
    alignItems: "center",
    paddingRight: getWidthEquivalent(16),
  },
  activityContentColumn: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: getHeightEquivalent(8),
  },
  tableContainer: {
    paddingHorizontal: getWidthEquivalent(16),
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  pieChartContainer: {
    padding: getWidthEquivalent(16),
    alignItems: "center",
  },
  pieChartCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: getHeightEquivalent(16),
  },
  pieChartLegend: {
    width: "100%",
    marginTop: getHeightEquivalent(16),
  },
  pieChartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    gap: getWidthEquivalent(8),
  },
});

export default SkeletonLoader;
