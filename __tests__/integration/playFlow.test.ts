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

let statusCallback: ((status: any) => void) | null = null;

beforeEach(() => {
  statusCallback = null;
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

  (Audio.Sound.createAsync as jest.Mock).mockImplementation(
    async (_source: any, _options: any, onStatusUpdate: any) => {
      statusCallback = onStatusUpdate;
      return { sound: mockSound, status: { isLoaded: true } };
    }
  );
});

afterEach(async () => {
  await audioService.destroy();
});

describe('Play Flow Integration', () => {
  it('transitions from idle → connecting → live', async () => {
    await audioService.initialize();

    expect(usePlayerStore.getState().streamStatus).toBe('idle');

    // Start playing
    await audioService.play();
    expect(usePlayerStore.getState().streamStatus).toBe('connecting');

    // Simulate playback starting
    expect(statusCallback).not.toBeNull();
    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });

    expect(usePlayerStore.getState().isPlaying).toBe(true);
    expect(usePlayerStore.getState().streamStatus).toBe('live');
  });

  it('transitions through buffering correctly', async () => {
    await audioService.initialize();
    await audioService.play();

    // Start playing
    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });
    expect(usePlayerStore.getState().streamStatus).toBe('live');

    // HLS micro-buffer: isBuffering=true is ignored (early return), state unchanged
    statusCallback!({ isLoaded: true, isPlaying: false, isBuffering: true });
    expect(usePlayerStore.getState().streamStatus).toBe('live');

    // Exit buffering
    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });
    expect(usePlayerStore.getState().isBuffering).toBe(false);
    expect(usePlayerStore.getState().streamStatus).toBe('live');
  });

  it('handles playback errors and increments error count', async () => {
    await audioService.initialize();
    await audioService.play();

    statusCallback!({ isLoaded: false, error: 'Network failure' });

    expect(usePlayerStore.getState().lastError).toBe('Network failure');
    expect(usePlayerStore.getState().errorCount).toBe(1);
  });

  it('resets error count on successful playback after errors', async () => {
    await audioService.initialize();
    await audioService.play();

    // Simulate error
    usePlayerStore.setState({ errorCount: 3 });

    // Playback resumes
    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });

    expect(usePlayerStore.getState().errorCount).toBe(0);
    expect(usePlayerStore.getState().streamStatus).toBe('live');
  });

  it('pause cancels reconnect timers but keeps stream status', async () => {
    await audioService.initialize();
    await audioService.play();

    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });
    expect(usePlayerStore.getState().streamStatus).toBe('live');

    await audioService.pause();

    expect(usePlayerStore.getState().isPlaying).toBe(false);
    // Stream status stays 'live' — reflects stream state, not play/pause
    expect(usePlayerStore.getState().streamStatus).toBe('live');
    expect(mockSound.pauseAsync).toHaveBeenCalled();
  });

  it('destroy cleans up all state', async () => {
    await audioService.initialize();
    await audioService.play();

    statusCallback!({ isLoaded: true, isPlaying: true, isBuffering: false });

    await audioService.destroy();

    const state = usePlayerStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.isBuffering).toBe(false);
    expect(state.streamStatus).toBe('idle');
    expect(state.errorCount).toBe(0);
  });
});
