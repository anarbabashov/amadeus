import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { metadataService } from '@/services/metadataService';

export function useNowPlaying() {
  const nowPlaying = usePlayerStore((s) => s.nowPlaying);
  const isLive = usePlayerStore((s) => s.isLive);
  const listenerCount = usePlayerStore((s) => s.listenerCount);

  useEffect(() => {
    metadataService.startPolling();
    return () => {
      metadataService.stopPolling();
    };
  }, []);

  return {
    title: nowPlaying?.title ?? 'BonnyTone Radio',
    artist: nowPlaying?.artist ?? '',
    artworkUrl: nowPlaying?.artworkUrl ?? null,
    isLive,
    listenerCount,
  };
}
