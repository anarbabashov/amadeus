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
  const displayVolume = isMuted ? 0 : volume;

  const leftIcon = isMuted || volume === 0
    ? 'volume-mute'
    : 'volume-low';

  const handleVolumeChange = (value: number) => {
    if (isMuted && value > 0) {
      onMuteToggle();
    }
    onVolumeChange(value);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onMuteToggle} hitSlop={8} style={styles.iconButton}>
        <Ionicons name={leftIcon} size={22} color={colors.textSecondary} />
      </Pressable>
      <Slider
        style={styles.slider}
        value={displayVolume}
        onValueChange={handleVolumeChange}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.glassBorder}
        thumbTintColor={colors.text}
      />
      <View style={styles.iconButton}>
        <Ionicons name="volume-high" size={22} color={colors.textSecondary} />
      </View>
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
