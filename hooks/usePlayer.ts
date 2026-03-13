import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { audioService } from '@/services/audioService';

export function usePlayer() {
  const initialized = useRef(false);
  const destroyed = useRef(false);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const streamStatus = usePlayerStore((s) => s.streamStatus);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      destroyed.current = false;
      audioService.initialize();
      usePlayerStore.getState().hydrateVolume();
    }

    return () => {
      if (!destroyed.current) {
        destroyed.current = true;
        initialized.current = false;
        audioService.destroy();
      }
    };
  }, []);

  return {
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    streamStatus,
    togglePlayPause,
    setVolume,
    toggleMute,
  };
}
