import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '@/hooks/usePlayer';
import { useNowPlaying } from '@/hooks/useNowPlaying';
import { usePlayerStore } from '@/store/playerStore';
import PlayerBackground from '@/components/PlayerBackground';
import Header from '@/components/Header';
import NowPlaying from '@/components/NowPlaying';
import PlayButton from '@/components/PlayButton';
import VolumeControl from '@/components/VolumeControl';
import StreamStatus from '@/components/StreamStatus';
import ActionBar from '@/components/ActionBar';
import { colors, spacing, glass } from '@/constants/theme';

export default function PlayerScreen() {
  const {
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    streamStatus,
    togglePlayPause,
    setVolume,
    toggleMute,
  } = usePlayer();

  const { title, artist, artworkUrl, isLive, listenerCount } = useNowPlaying();
  const errorCount = usePlayerStore((s) => s.errorCount);
  const play = usePlayerStore((s) => s.play);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PlayerBackground isPlaying={isPlaying} />

      <Header />

      <View style={styles.content}>
        <StreamStatus
          isLive={isLive}
          listenerCount={listenerCount}
          streamStatus={streamStatus}
          errorCount={errorCount}
        />

        <NowPlaying
          artworkUrl={artworkUrl}
          title={title}
          artist={artist}
        />

        <PlayButton
          isPlaying={isPlaying}
          isBuffering={isBuffering || streamStatus === 'connecting'}
          onPress={togglePlayPause}
        />

        {streamStatus === 'offline' && (
          <Pressable onPress={play} style={styles.retryButton}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </Pressable>
        )}

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
        />

        <ActionBar />
      </View>

      <View style={{ height: insets.bottom + spacing.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  retryButton: {
    backgroundColor: glass.background,
    borderWidth: glass.borderWidth,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
