import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface PlayerBackgroundProps {
  isPlaying: boolean;
}

export default function PlayerBackground({ isPlaying }: PlayerBackgroundProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      progress.value = withRepeat(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      progress.value = withTiming(0, { duration: 2000 });
    }
  }, [isPlaying, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.8 + progress.value * 0.2,
    };
  });

  return (
    <AnimatedGradient
      colors={[colors.backgroundStart, '#0d1117', colors.backgroundEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
