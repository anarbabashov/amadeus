import { metadataService } from '@/services/metadataService';
import { usePlayerStore } from '@/store/playerStore';

const mockResponse = {
  now_playing: {
    song: {
      title: 'Deep House Mix',
      artist: 'DJ Name',
      art: 'https://bonnytone.com/api/station/1/art/12345',
    },
  },
  listeners: {
    current: 42,
  },
  live: {
    is_live: true,
  },
};

beforeEach(() => {
  usePlayerStore.setState({
    nowPlaying: null,
    isLive: false,
    listenerCount: null,
  });
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockResponse,
  });
});

afterEach(() => {
  metadataService.stopPolling();
  jest.restoreAllMocks();
});

describe('metadataService', () => {
  describe('fetchNow()', () => {
    it('updates store with track metadata', async () => {
      await metadataService.fetchNow();

      const state = usePlayerStore.getState();
      expect(state.nowPlaying).toEqual({
        title: 'Deep House Mix',
        artist: 'DJ Name',
        artworkUrl: 'https://bonnytone.com/api/station/1/art/12345',
      });
    });

    it('updates listener count', async () => {
      await metadataService.fetchNow();
      expect(usePlayerStore.getState().listenerCount).toBe(42);
    });

    it('updates live status', async () => {
      await metadataService.fetchNow();
      expect(usePlayerStore.getState().isLive).toBe(true);
    });

    it('uses fallback values when API fields are empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          now_playing: { song: { title: '', artist: '', art: null } },
          listeners: { current: 0 },
          live: { is_live: false },
        }),
      });

      await metadataService.fetchNow();

      const state = usePlayerStore.getState();
      expect(state.nowPlaying?.title).toBe('BonnyTone Radio');
      expect(state.nowPlaying?.artist).toBe('Live Stream');
    });

    it('keeps stale data on fetch failure', async () => {
      // First successful fetch
      await metadataService.fetchNow();
      expect(usePlayerStore.getState().nowPlaying?.title).toBe('Deep House Mix');

      // Second fetch fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      await metadataService.fetchNow();

      // Still has the old data
      expect(usePlayerStore.getState().nowPlaying?.title).toBe('Deep House Mix');
    });

    it('sets default metadata when first fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      await metadataService.fetchNow();

      const state = usePlayerStore.getState();
      expect(state.nowPlaying?.title).toBe('BonnyTone Radio');
    });
  });
});
