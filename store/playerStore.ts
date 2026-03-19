import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioService } from '@/services/audioService';
import type { StreamStatus, StreamQuality, TrackMetadata } from '@/types/player';

const VOLUME_STORAGE_KEY = '@bonnytone/volume';
const MAX_ERROR_COUNT = 10;

export interface PlayerState {
  // Playback
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  previousVolume: number;
  streamQuality: StreamQuality;
  streamStatus: StreamStatus;

  // Metadata
  nowPlaying: TrackMetadata | null;
  isLive: boolean;
  listenerCount: number | null;
  currentBitrate: number | null;

  // Error tracking
  errorCount: number;
  lastError: string | null;

  // Actions — playback
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setStreamQuality: (quality: StreamQuality) => void;

  // Actions — state setters (called by audio service)
  setIsPlaying: (isPlaying: boolean) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  setStreamStatus: (status: StreamStatus) => void;
  setNowPlaying: (info: TrackMetadata | null) => void;
  setIsLive: (isLive: boolean) => void;
  setListenerCount: (count: number | null) => void;
  setCurrentBitrate: (bitrate: number | null) => void;

  // Actions — error management
  setError: (error: string | null) => void;
  incrementErrorCount: () => void;
  resetErrorCount: () => void;

  // Actions — persistence
  hydrateVolume: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  isPlaying: false,
  isBuffering: false,
  volume: 0.8,
  isMuted: false,
  previousVolume: 0.8,
  streamQuality: 'medium',
  streamStatus: 'idle',
  nowPlaying: null,
  isLive: false,
  listenerCount: null,
  currentBitrate: null,
  errorCount: 0,
  lastError: null,

  // Playback actions
  play: () => {
    set({ streamStatus: 'connecting', lastError: null });
    audioService.play();
  },

  pause: () => {
    audioService.pause();
  },

  togglePlayPause: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  setVolume: (volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    audioService.setVolume(clamped).catch((error) => {
      console.error('[Store] Failed to sync volume to audio service:', error);
    });
    AsyncStorage.setItem(VOLUME_STORAGE_KEY, String(clamped)).catch(() => {});
  },

  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    if (isMuted) {
      // Restore previous volume, but ensure it's audible
      const restoreVolume = previousVolume > 0 ? previousVolume : 0.8;
      set({ isMuted: false, volume: restoreVolume });
      audioService.setVolume(restoreVolume);
    } else {
      // Only save previousVolume if it's > 0 (don't save zero as "previous")
      set({ isMuted: true, previousVolume: volume > 0 ? volume : previousVolume, volume: 0 });
      audioService.setVolume(0);
    }
  },

  setStreamQuality: (quality: StreamQuality) => {
    set({ streamQuality: quality });
  },

  // State setters
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsBuffering: (isBuffering: boolean) => set({ isBuffering }),
  setStreamStatus: (status: StreamStatus) => set({ streamStatus: status }),
  setNowPlaying: (info: TrackMetadata | null) => set({ nowPlaying: info }),
  setIsLive: (isLive: boolean) => set({ isLive }),
  setListenerCount: (count: number | null) => set({ listenerCount: count }),
  setCurrentBitrate: (bitrate: number | null) => set({ currentBitrate: bitrate }),

  // Error management
  setError: (error: string | null) => {
    set({ lastError: error });
    if (error !== null) {
      set({ streamStatus: 'error' });
    }
  },

  incrementErrorCount: () => {
    const next = get().errorCount + 1;
    set({ errorCount: next });
    if (next >= MAX_ERROR_COUNT) {
      set({ streamStatus: 'offline', isPlaying: false, isBuffering: false });
    }
  },

  resetErrorCount: () => set({ errorCount: 0 }),

  // Persistence
  hydrateVolume: async () => {
    try {
      const stored = await AsyncStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          set({ volume: parsed, previousVolume: parsed });
        }
      }
    } catch {
      // Fall back to default volume
    }
  },
}));
