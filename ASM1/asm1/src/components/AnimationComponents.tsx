/**
 * Animation Components
 * Các thành phần hoạt ảnh mượt mà sử dụng Reanimated
 */

import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    SlideInDown,
    SlideInRight,
    SlideOutLeft,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

/**
 * FadeInView - Component với hiệu ứng fade in
 */
export const FadeInView: React.FC<{
  children: ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 500 }) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(duration)}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
};

/**
 * SlideInView - Component với hiệu ứng slide in từ dưới
 */
export const SlideInView: React.FC<{
  children: ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 500 }) => {
  return (
    <Animated.View
      entering={SlideInDown.delay(delay).duration(duration).springify()}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
};

/**
 * ScaleInView - Component với hiệu ứng phóng to
 */
export const ScaleInView: React.FC<{
  children: ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 400 }) => {
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(duration)}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
};

/**
 * AnimatedCard - Card với hiệu ứng chuyển động
 */
export const AnimatedCard: React.FC<{
  children: ReactNode;
  onPress?: () => void;
  delay?: number;
}> = ({ children, onPress, delay = 0 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(delay).duration(400)}
      style={[animatedStyle]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {children}
    </Animated.View>
  );
};

/**
 * AnimatedButton - Button với hiệu ứng chuyển động
 */
export const AnimatedButton: React.FC<{
  children: ReactNode;
  onPress?: () => void;
  style?: any;
}> = ({ children, onPress, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.92, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
    onPress?.();
  };

  return (
    <Animated.View
      style={[animatedStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {children}
    </Animated.View>
  );
};

/**
 * FadingText - Text với fade in effect
 */
export const FadingText: React.FC<{
  text: string;
  delay?: number;
  style?: any;
}> = ({ text, delay = 0, style }) => {
  return (
    <Animated.Text entering={FadeIn.delay(delay).duration(400)} style={style}>
      {text}
    </Animated.Text>
  );
};

/**
 * ListItemAnimation - Animation cho list item
 */
export const ListItemAnimation: React.FC<{
  children: ReactNode;
  index: number;
}> = ({ children, index }) => {
  return (
    <Animated.View
      entering={SlideInDown.delay(index * 50).duration(300).springify()}
      exiting={SlideOutLeft.duration(200)}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
