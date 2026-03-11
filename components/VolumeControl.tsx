import { View, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, sizes } from '@/constants/theme';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const iconName = isMuted || volume === 0
    ? 'volume-mute'
    : volume < 0.5
      ? 'volume-low'
      : 'volume-high';

  return (
    <View style={styles.container}>
      <Pressable onPress={onMuteToggle} hitSlop={8} style={styles.iconButton}>
        <Ionicons name={iconName} size={22} color={colors.textSecondary} />
      </Pressable>
      <Slider
        style={styles.slider}
        value={isMuted ? 0 : volume}
        onValueChange={onVolumeChange}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.glassBorder}
        thumbTintColor={colors.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconButton: {
    width: sizes.actionButton,
    height: sizes.actionButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
