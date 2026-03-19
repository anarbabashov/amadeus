import { View, StyleSheet, Pressable, Share, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, glass, spacing, sizes } from '@/constants/theme';
import { CONFIG } from '@/constants/config';

interface ActionBarProps {
  isMuted: boolean;
  onMuteToggle: () => void;
}

async function handleShare() {
  try {
    await Share.share({
      title: 'BonnyTone Radio',
      message: CONFIG.SHARE_MESSAGE,
      url: CONFIG.SHARE_URL,
    });
  } catch (error) {
    console.warn('[Share] Failed:', error);
  }
}

async function handleOpenWeb() {
  try {
    await Linking.openURL(CONFIG.SHARE_URL);
  } catch (error) {
    console.warn('[Link] Failed:', error);
  }
}

export default function ActionBar({ isMuted, onMuteToggle }: ActionBarProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMuteToggle}
        style={styles.circleButton}
        hitSlop={8}
        testID="mute-button"
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
      <Pressable
        onPress={handleOpenWeb}
        style={styles.circleButton}
        hitSlop={8}
        testID="web-button"
      >
        <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        onPress={handleShare}
        style={styles.circleButton}
        hitSlop={8}
        testID="share-button"
      >
        <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 20,
  },
  circleButton: {
    width: sizes.actionButtonCircle,
    height: sizes.actionButtonCircle,
    borderRadius: sizes.actionButtonCircle / 2,
    backgroundColor: glass.background,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
