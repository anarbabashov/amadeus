import { AppState, AppStateStatus } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';
import { CONFIG } from '@/constants/config';

interface AzuraCastNowPlayingResponse {
  now_playing: {
    song: {
      title: string;
      artist: string;
      art: string | null;
    };
  };
  listeners: {
    current: number;
  };
  live: {
    is_live: boolean;
  };
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
let isPolling = false;

async function fetchNowPlaying(): Promise<void> {
  const store = usePlayerStore.getState();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), CONFIG.METADATA_TIMEOUT_MS);

    const response = await fetch(CONFIG.METADATA_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);
    timeoutId = null;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: AzuraCastNowPlayingResponse = await response.json();

    const { title, artist, art } = data.now_playing.song;
    store.setNowPlaying({
      title: title || 'BonnyTone Radio',
      artist: artist || 'Live Stream',
      artworkUrl: art ?? null,
    });

    store.setListenerCount(data.listeners.current);
    store.setIsLive(data.live.is_live);
  } catch (error) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    console.warn('[Metadata] Failed to fetch now-playing data:', error);
    // Keep last known metadata — stale data is better than no data
    if (store.nowPlaying === null) {
      store.setNowPlaying({
        title: 'BonnyTone Radio',
        artist: 'Live Stream',
        artworkUrl: null,
      });
    }
  }
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active' && isPolling) {
    // App returned to foreground — fetch immediately and resume polling
    fetchNowPlaying();
    startPollTimer();
  } else if (nextState === 'background' || nextState === 'inactive') {
    // App backgrounded — stop polling to save battery
    stopPollTimer();
  }
}

function startPollTimer(): void {
  if (pollTimer !== null) return;
  pollTimer = setInterval(fetchNowPlaying, CONFIG.METADATA_POLL_INTERVAL_MS);
}

function stopPollTimer(): void {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling(): void {
  if (isPolling) return;
  isPolling = true;

  // Fetch immediately, then poll on interval
  fetchNowPlaying();
  startPollTimer();

  // Listen for app state changes to pause/resume polling
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
}

function stopPolling(): void {
  isPolling = false;
  stopPollTimer();

  if (appStateSubscription !== null) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

export const metadataService = {
  startPolling,
  stopPolling,
  fetchNow: fetchNowPlaying,
};
