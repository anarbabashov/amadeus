import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, glass, spacing, sizes, typography } from '@/constants/theme';
import { CONFIG } from '@/constants/config';

interface ActionBarProps {
  onShare?: () => void;
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

export default function ActionBar({ onShare }: ActionBarProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onShare ?? handleShare}
        style={styles.button}
        hitSlop={8}
      >
        <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.label}>Share</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: glass.background,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: sizes.actionButton,
    minHeight: sizes.actionButton,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
});
