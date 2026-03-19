import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { usePlayerStore } from '@/store/playerStore';
import { CONFIG } from '@/constants/config';

let soundInstance: Audio.Sound | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let bufferingStartTime: number | null = null;
let destroyed = false;

function getStore() {
  return usePlayerStore.getState();
}

// ── Audio Mode Configuration ──────────────────────────────────────────

async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

// ── Timer Management ──────────────────────────────────────────────────

function clearReconnectTimer(): void {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

// ── Reconnection Logic ────────────────────────────────────────────────

function getBackoffDelay(attempt: number): number {
  return Math.min(
    CONFIG.RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt),
    CONFIG.RECONNECT_MAX_DELAY_MS
  );
}

function scheduleReconnect(): void {
  if (destroyed) return;

  const store = getStore();
  const attempts = store.errorCount;

  if (attempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
    console.warn(`[Audio] Max reconnect attempts (${CONFIG.MAX_RECONNECT_ATTEMPTS}) reached. Stream offline.`);
    store.setStreamStatus('offline');
    store.resetErrorCount();
    return;
  }

  const delay = getBackoffDelay(attempts);
  console.log(`[Audio] Scheduling reconnect attempt ${attempts + 1}/${CONFIG.MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

  clearReconnectTimer();

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (destroyed) return;
    store.incrementErrorCount();
    await reinitializeAudio();
  }, delay);
}

// ── Buffering Timeout Logic ───────────────────────────────────────────

function handleBufferingState(isBuffering: boolean): void {
  if (destroyed) return;

  const store = getStore();

  if (isBuffering) {
    if (bufferingStartTime === null) {
      bufferingStartTime = Date.now();
    }
    store.setIsBuffering(true);
    store.setStreamStatus('buffering');

    const elapsed = Date.now() - bufferingStartTime;
    if (elapsed > CONFIG.BUFFER_TIMEOUT_MS) {
      console.warn('[Audio] Buffer timeout exceeded. Reinitializing.');
      bufferingStartTime = null;
      store.setError('Buffer timeout');
      scheduleReconnect();
    }
  } else {
    bufferingStartTime = null;
    store.setIsBuffering(false);
  }
}

// ── Playback Status Callback ──────────────────────────────────────────

function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (destroyed) return;

  const store = getStore();

  if (!status.isLoaded) {
    if (status.error) {
      console.error('[Audio] Playback error:', status.error);
      store.setError(status.error);
      store.incrementErrorCount();
      scheduleReconnect();
    }
    return;
  }

  if (status.isBuffering) {
    handleBufferingState(true);
    return;
  } else {
    handleBufferingState(false);
  }

  if (status.isPlaying) {
    store.setIsPlaying(true);
    store.setStreamStatus('live');
    if (store.errorCount > 0) {
      store.resetErrorCount();
    }
  } else {
    if (store.streamStatus !== 'connecting' && store.streamStatus !== 'error' && store.streamStatus !== 'offline') {
      store.setIsPlaying(false);
    }
  }
}

// ── Core Audio Functions ──────────────────────────────────────────────

async function initialize(): Promise<void> {
  destroyed = false;
  await configureAudioMode();
}

async function play(): Promise<void> {
  if (destroyed) return;

  const store = getStore();

  try {
    if (soundInstance === null) {
      store.setStreamStatus('connecting');

      const { sound } = await Audio.Sound.createAsync(
        { uri: CONFIG.STREAM_URL },
        { shouldPlay: true, volume: store.isMuted ? 0 : store.volume },
        onPlaybackStatusUpdate
      );

      if (destroyed) {
        // Destroyed while we were awaiting — clean up immediately
        try { await sound.unloadAsync(); } catch { /* ignore */ }
        return;
      }

      soundInstance = sound;
      return;
    }

    store.setStreamStatus('connecting');
    await soundInstance.playAsync();
  } catch (error) {
    if (destroyed) return;
    console.error('[Audio] Play failed:', error);
    store.setError(error instanceof Error ? error.message : 'Play failed');
    store.incrementErrorCount();
    scheduleReconnect();
  }
}

async function pause(): Promise<void> {
  const store = getStore();

  // Cancel any pending reconnect when user explicitly pauses
  clearReconnectTimer();
  bufferingStartTime = null;

  try {
    if (soundInstance !== null) {
      await soundInstance.pauseAsync();
    }
    store.setIsPlaying(false);
    store.setStreamStatus('idle');
  } catch (error) {
    console.error('[Audio] Pause failed:', error);
    store.setIsPlaying(false);
    store.setStreamStatus('idle');
  }
}

async function setVolume(volume: number): Promise<void> {
  try {
    if (soundInstance !== null) {
      await soundInstance.setVolumeAsync(volume);
    }
  } catch (error) {
    console.error('[Audio] Set volume failed:', error);
  }
}

async function reinitializeAudio(): Promise<void> {
  if (destroyed) return;

  const store = getStore();

  console.log('[Audio] Reinitializing audio...');
  store.setStreamStatus('connecting');

  if (soundInstance !== null) {
    try {
      await soundInstance.unloadAsync();
    } catch {
      // Ignore — the sound may already be in a broken state
    }
    soundInstance = null;
  }

  if (destroyed) return;

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: CONFIG.STREAM_URL },
      { shouldPlay: true, volume: store.isMuted ? 0 : store.volume },
      onPlaybackStatusUpdate
    );

    if (destroyed) {
      try { await sound.unloadAsync(); } catch { /* ignore */ }
      return;
    }

    soundInstance = sound;
    clearReconnectTimer();
  } catch (error) {
    if (destroyed) return;
    console.error('[Audio] Reinitialization failed:', error);
    store.setError(error instanceof Error ? error.message : 'Reinitialization failed');
    scheduleReconnect();
  }
}

async function destroy(): Promise<void> {
  destroyed = true;
  clearReconnectTimer();
  bufferingStartTime = null;

  if (soundInstance !== null) {
    try {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
    } catch {
      // Ignore errors during cleanup
    }
    soundInstance = null;
  }

  const store = getStore();
  store.setStreamStatus('idle');
  store.setIsPlaying(false);
  store.setIsBuffering(false);
  store.resetErrorCount();
}

export const audioService = {
  initialize,
  play,
  pause,
  setVolume,
  destroy,
};
