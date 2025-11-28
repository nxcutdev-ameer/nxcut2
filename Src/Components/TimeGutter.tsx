import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  getWidthEquivalent,
  getHeightEquivalent,
  fontEq,
} from "../Utils/helpers";
import { colors } from "../Constants/colors";

interface TimeGutterProps {
  minHour: number;
  maxHour: number;
  hourHeight: number;
}

const TimeGutter: React.FC<TimeGutterProps> = ({ 
  minHour, 
  maxHour, 
  hourHeight,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const hours = [];
  for (let hour = minHour; hour <= maxHour; hour++) {
    hours.push(hour);
  }

  const formatHour = (hour: number) => {
    let time = "";
    let period = "";
    
    if (hour === 0) {
      time = "12:00";
      period = "am";
    } else if (hour === 12) {
      time = "12:00";
      period = "pm";
    } else if (hour < 12) {
      time = `${hour}:00`;
      period = "am";
    } else {
      time = `${hour - 12}:00`;
      period = "pm";
    }
    
    return { time, period };
  };

  // Calculate current time position
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const minutesFromStart = (currentHour - minHour) * 60 + currentMinute;
  const currentTimePosition = (minutesFromStart / 60) * hourHeight;
  const isWithinRange = currentHour >= minHour && currentHour <= maxHour;

  return (
    <View style={styles.container}>
      {/* Time labels */}
      {hours.map((hour, index) => {
        const { time, period } = formatHour(hour);
        return (
          <View key={hour} style={[styles.timeSlot, { height: hourHeight }]}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={styles.periodWrapper}>
              <Text style={styles.periodText}>{period}</Text>
            </View>
          </View>
        );
      })}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: getWidthEquivalent(40),
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  timeSlot: {
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    marginTop: getHeightEquivalent(-2),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: fontEq(12),
    color: colors.black,
    fontWeight: "700",
    textAlign: "center",
    marginRight: getWidthEquivalent(2),
  },
  periodText: {
    fontSize: fontEq(10),
    color: colors.black,
    fontWeight: "400",
    textAlign: "center",
  },
  periodWrapper:{
    flexDirection:"row",
    justifyContent:"flex-end",
    width:"80%",
  },
});

export default TimeGutter;
