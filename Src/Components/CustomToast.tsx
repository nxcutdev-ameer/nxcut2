import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ColorValue,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface CustomToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  visible,
  onHide,
  duration = 3000,
  type = 'info',
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const slideAnimValueRef = useRef(-100);

  useEffect(() => {
    const listenerId = slideAnim.addListener(({ value }: { value: number }) => {
      slideAnimValueRef.current = value;
    });

    return () => {
      slideAnim.removeListener(listenerId);
    };
  }, [slideAnim]);

  const getGradientColors = (): [ColorValue, ColorValue, ColorValue] => {
    switch (type) {
      case 'success':
        return ['#4CAF50', '#45a049', '#2E7D32'];
      case 'warning':
        return ['#FF9800', '#F57C00', '#E65100'];
      case 'error':
        return ['#F44336', '#D32F2F', '#B71C1C'];
      default: // info
        return ['#2196F3', '#1976D2', '#0D47A1'];
    }
  };

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: getHeightEquivalent(60),
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timeout = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset gesture animations
      panAnim.setValue(0);
      translateY.setValue(0);
      if (onHide) onHide();
    });
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: panAnim,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

      // Dismiss thresholds
      const dismissThreshold = 100;
      const velocityThreshold = 500;

      // Check if swipe up (negative Y) or swipe left/right (abs X)
      const shouldDismiss =
        Math.abs(translationX) > dismissThreshold ||
        translationY < -dismissThreshold ||
        Math.abs(velocityX) > velocityThreshold ||
        velocityY < -velocityThreshold;

      if (shouldDismiss) {
        // Add slight haptic feedback for swipe dismiss
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        hideToast();
      } else {
        // Snap back to original position
        Animated.parallel([
          Animated.spring(panAnim, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  if (!visible && slideAnimValueRef.current === -100) {
    return null;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: Animated.add(slideAnim, translateY)
              },
              { translateX: panAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.message}>{message}</Text>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: getWidthEquivalent(20),
    right: getWidthEquivalent(20),
    zIndex: 9999,
  },
  gradient: {
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(20),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: fontEq(16),
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CustomToast;