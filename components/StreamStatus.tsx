import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/constants/theme';
import type { StreamStatus as StreamStatusType } from '@/types/player';

interface StreamStatusProps {
  isLive: boolean;
  listenerCount: number | null;
  streamStatus: StreamStatusType;
  errorCount?: number;
}

export default function StreamStatus({
  isLive,
  listenerCount,
  streamStatus,
  errorCount = 0,
}: StreamStatusProps) {
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    if (isLive && streamStatus === 'live') {
      dotOpacity.value = withRepeat(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      dotOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isLive, streamStatus, dotOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const getStatusText = (): string => {
    switch (streamStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'buffering':
        return 'Buffering...';
      case 'error':
        return `Reconnecting (${errorCount}/10)...`;
      case 'offline':
        return 'Offline';
      case 'live':
        return '';
      default:
        return '';
    }
  };

  const statusText = getStatusText();

  return (
    <View style={styles.container}>
      {streamStatus === 'live' && isLive && (
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, dotStyle]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
      {listenerCount !== null && streamStatus === 'live' && (
        <Text style={styles.listeners}>
          {listenerCount.toLocaleString()} listening
        </Text>
      )}
      {statusText !== '' && (
        <Text style={styles.statusText}>{statusText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 24,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.liveBadge,
  },
  liveText: {
    color: colors.liveBadge,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listeners: {
    color: colors.textTertiary,
    fontSize: typography.caption.fontSize,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
});
