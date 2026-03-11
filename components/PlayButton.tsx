import { useEffect } from 'react';
import { StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, glass, sizes } from '@/constants/theme';

interface PlayButtonProps {
  isPlaying: boolean;
  isBuffering: boolean;
  onPress: () => void;
}

export default function PlayButton({ isPlaying, isBuffering, onPress }: PlayButtonProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (isPlaying && !isBuffering) {
      pulseScale.value = withRepeat(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      pulseOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying, isBuffering, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.pulseRing, pulseStyle]} />
      <Animated.View style={buttonAnimStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          {isBuffering ? (
            <ActivityIndicator size="large" color={colors.text} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={sizes.playButtonIcon}
              color={colors.text}
              style={isPlaying ? undefined : styles.playIcon}
            />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: sizes.playButton + 40,
    height: sizes.playButton + 40,
  },
  pulseRing: {
    position: 'absolute',
    width: sizes.playButton,
    height: sizes.playButton,
    borderRadius: sizes.playButton / 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  button: {
    width: sizes.playButton,
    height: sizes.playButton,
    borderRadius: sizes.playButton / 2,
    backgroundColor: glass.background,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 4, // Optical centering for play triangle
  },
});
