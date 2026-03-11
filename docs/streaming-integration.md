# Streaming Integration Guide

> BonnyTone Radio Mobile App -- expo-av + HLS Streaming
>
> **Spec References:** Section 2 (Streaming Architecture), Section 4 (Mandatory Features), Section 11 Phase 2 (Audio Engine)

---

## Table of Contents

1. [expo-av Setup and Configuration](#1-expo-av-setup-and-configuration)
2. [HLS Stream Loading](#2-hls-stream-loading)
3. [Audio Lifecycle Management](#3-audio-lifecycle-management)
4. [Lock Screen Controls](#4-lock-screen-controls)
5. [Error Handling](#5-error-handling)
6. [Playback Status Callback](#6-playback-status-callback)
7. [Metadata Service](#7-metadata-service)

---

## 1. expo-av Setup and Configuration

### Audio Mode Configuration

The audio mode must be configured before any playback begins. Call this once at app startup (e.g., in your root layout or a dedicated audio initialization hook).

```typescript
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

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
```

**Configuration breakdown:**

| Option | Value | Purpose |
|--------|-------|---------|
| `staysActiveInBackground` | `true` | Audio continues when the app is backgrounded or the screen is locked |
| `playsInSilentModeIOS` | `true` | Plays audio even when the iOS silent/mute switch is on |
| `shouldDuckAndroid` | `true` | Lowers volume during transient interruptions (notifications, navigation prompts) instead of pausing |
| `playThroughEarpieceAndroid` | `false` | Routes audio to the speaker/headphones, not the earpiece |
| `interruptionModeIOS` | `DoNotMix` | Interrupts other audio sources; maps to `AVAudioSessionCategoryPlayback` |
| `interruptionModeAndroid` | `DoNotMix` | Takes audio focus from other apps |

### iOS: AVAudioSessionCategoryPlayback

expo-av sets `AVAudioSessionCategoryPlayback` automatically when `playsInSilentModeIOS: true` and `interruptionModeIOS: DoNotMix` are configured. No native code changes are required. The `UIBackgroundModes` audio entitlement must be present in `app.json` (see below).

### Android: Foreground Service

Android requires a foreground service notification to keep audio alive in the background. Configure this in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": false
        }
      ]
    ],
    "android": {
      "permissions": [
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "WAKE_LOCK"
      ]
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

> **Note:** The `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission (required for Android 14+) ensures the OS does not kill the audio process when the app is in the background.

---

## 2. HLS Stream Loading

### Stream URL

```
https://bonnytone.com/stream/hls/btradio/live.m3u8
```

This is an HLS (HTTP Live Streaming) master playlist served by AzuraCast. The stream delivers AAC-LC encoded audio at multiple quality tiers.

### Bitrate Tiers

| Tier | Bitrate | Use Case |
|------|---------|----------|
| Low | 48 kbps AAC-LC | Poor network / data-saving mode |
| Medium | 128 kbps AAC-LC | Default / mobile networks |
| High | 256 kbps AAC-LC | Wi-Fi / high-quality listening |

- **Segment duration:** 4 seconds
- **Adaptive bitrate (ABR):** handled natively by AVPlayer on iOS and ExoPlayer on Android. No application-level ABR logic is needed -- the native players monitor network conditions and switch tiers automatically.

### Loading the Stream

```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';

const STREAM_URL = 'https://bonnytone.com/stream/hls/btradio/live.m3u8';

async function loadStream(): Promise<Audio.Sound> {
  const { sound } = await Audio.Sound.createAsync(
    { uri: STREAM_URL },
    { shouldPlay: false, isLooping: false },
    onPlaybackStatusUpdate
  );

  return sound;
}
```

`Audio.Sound.createAsync` accepts the HLS playlist URI directly. On iOS the underlying AVPlayer recognizes the `.m3u8` extension and enters HLS mode. On Android, ExoPlayer does the same. No additional HLS libraries are required.

---

## 3. Audio Lifecycle Management

### Types

```typescript
type StreamStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error' | 'offline';

interface AudioState {
  sound: Audio.Sound | null;
  streamStatus: StreamStatus;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
}
```

### initializeAudio()

Call this once when the user first interacts with the player (or on app cold start if auto-play is desired). It configures the audio mode, loads the stream, and prepares the player for playback.

```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useRadioStore } from '@/store/radioStore';

const STREAM_URL = 'https://bonnytone.com/stream/hls/btradio/live.m3u8';

let soundInstance: Audio.Sound | null = null;

async function initializeAudio(): Promise<void> {
  const store = useRadioStore.getState();

  // Prevent double-initialization
  if (soundInstance !== null) {
    return;
  }

  store.setStreamStatus('loading');

  try {
    // 1. Configure audio mode (idempotent; safe to call multiple times)
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    // 2. Create and load the sound object
    const { sound } = await Audio.Sound.createAsync(
      { uri: STREAM_URL },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );

    soundInstance = sound;
    store.setSound(sound);
    store.setStreamStatus('paused');
  } catch (error) {
    console.error('[Audio] Initialization failed:', error);
    store.setStreamStatus('error');
    scheduleReconnect();
  }
}
```

### play()

Starts or resumes playback. If the sound instance has been unloaded (e.g., after a network error), it re-initializes first.

```typescript
async function play(): Promise<void> {
  const store = useRadioStore.getState();

  try {
    if (soundInstance === null) {
      await initializeAudio();
    }

    if (soundInstance === null) {
      // initializeAudio failed and scheduled a reconnect
      return;
    }

    store.setStreamStatus('loading');
    await soundInstance.playAsync();
    // streamStatus will be updated to 'playing' via onPlaybackStatusUpdate
  } catch (error) {
    console.error('[Audio] Play failed:', error);
    store.setStreamStatus('error');
    scheduleReconnect();
  }
}
```

### pause()

Pauses playback but keeps the stream loaded. This avoids a full teardown/reload cycle when the user resumes.

```typescript
async function pause(): Promise<void> {
  const store = useRadioStore.getState();

  try {
    if (soundInstance !== null) {
      await soundInstance.pauseAsync();
      store.setStreamStatus('paused');
    }
  } catch (error) {
    console.error('[Audio] Pause failed:', error);
    // Even if pause throws, the UI should reflect paused state
    store.setStreamStatus('paused');
  }
}
```

### handleInterruption()

Handles audio interruptions caused by phone calls, Siri, alarms, or other apps taking audio focus. expo-av surfaces these through the playback status callback, but this helper encapsulates the recovery logic.

```typescript
async function handleInterruption(wasPlaying: boolean): Promise<void> {
  const store = useRadioStore.getState();

  if (soundInstance === null) {
    return;
  }

  try {
    const status = await soundInstance.getStatusAsync();

    if (!status.isLoaded) {
      // The sound was unloaded during the interruption (e.g., OS reclaimed resources).
      // Full re-initialization is required.
      soundInstance = null;
      store.setSound(null);

      if (wasPlaying) {
        await initializeAudio();
        await play();
      } else {
        store.setStreamStatus('idle');
      }
      return;
    }

    // Sound is still loaded. If the user was listening before the interruption,
    // resume playback. Otherwise, stay paused.
    if (wasPlaying && !status.isPlaying) {
      await soundInstance.playAsync();
    }
  } catch (error) {
    console.error('[Audio] Interruption recovery failed:', error);
    store.setStreamStatus('error');
    scheduleReconnect();
  }
}
```

### Cleanup on App Termination

Unload the sound object when the app is about to terminate or when the user explicitly stops listening. This frees native resources and stops any background service.

```typescript
async function cleanupAudio(): Promise<void> {
  const store = useRadioStore.getState();

  if (store.reconnectTimer !== null) {
    clearTimeout(store.reconnectTimer);
    store.setReconnectTimer(null);
  }

  if (soundInstance !== null) {
    try {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
    } catch {
      // Ignore errors during cleanup -- the sound may already be unloaded
    }
    soundInstance = null;
    store.setSound(null);
  }

  store.setStreamStatus('idle');
  store.setReconnectAttempts(0);
}
```

---

## 4. Lock Screen Controls

### Automatic Controls

expo-av provides basic lock screen transport controls (play/pause) automatically on both iOS and Android when `staysActiveInBackground` is `true`. No additional setup is required for play/pause functionality.

### updateNowPlayingInfo()

To display track metadata (title, artist, artwork) on the lock screen and in the notification shade, update the now-playing info whenever the current track changes. This uses the `expo-av` sound instance metadata along with the system media session.

> **Note:** For full lock screen metadata support on both platforms, the `expo-music-controls` or `react-native-track-player` package may be required in the future. The implementation below works with the standard expo-av capabilities and can be extended.

```typescript
import * as MediaLibrary from 'expo-media-library';

interface NowPlayingInfo {
  title: string;
  artist: string;
  artworkUrl: string | null;
}

let lastNowPlayingInfo: NowPlayingInfo | null = null;

async function updateNowPlayingInfo(info: NowPlayingInfo): Promise<void> {
  lastNowPlayingInfo = info;

  // Update the Zustand store so UI components reflect the new metadata
  const store = useRadioStore.getState();
  store.setNowPlaying({
    title: info.title,
    artist: info.artist,
    artworkUrl: info.artworkUrl,
  });

  // If using a media session library (e.g., expo-music-controls), update it here:
  // await MusicControl.setNowPlaying({
  //   title: info.title,
  //   artist: info.artist,
  //   artwork: info.artworkUrl ?? undefined,
  //   isLiveStream: true,
  // });
}
```

### Updating Metadata from API Response

This is called from the metadata polling service (see [Section 7](#7-metadata-service)).

```typescript
interface AzuraCastNowPlaying {
  now_playing: {
    song: {
      title: string;
      artist: string;
      art: string | null;
    };
  };
}

function handleNowPlayingResponse(data: AzuraCastNowPlaying): void {
  const { title, artist, art } = data.now_playing.song;

  updateNowPlayingInfo({
    title: title || 'BonnyTone Radio',
    artist: artist || 'Live Stream',
    artworkUrl: art ?? null,
  });
}
```

---

## 5. Error Handling

### Reconnection Strategy

Network failures are expected in mobile environments (tunnels, elevator, airplane mode toggle). The reconnection strategy uses exponential backoff to avoid overwhelming the server.

| Attempt | Delay |
|---------|-------|
| 1 | 1 s |
| 2 | 2 s |
| 3 | 4 s |
| 4 | 8 s |
| 5 | 16 s |
| 6 | 30 s (capped) |
| 7--10 | 30 s |
| After 10 | Stop. Set `streamStatus` to `'offline'`. Show retry button. |

### scheduleReconnect()

```typescript
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

function scheduleReconnect(): void {
  const store = useRadioStore.getState();
  const attempts = store.reconnectAttempts;

  if (attempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn(`[Audio] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stream offline.`);
    store.setStreamStatus('offline');
    store.setReconnectAttempts(0);
    return;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s, 30s, ...
  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempts), MAX_DELAY_MS);

  console.log(`[Audio] Scheduling reconnect attempt ${attempts + 1}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

  // Clear any existing timer
  if (store.reconnectTimer !== null) {
    clearTimeout(store.reconnectTimer);
  }

  const timer = setTimeout(async () => {
    store.setReconnectAttempts(attempts + 1);
    await reinitializeAudio();
  }, delay);

  store.setReconnectTimer(timer);
}
```

### reinitializeAudio()

Tears down the current (broken) sound instance and creates a fresh one. This is the recovery path after network errors and stream outages.

```typescript
async function reinitializeAudio(): Promise<void> {
  const store = useRadioStore.getState();

  console.log('[Audio] Reinitializing audio...');
  store.setStreamStatus('loading');

  // Tear down existing instance
  if (soundInstance !== null) {
    try {
      await soundInstance.unloadAsync();
    } catch {
      // Ignore -- the sound may already be in a broken state
    }
    soundInstance = null;
    store.setSound(null);
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: STREAM_URL },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    soundInstance = sound;
    store.setSound(sound);
    store.setReconnectAttempts(0);
    store.setReconnectTimer(null);
    // streamStatus will update to 'playing' via onPlaybackStatusUpdate
  } catch (error) {
    console.error('[Audio] Reinitialization failed:', error);
    store.setStreamStatus('error');
    scheduleReconnect();
  }
}
```

### Error Scenarios

**Network errors (no connectivity):**
Detected via `onPlaybackStatusUpdate` when `status.error` is set or when `isLoaded` becomes `false` unexpectedly. Triggers `scheduleReconnect()`.

**Stream offline (HTTP 404/500 from playlist URL):**
The HLS player will report a load error. The same reconnect path applies, but the metadata service (Section 7) can detect this earlier via the `live.is_live` field. When the stream is confirmed offline, set `streamStatus` to `'offline'` immediately.

**Buffer underrun:**
Detected when `isBuffering` is `true` for an extended period. The native HLS players handle rebuffering automatically. The app should show a buffering indicator but should not trigger reconnection unless the buffering persists beyond 30 seconds.

```typescript
let bufferingStartTime: number | null = null;
const BUFFER_TIMEOUT_MS = 30000;

function handleBufferingState(isBuffering: boolean): void {
  const store = useRadioStore.getState();

  if (isBuffering) {
    if (bufferingStartTime === null) {
      bufferingStartTime = Date.now();
    }
    store.setStreamStatus('buffering');

    // Check if buffering has exceeded the timeout
    const elapsed = Date.now() - bufferingStartTime;
    if (elapsed > BUFFER_TIMEOUT_MS) {
      console.warn('[Audio] Buffer timeout exceeded. Reinitializing.');
      bufferingStartTime = null;
      scheduleReconnect();
    }
  } else {
    bufferingStartTime = null;
  }
}
```

---

## 6. Playback Status Callback

The playback status callback is the central event handler for all audio state changes. It is registered when the sound is created (see `Audio.Sound.createAsync` in Section 2) and fires on every status update from the native player.

### onPlaybackStatusUpdate()

```typescript
import { AVPlaybackStatus } from 'expo-av';
import { useRadioStore } from '@/store/radioStore';

function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  const store = useRadioStore.getState();

  // --- Unloaded state ---
  if (!status.isLoaded) {
    // The sound has been unloaded or failed to load
    if (status.error) {
      console.error('[Audio] Playback error:', status.error);
      store.setStreamStatus('error');
      scheduleReconnect();
    }
    return;
  }

  // --- Loaded state ---

  // Handle errors reported on a loaded sound
  if (status.error) {
    console.error('[Audio] Playback error (loaded):', status.error);
    store.setStreamStatus('error');
    scheduleReconnect();
    return;
  }

  // Handle buffering
  if (status.isBuffering) {
    handleBufferingState(true);
    return;
  } else {
    handleBufferingState(false);
  }

  // Handle play/pause state
  if (status.isPlaying) {
    store.setStreamStatus('playing');
    // Reset reconnect counter on successful playback
    if (store.reconnectAttempts > 0) {
      store.setReconnectAttempts(0);
    }
  } else {
    // Not playing and not buffering: paused
    if (store.streamStatus !== 'loading' && store.streamStatus !== 'error') {
      store.setStreamStatus('paused');
    }
  }

  // Update playback position and duration (useful for debugging live streams)
  store.setPlaybackPosition(status.positionMillis);

  // Update volume if changed externally
  if (status.volume !== undefined) {
    store.setVolume(status.volume);
  }
}
```

### Key Status Fields

| Field | Type | Meaning |
|-------|------|---------|
| `isLoaded` | `boolean` | `false` if the sound failed to load or was unloaded |
| `isPlaying` | `boolean` | Audio is actively playing |
| `isBuffering` | `boolean` | Player is buffering data (show spinner) |
| `error` | `string \| undefined` | Error message from the native player |
| `positionMillis` | `number` | Current playback position in ms |
| `volume` | `number` | Current volume (0.0 to 1.0) |

---

## 7. Metadata Service

### Endpoint

```
GET https://bonnytone.com/api/azuracast/nowplaying/btradio
```

This endpoint is polled every 15 seconds to retrieve the currently playing track, listener count, and live DJ status.

### Response Shape (relevant fields)

```typescript
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
    streamer_name: string;
  };
}
```

### fetchNowPlaying()

```typescript
const NOWPLAYING_URL = 'https://bonnytone.com/api/azuracast/nowplaying/btradio';
const POLL_INTERVAL_MS = 15000;

let metadataTimer: ReturnType<typeof setInterval> | null = null;
let lastKnownMetadata: AzuraCastNowPlayingResponse | null = null;

async function fetchNowPlaying(): Promise<void> {
  const store = useRadioStore.getState();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(NOWPLAYING_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: AzuraCastNowPlayingResponse = await response.json();
    lastKnownMetadata = data;

    // Update now-playing metadata
    const { title, artist, art } = data.now_playing.song;
    updateNowPlayingInfo({
      title: title || 'BonnyTone Radio',
      artist: artist || 'Live Stream',
      artworkUrl: art ?? null,
    });

    // Update listener count
    store.setListenerCount(data.listeners.current);

    // Update live DJ status
    store.setLiveStatus({
      isLive: data.live.is_live,
      streamerName: data.live.streamer_name,
    });
  } catch (error) {
    console.warn('[Metadata] Failed to fetch now-playing data:', error);

    // Graceful failure: keep last known metadata.
    // Do not clear the store -- stale data is better than no data.
    if (lastKnownMetadata === null) {
      // No previous data at all; set defaults
      store.setNowPlaying({
        title: 'BonnyTone Radio',
        artist: 'Live Stream',
        artworkUrl: null,
      });
    }
  }
}
```

### Starting and Stopping the Polling Loop

```typescript
function startMetadataPolling(): void {
  if (metadataTimer !== null) {
    return; // Already polling
  }

  // Fetch immediately, then poll on interval
  fetchNowPlaying();
  metadataTimer = setInterval(fetchNowPlaying, POLL_INTERVAL_MS);
}

function stopMetadataPolling(): void {
  if (metadataTimer !== null) {
    clearInterval(metadataTimer);
    metadataTimer = null;
  }
}
```

Start polling when the audio engine initializes and stop when the app terminates or the user navigates away from the radio screen (depending on UX requirements).

---

## Mobile-First Considerations

- **Battery:** Polling every 15 seconds is acceptable but consider pausing metadata polling when the app is backgrounded (the lock screen metadata will remain static until the app returns to the foreground).
- **Data usage:** The 48 kbps low tier uses approximately 21 MB/hour. Consider surfacing a data-saver toggle that forces the low tier (if a manual quality override is implemented in a future phase).
- **Offline:** When `streamStatus` is `'offline'`, disable the play button and show a clear message. Provide a manual retry button that calls `reinitializeAudio()`.
- **Interruptions:** iOS and Android handle audio focus differently. The `handleInterruption()` function covers the common cases, but test thoroughly on both platforms with phone calls, alarms, and other audio apps.

---

## Document Completion Checklist

- [x] All required sections present
- [x] Code examples included (where applicable)
- [x] Spec sections referenced
- [x] Mobile-first considerations addressed
- [x] TypeScript types used in examples
- [x] Acceptance criteria defined (where applicable)
- [x] Ready for Team Lead review

**Author:** Architect Agent
**Date:** 2026-03-10
**Status:** Ready for Review
