import { Audio } from 'expo-av';
import { audioService } from '@/services/audioService';
import { usePlayerStore } from '@/store/playerStore';

const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  pauseAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
};

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

  (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
    sound: mockSound,
    status: { isLoaded: true },
  });
});

afterEach(async () => {
  await audioService.destroy();
});

describe('audioService', () => {
  describe('initialize()', () => {
    it('configures audio mode for background playback', async () => {
      await audioService.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        })
      );
    });
  });

  describe('play()', () => {
    it('creates a sound instance with the HLS stream URL', async () => {
      await audioService.initialize();
      await audioService.play();

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: 'https://bonnytone.com/stream/hls/btradio/live.m3u8' },
        expect.objectContaining({ shouldPlay: true }),
        expect.any(Function)
      );
    });

    it('sets volume from store state', async () => {
      usePlayerStore.setState({ volume: 0.5, isMuted: false });
      await audioService.initialize();
      await audioService.play();

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ volume: 0.5, shouldPlay: true }),
        expect.any(Function)
      );
    });

    it('sets volume to 0 when muted', async () => {
      usePlayerStore.setState({ volume: 0.5, isMuted: true });
      await audioService.initialize();
      await audioService.play();

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ volume: 0, shouldPlay: true }),
        expect.any(Function)
      );
    });
  });

  describe('pause()', () => {
    it('sets isPlaying to false and status to idle', async () => {
      await audioService.initialize();
      await audioService.play();
      await audioService.pause();

      expect(usePlayerStore.getState().isPlaying).toBe(false);
      expect(usePlayerStore.getState().streamStatus).toBe('idle');
    });

    it('calls pauseAsync on the sound instance', async () => {
      await audioService.initialize();
      await audioService.play();
      await audioService.pause();

      expect(mockSound.pauseAsync).toHaveBeenCalled();
    });
  });

  describe('setVolume()', () => {
    it('sets volume on the sound instance', async () => {
      await audioService.initialize();
      await audioService.play();
      await audioService.setVolume(0.3);

      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.3);
    });
  });

  describe('destroy()', () => {
    it('resets store state', async () => {
      usePlayerStore.setState({
        isPlaying: true,
        streamStatus: 'live',
        errorCount: 5,
      });

      await audioService.destroy();

      expect(usePlayerStore.getState().isPlaying).toBe(false);
      expect(usePlayerStore.getState().streamStatus).toBe('idle');
      expect(usePlayerStore.getState().errorCount).toBe(0);
    });
  });
});
