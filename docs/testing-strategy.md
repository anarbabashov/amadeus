# BonnyTone Radio - Testing Strategy

> Reference: Spec Section 12 (QA Engineer Agent)

---

## 1. Testing Pyramid

The testing strategy follows a standard pyramid distribution to maximize confidence while keeping feedback loops fast:

| Layer | Coverage | Focus Areas |
|-------|----------|-------------|
| **Unit Tests** | 70% | Store actions, utility functions, hooks |
| **Integration Tests** | 20% | Audio service + store interactions, metadata polling pipeline |
| **E2E Tests** | 10% | Full user flows (play, pause, background, reconnect) |

Unit tests form the foundation. They are fast, deterministic, and cover every store action, utility function, and custom hook in isolation. Integration tests verify that services and the store work together correctly (e.g., audio playback triggers the right store updates). E2E tests validate critical user journeys on real or emulated devices.

---

## 2. Test File Structure

```
__tests__/
  store/
    playerStore.test.ts
  services/
    audioService.test.ts
    metadataService.test.ts
  components/
    PlayButton.test.tsx
    VolumeControl.test.tsx
    NowPlaying.test.tsx
    StreamStatus.test.tsx
  integration/
    audioPlayback.test.ts
    metadataPolling.test.ts
```

All test files live in a top-level `__tests__/` directory, mirroring the source structure. Component tests use `.test.tsx` for JSX support; all others use `.test.ts`.

---

## 3. Unit Test Cases

### 3.1 Store Tests (`__tests__/store/playerStore.test.ts`)

| # | Test | Description |
|---|------|-------------|
| 1 | `play() sets streamStatus to 'connecting'` | Calling `play()` should immediately transition `streamStatus` from `'idle'` to `'connecting'` before the audio service begins loading. |
| 2 | `pause() sets isPlaying to false` | Calling `pause()` should set `isPlaying` to `false` regardless of current stream status. |
| 3 | `togglePlay() toggles isPlaying state` | When `isPlaying` is `false`, `togglePlay()` sets it to `true` (and vice versa). Verifies the toggle logic is correct in both directions. |
| 4 | `setVolume() updates volume (clamp 0-1)` | `setVolume(0.5)` sets volume to `0.5`. Values below 0 clamp to 0; values above 1 clamp to 1. |
| 5 | `toggleMute() saves previousVolume and sets volume to 0` | When volume is non-zero, `toggleMute()` stores the current volume in `previousVolume` and sets `volume` to `0`. |
| 6 | `toggleMute() restores previousVolume when unmuting` | When volume is `0` (muted), `toggleMute()` restores `volume` to the saved `previousVolume` value. |
| 7 | `setQuality() updates quality` | `setQuality('high')` sets the `quality` field. Accepts `'low'`, `'medium'`, and `'high'`. |
| 8 | `setStreamStatus() updates streamStatus` | `setStreamStatus('playing')` updates the `streamStatus` field. Accepts `'idle'`, `'connecting'`, `'buffering'`, `'playing'`, and `'error'`. |
| 9 | `setNowPlaying() updates nowPlaying info` | `setNowPlaying({ title: 'Song', artist: 'Artist' })` updates the `nowPlaying` object in the store. |
| 10 | `setListenerCount() updates listener count` | `setListenerCount(42)` sets the `listenerCount` field to `42`. |
| 11 | `incrementErrorCount() increments errorCount` | Each call to `incrementErrorCount()` adds 1 to the current `errorCount`. |
| 12 | `resetErrorCount() resets to 0` | `resetErrorCount()` sets `errorCount` back to `0` regardless of current value. |
| 13 | `setError() stores error message` | `setError('Network timeout')` sets the `error` field. Passing `null` clears the error. |
| 14 | `hydrateVolume() loads volume from AsyncStorage` | On app start, `hydrateVolume()` reads the persisted volume from AsyncStorage and applies it to the store. Falls back to `1.0` if no value is stored. |

### 3.2 Audio Service Tests (`__tests__/services/audioService.test.ts`)

| # | Test | Description |
|---|------|-------------|
| 15 | `initializeAudio() configures audio mode` | Verifies that `Audio.setAudioModeAsync` is called with the correct options: `playsInSilentModeIOS: true`, `staysActiveInBackground: true`, and appropriate `interruptionModeIOS` / `interruptionModeAndroid` values. |
| 16 | `initializeAudio() creates Sound instance` | Confirms that a new `Audio.Sound` instance is created and stored for reuse across play/pause cycles. |
| 17 | `play() loads HLS stream URL` | Calling `play()` invokes `sound.loadAsync()` with the configured HLS stream URL and `{ shouldPlay: true }`. |
| 18 | `pause() pauses without unloading` | `pause()` calls `sound.pauseAsync()` but does not call `sound.unloadAsync()`, preserving the loaded stream for quick resume. |
| 19 | `handleInterruption() pauses on incoming call` | When the OS triggers an audio interruption event (e.g., incoming phone call), playback pauses and the store reflects the paused state. |
| 20 | `scheduleReconnect() uses exponential backoff delays` | Reconnect delays follow exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped). Each attempt is verified against the expected delay. |
| 21 | `scheduleReconnect() stops after 10 attempts` | After 10 consecutive failed reconnection attempts, `scheduleReconnect()` gives up and sets `streamStatus` to `'error'` with an appropriate error message. |

### 3.3 Component Tests

| # | Test | File | Description |
|---|------|------|-------------|
| 22 | PlayButton renders play icon when not playing | `PlayButton.test.tsx` | When `isPlaying` is `false`, the component renders the play (triangle) icon. |
| 23 | PlayButton renders pause icon when playing | `PlayButton.test.tsx` | When `isPlaying` is `true`, the component renders the pause (double bar) icon. |
| 24 | PlayButton shows spinner when buffering | `PlayButton.test.tsx` | When `streamStatus` is `'buffering'` or `'connecting'`, the component renders a loading spinner instead of play/pause icons. |
| 25 | PlayButton calls togglePlay on press | `PlayButton.test.tsx` | Pressing the button invokes the `togglePlay` store action exactly once. |
| 26 | VolumeControl slider reflects store volume | `VolumeControl.test.tsx` | The slider value matches the current `volume` from the store (0-1 range). |
| 27 | VolumeControl mute button toggles mute | `VolumeControl.test.tsx` | Pressing the mute/unmute button invokes `toggleMute()` and the icon updates to reflect the muted state. |

---

## 4. Integration Test Cases

### 4.1 Audio Playback Flow (`__tests__/integration/audioPlayback.test.ts`)

| Test | Description |
|------|-------------|
| Play -> store updates -> UI reflects playing state | Trigger `play()` on the audio service. Verify that the store transitions through `'connecting'` -> `'buffering'` -> `'playing'`, and that a component reading from the store re-renders with the correct state at each step. |
| Network drop -> auto-reconnect -> playback resumes | Simulate a network failure mid-stream. Verify that the service detects the error, schedules reconnection with backoff, and successfully resumes playback when the network returns. The store should reflect `'error'` during the outage and `'playing'` after recovery. |

### 4.2 Metadata Polling Flow (`__tests__/integration/metadataPolling.test.ts`)

| Test | Description |
|------|-------------|
| Metadata poll -> store updates -> NowPlaying component updates | Start the metadata polling interval. Return a mock response with track info. Verify that `setNowPlaying()` is called with the parsed data and that the `NowPlaying` component renders the updated title and artist. |
| Volume change -> audio output changes | Adjust the volume via `setVolume(0.3)`. Verify that `sound.setVolumeAsync(0.3)` is called on the audio instance and that the store reflects the new volume. |

---

## 5. Device Testing Matrix

| Platform | Device | OS Version | Priority | Notes |
|----------|--------|------------|----------|-------|
| iOS | iPhone SE 3 | iOS 17.x | High | Smallest supported screen; tests layout constraints |
| iOS | iPhone 15 Pro | iOS 17.x | High | Primary target; Dynamic Island, ProMotion display |
| Android | Pixel 7 | Android 14 | High | Stock Android reference device |
| Android | Samsung Galaxy S23 | Android 14 | High | One UI overlay; tests OEM-specific audio handling |

All devices should be tested on both WiFi and cellular connections. iOS devices should additionally verify CarPlay audio handoff behavior.

---

## 6. Manual Testing Checklist

### 6.1 Background Audio

- [ ] Start playback, lock the device. Audio continues uninterrupted.
- [ ] Start playback, switch to another app. Audio continues.
- [ ] Start playback, leave running for 1+ hour with the screen locked. Verify audio still plays and memory has not spiked.
- [ ] Start playback, open a resource-intensive app (game, camera). Verify audio is not killed by the OS.

### 6.2 Bluetooth

- [ ] Connect AirPods before starting playback. Audio routes correctly.
- [ ] Start playback on speakers, then connect AirPods. Audio routes to AirPods without interruption.
- [ ] Disconnect AirPods mid-playback. Audio pauses (iOS) or routes to speaker (Android).
- [ ] Connect to car audio via Bluetooth. Verify playback and metadata display on the car head unit.
- [ ] Disconnect wired headphones mid-playback. Audio pauses and does not blast from the speaker.

### 6.3 Network Resilience

- [ ] Start on WiFi, switch to 4G mid-stream. Playback recovers within 5 seconds.
- [ ] Start on 4G, degrade to 3G. Playback continues (may buffer briefly).
- [ ] Enable airplane mode mid-playback. Verify graceful error state with user-facing message.
- [ ] Disable airplane mode. Verify auto-reconnect and playback resumes within 5 seconds.
- [ ] Start with no network. Verify clear error message and no crash.

### 6.4 Long Session Stability

- [ ] Play continuously for 1+ hour. No crashes, no audio glitches.
- [ ] Play continuously for 4+ hours. Memory usage remains below 100MB.
- [ ] Monitor CPU usage over a long session. No runaway processes or excessive battery drain.

### 6.5 Interruptions

- [ ] Receive a phone call mid-playback. Audio pauses. After the call, audio resumes (or stays paused with easy resume).
- [ ] Trigger Siri / Google Assistant mid-playback. Audio ducks or pauses and resumes after.
- [ ] Play audio from another app (YouTube, Spotify). BonnyTone yields and does not play simultaneously.
- [ ] Receive a notification with sound. Audio ducks briefly, then restores volume.

### 6.6 Lock Screen Controls

- [ ] Lock screen shows playback controls (play/pause).
- [ ] Play/pause button on lock screen works correctly.
- [ ] Now Playing metadata (track title, artist) appears on lock screen.
- [ ] Metadata updates on the lock screen when the track changes.
- [ ] Control Center (iOS) / notification shade (Android) shows correct controls and metadata.

---

## 7. Acceptance Criteria

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| Stream start time | < 3 seconds on WiFi | Timestamp from `play()` call to first audio frame (measured via `onPlaybackStatusUpdate`) |
| Crash-free playback | No crashes after 1+ hour | Automated and manual long-session tests |
| Memory usage | < 100MB after 4+ hours | Profile with Xcode Instruments (iOS) and Android Studio Profiler |
| Reconnection time | < 5 seconds after network returns | Automated integration test with simulated network toggle |
| Animation performance | 60 fps | React Native Performance Monitor; no dropped frames during play/pause transitions |
| Lock screen responsiveness | Controls respond within 200ms | Manual testing with stopwatch; no perceived lag |

---

## 8. Testing Tools

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner and assertion library for all unit and integration tests |
| **React Native Testing Library** | Rendering and querying components in unit tests; `render()`, `fireEvent`, `waitFor` |
| **jest.mock('expo-av')** | Mock the `Audio.Sound` class and `Audio.setAudioModeAsync` to avoid native module dependencies in tests |
| **fetch mocks** | Mock the metadata API endpoint (`global.fetch = jest.fn()`) to return controlled responses for metadata polling tests |
| **AsyncStorage mock** | Mock `@react-native-async-storage/async-storage` for volume hydration tests; use `@react-native-async-storage/async-storage/jest/async-storage-mock` |

### Example: Mocking expo-av

```typescript
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          pauseAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setOnPlaybackStatusUpdate: jest.fn(),
        },
        status: { isLoaded: true },
      }),
    },
    setAudioModeAsync: jest.fn(),
    InterruptionModeIOS: { DuckOthers: 1 },
    InterruptionModeAndroid: { DuckOthers: 1 },
  },
}));
```

### Example: Mocking Metadata Fetch

```typescript
const mockMetadata = {
  title: 'Midnight Jazz',
  artist: 'The BonnyTone Quartet',
  listeners: 128,
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockMetadata,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

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
