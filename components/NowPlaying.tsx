import { useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizes, glass } from '@/constants/theme';

interface NowPlayingProps {
  artworkUrl: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  onPlayPress: () => void;
}

const PLAY_ICON_SIZE = 79;
// Pause bars dimensions (matching web screenshot — two rounded rectangles)
const PAUSE_BAR_WIDTH = 18;
const PAUSE_BAR_HEIGHT = 64;
const PAUSE_BAR_GAP = 16;
const PAUSE_BAR_RADIUS = 6;

function PauseIcon() {
  return (
    <View style={pauseStyles.container} testID="icon-pause">
      <View style={pauseStyles.bar} />
      <View style={pauseStyles.bar} />
    </View>
  );
}

const pauseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PAUSE_BAR_GAP,
  },
  bar: {
    width: PAUSE_BAR_WIDTH,
    height: PAUSE_BAR_HEIGHT,
    borderRadius: PAUSE_BAR_RADIUS,
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default function NowPlaying({
  artworkUrl,
  isPlaying,
  isBuffering,
  onPlayPress,
}: NowPlayingProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const handleLoadEnd = useCallback(() => setImageLoading(false), []);
  const handleError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  useEffect(() => {
    if (isPlaying && !isBuffering) {
      pulseScale.value = withRepeat(
        withTiming(1.15, { duration: 1500, easing: Easing.out(Easing.ease) }),
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
    pressScale.value = withSpring(0.95);
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1);
  };

  const showPlaceholder = !artworkUrl || imageError;

  return (
    <View style={styles.container}>
      {/* Pulse ring behind artwork */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      <View style={styles.artworkContainer}>
        {showPlaceholder ? (
          <View style={styles.artworkPlaceholder}>
            <Ionicons name="musical-notes" size={64} color={colors.textTertiary} />
          </View>
        ) : (
          <>
            {imageLoading && (
              <View style={[styles.artworkPlaceholder, StyleSheet.absoluteFill]}>
                <ActivityIndicator size="large" color={colors.textTertiary} />
              </View>
            )}
            <Image
              source={{ uri: artworkUrl }}
              style={styles.artwork}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
            />
          </>
        )}

        {/* Play/pause overlay — fills entire artwork circle */}
        <Animated.View style={[styles.overlayContainer, buttonAnimStyle]}>
          <Pressable
            onPress={onPlayPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.pressable}
            testID="play-overlay"
          >
            {/* Blur background only when paused */}
            {!isPlaying && (
              <BlurView
                intensity={30}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )}

            {/* Semi-transparent dark overlay when paused for contrast */}
            {!isPlaying && <View style={styles.darkOverlay} />}

            {isPlaying ? (
              <PauseIcon />
            ) : (
              <Ionicons
                name="play"
                size={PLAY_ICON_SIZE}
                color={colors.text}
                style={styles.playIcon}
              />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: sizes.artwork,
    height: sizes.artwork,
    borderRadius: sizes.artworkRadius,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  artworkContainer: {
    width: sizes.artwork,
    height: sizes.artwork,
    borderRadius: sizes.artworkRadius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: glass.background,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    borderRadius: sizes.artworkRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizes.artworkRadius,
    overflow: 'hidden',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    marginLeft: 8,
  },
});
