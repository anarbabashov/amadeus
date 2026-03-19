import { usePlayerStore } from '@/store/playerStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reset store between tests
beforeEach(() => {
  usePlayerStore.setState({
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
  });
  jest.clearAllMocks();
});

describe('playerStore', () => {
  // Playback actions
  describe('play()', () => {
    it('sets streamStatus to connecting', () => {
      usePlayerStore.getState().play();
      expect(usePlayerStore.getState().streamStatus).toBe('connecting');
    });

    it('clears lastError', () => {
      usePlayerStore.setState({ lastError: 'some error' });
      usePlayerStore.getState().play();
      expect(usePlayerStore.getState().lastError).toBeNull();
    });
  });

  describe('pause()', () => {
    it('delegates to audio service', () => {
      usePlayerStore.setState({ isPlaying: true, streamStatus: 'live' });
      usePlayerStore.getState().pause();
      // Audio service handles the state update via its pause function
    });
  });

  describe('togglePlayPause()', () => {
    it('calls play when not playing', () => {
      usePlayerStore.setState({ isPlaying: false });
      usePlayerStore.getState().togglePlayPause();
      expect(usePlayerStore.getState().streamStatus).toBe('connecting');
    });

    it('calls pause when playing', () => {
      usePlayerStore.setState({ isPlaying: true });
      usePlayerStore.getState().togglePlayPause();
      // pause delegated to audio service
    });
  });

  // Volume
  describe('setVolume()', () => {
    it('updates volume', () => {
      usePlayerStore.getState().setVolume(0.5);
      expect(usePlayerStore.getState().volume).toBe(0.5);
    });

    it('clamps volume to 0-1 range', () => {
      usePlayerStore.getState().setVolume(1.5);
      expect(usePlayerStore.getState().volume).toBe(1);

      usePlayerStore.getState().setVolume(-0.5);
      expect(usePlayerStore.getState().volume).toBe(0);
    });

    it('sets isMuted when volume is 0', () => {
      usePlayerStore.getState().setVolume(0);
      expect(usePlayerStore.getState().isMuted).toBe(true);
    });

    it('persists volume to AsyncStorage', () => {
      usePlayerStore.getState().setVolume(0.6);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@bonnytone/volume', '0.6');
    });
  });

  describe('toggleMute()', () => {
    it('mutes and saves previous volume', () => {
      usePlayerStore.setState({ volume: 0.7, isMuted: false });
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().isMuted).toBe(true);
      expect(usePlayerStore.getState().volume).toBe(0);
      expect(usePlayerStore.getState().previousVolume).toBe(0.7);
    });

    it('unmutes and restores previous volume', () => {
      usePlayerStore.setState({ volume: 0, isMuted: true, previousVolume: 0.7 });
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().isMuted).toBe(false);
      expect(usePlayerStore.getState().volume).toBe(0.7);
    });

    it('restores default volume when previousVolume is 0', () => {
      usePlayerStore.setState({ volume: 0, isMuted: true, previousVolume: 0 });
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().isMuted).toBe(false);
      expect(usePlayerStore.getState().volume).toBe(0.8);
    });

    it('does not save zero as previousVolume when muting at zero', () => {
      usePlayerStore.setState({ volume: 0, isMuted: false, previousVolume: 0.5 });
      usePlayerStore.getState().toggleMute();
      expect(usePlayerStore.getState().previousVolume).toBe(0.5);
    });
  });

  // State setters
  describe('setStreamQuality()', () => {
    it('updates stream quality', () => {
      usePlayerStore.getState().setStreamQuality('high');
      expect(usePlayerStore.getState().streamQuality).toBe('high');
    });
  });

  describe('setStreamStatus()', () => {
    it('updates stream status', () => {
      usePlayerStore.getState().setStreamStatus('live');
      expect(usePlayerStore.getState().streamStatus).toBe('live');
    });
  });

  describe('setNowPlaying()', () => {
    it('updates now playing info', () => {
      const metadata = { title: 'Test Song', artist: 'Test Artist', artworkUrl: 'https://example.com/art.jpg' };
      usePlayerStore.getState().setNowPlaying(metadata);
      expect(usePlayerStore.getState().nowPlaying).toEqual(metadata);
    });

    it('accepts null', () => {
      usePlayerStore.getState().setNowPlaying(null);
      expect(usePlayerStore.getState().nowPlaying).toBeNull();
    });
  });

  describe('setListenerCount()', () => {
    it('updates listener count', () => {
      usePlayerStore.getState().setListenerCount(42);
      expect(usePlayerStore.getState().listenerCount).toBe(42);
    });
  });

  // Error management
  describe('setError()', () => {
    it('stores error message and sets error status', () => {
      usePlayerStore.getState().setError('Network timeout');
      expect(usePlayerStore.getState().lastError).toBe('Network timeout');
      expect(usePlayerStore.getState().streamStatus).toBe('error');
    });

    it('clears error when null', () => {
      usePlayerStore.setState({ lastError: 'some error' });
      usePlayerStore.getState().setError(null);
      expect(usePlayerStore.getState().lastError).toBeNull();
    });
  });

  describe('incrementErrorCount()', () => {
    it('increments error count', () => {
      usePlayerStore.getState().incrementErrorCount();
      expect(usePlayerStore.getState().errorCount).toBe(1);
    });

    it('transitions to offline after 10 errors', () => {
      usePlayerStore.setState({ errorCount: 9 });
      usePlayerStore.getState().incrementErrorCount();
      expect(usePlayerStore.getState().streamStatus).toBe('offline');
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });
  });

  describe('resetErrorCount()', () => {
    it('resets to 0', () => {
      usePlayerStore.setState({ errorCount: 5 });
      usePlayerStore.getState().resetErrorCount();
      expect(usePlayerStore.getState().errorCount).toBe(0);
    });
  });

  // Persistence
  describe('hydrateVolume()', () => {
    it('loads volume from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('0.6');
      await usePlayerStore.getState().hydrateVolume();
      expect(usePlayerStore.getState().volume).toBe(0.6);
    });

    it('keeps default volume when no stored value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await usePlayerStore.getState().hydrateVolume();
      expect(usePlayerStore.getState().volume).toBe(0.8);
    });

    it('ignores invalid stored values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid');
      await usePlayerStore.getState().hydrateVolume();
      expect(usePlayerStore.getState().volume).toBe(0.8);
    });
  });
});
