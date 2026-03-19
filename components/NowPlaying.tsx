import { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, sizes, glass } from '@/constants/theme';

interface NowPlayingProps {
  artworkUrl: string | null;
  title: string;
  artist: string;
}

export default function NowPlaying({ artworkUrl, title, artist }: NowPlayingProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleLoadEnd = useCallback(() => setImageLoading(false), []);
  const handleError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const showPlaceholder = !artworkUrl || imageError;

  return (
    <View style={styles.container}>
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
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {artist}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  artworkContainer: {
    width: sizes.artwork,
    height: sizes.artwork,
    borderRadius: sizes.artworkRadius,
    overflow: 'hidden',
    marginBottom: spacing.lg,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: typography.metadata.fontSize,
    fontWeight: typography.metadata.fontWeight,
    textAlign: 'center',
  },
});
