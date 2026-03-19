import { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing } from '@/constants/theme';
import type { StreamStatus as StreamStatusType } from '@/types/player';

interface StreamStatusProps {
  streamStatus: StreamStatusType;
  errorCount?: number;
  title?: string;
  artist?: string;
}

type Phase = 'visible' | 'exiting' | 'entering';
const DISPLAY_DURATION = 4000;
const TRANSITION_DURATION = 400;

export default function StreamStatus({
  streamStatus,
  errorCount = 0,
  title,
  artist,
}: StreamStatusProps) {
  // Ping animation
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0);

  // Rotating text state
  const [textIndex, setTextIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('visible');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLiveStream = streamStatus === 'live';
  const isError = streamStatus === 'error';
  const isPending = streamStatus === 'connecting';
  const isVisible = isLiveStream || isError || isPending || streamStatus === 'offline';

  // Build rotating text items
  const getTextItems = useCallback((): string[] => {
    if (isError) return ['ERROR'];
    if (streamStatus === 'offline') return ['OFFLINE'];
    if (isPending) return ['CONNECTING'];

    // Match web version: LIVE → Artist - Title → 24/7
    const items: string[] = ['LIVE'];
    if (title && artist) {
      items.push(`${artist} – ${title}`);
    } else if (title) {
      items.push(title);
    }
    items.push('24/7');
    return items;
  }, [isError, isPending, streamStatus, title, artist]);

  const textItems = getTextItems();
  const safeIndex = textIndex < textItems.length ? textIndex : 0;
  const currentText = textItems[safeIndex] ?? 'LIVE';

  // Ping animation on the green dot
  useEffect(() => {
    if (isLiveStream) {
      pingScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2.5, { duration: 1200, easing: Easing.out(Easing.ease) })
        ),
        -1
      );
      pingOpacity.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: 0 }),
          withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) })
        ),
        -1
      );
    } else if (isPending) {
      // Pulse for pending
      pingScale.value = withRepeat(
        withTiming(1.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      pingOpacity.value = withRepeat(
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pingScale.value = withTiming(1, { duration: 300 });
      pingOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isLiveStream, isPending, pingScale, pingOpacity]);

  // Text rotation cycle
  useEffect(() => {
    if (!isVisible || textItems.length <= 1) {
      setTextIndex(0);
      setPhase('visible');
      return;
    }

    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    if (phase === 'visible') {
      timerRef.current = setTimeout(() => {
        setPhase('exiting');
      }, DISPLAY_DURATION);
    } else if (phase === 'exiting') {
      timerRef.current = setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % textItems.length);
        setPhase('entering');
      }, TRANSITION_DURATION);
    } else if (phase === 'entering') {
      // Small delay then go visible
      timerRef.current = setTimeout(() => {
        setPhase('visible');
      }, 50);
    }

    return clear;
  }, [phase, isVisible, textItems.length]);

  // Reset index when items change
  useEffect(() => {
    setTextIndex(0);
    setPhase('visible');
  }, [textItems.length]);

  // Animated styles for rotating text
  const textAnimStyle = useAnimatedStyle(() => {
    if (phase === 'exiting') {
      return {
        opacity: withTiming(0, { duration: TRANSITION_DURATION }),
        transform: [{ translateX: withTiming(-30, { duration: TRANSITION_DURATION }) }],
      };
    }
    if (phase === 'entering') {
      return {
        opacity: 0,
        transform: [{ translateX: -20 }],
      };
    }
    // visible
    return {
      opacity: withTiming(1, { duration: TRANSITION_DURATION }),
      transform: [{ translateX: withTiming(0, { duration: TRANSITION_DURATION }) }],
    };
  });

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  if (!isVisible) return null;

  // Dot color
  const dotColor = isError
    ? '#ef4444'
    : isPending
      ? '#f97316'
      : '#22c55e';

  const pingColor = isError
    ? '#ef4444'
    : isPending
      ? '#fb923c'
      : '#4ade80';

  const textColor = isError
    ? '#f87171'
    : isPending
      ? '#fb923c'
      : colors.text;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.badgeContent}>
          {/* Dot with ping */}
          <View style={styles.dotContainer}>
            <Animated.View
              style={[
                styles.pingRing,
                { backgroundColor: pingColor },
                pingStyle,
              ]}
            />
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          </View>

          {/* Rotating text */}
          <Animated.Text
            style={[styles.label, { color: textColor }, textAnimStyle]}
            numberOfLines={1}
          >
            {currentText}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  dotContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pingRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    maxWidth: 220,
  },
});
