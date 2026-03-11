# Implementation Plan
**BonnyTone Radio Mobile Application**

---

## Overview

This document defines the phased development plan for the BonnyTone Radio mobile app, built with React Native + Expo. Each phase includes numbered tasks, acceptance criteria, dependencies, risk areas, and expected git commits following the conventions defined in [docs/git-flow.md](git-flow.md).

**Total Timeline:** 15-20 days implementation
**Stack:** React Native, Expo, TypeScript, Zustand, expo-av, Reanimated, expo-linear-gradient, expo-router

---

## Phase 1: Project Setup (1-2 days)

**Dependencies:** None (starting phase)
**Branch:** `chore/project-init`, `feature/player-store`

### Tasks

#### 1.1 Initialize Expo Project

Create a new Expo project using the tabs template as the foundation for tab-based navigation via expo-router.

**Acceptance Criteria:**
- [ ] `npx expo start` launches the app without errors
- [ ] Tab navigation renders with placeholder screens
- [ ] App runs on both iOS Simulator and Android Emulator

**Expected Commit:**
```
chore: initialize expo project with tabs template
```

#### 1.2 Install All Dependencies

Install the full set of required packages for audio, state, animation, and navigation.

| Package | Purpose |
|---------|---------|
| `expo-av` | Audio playback and streaming |
| `zustand` | Lightweight state management |
| `react-native-reanimated` | Performant animations |
| `expo-linear-gradient` | Gradient backgrounds |
| `expo-sharing` | Native share sheet |
| `expo-router` | File-based routing (included with tabs template) |

**Acceptance Criteria:**
- [ ] All packages install without peer dependency conflicts
- [ ] `npx expo start` still boots cleanly after install
- [ ] `package.json` lists all dependencies with pinned versions

**Expected Commit:**
```
chore: install expo-av, zustand, reanimated, and dependencies
```

#### 1.3 Configure TypeScript Strict Mode

Enable strict mode in `tsconfig.json` to enforce type safety from day one.

```typescript
// tsconfig.json (partial)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `strict: true` is set in `tsconfig.json`

**Expected Commit:**
```
chore: enable TypeScript strict mode
```

#### 1.4 Set Up app.json With Audio Permissions

Configure native permissions so audio continues playing when the app is backgrounded or the device is locked.

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "permissions": ["FOREGROUND_SERVICE"]
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `UIBackgroundModes: ["audio"]` is present in `app.json` under `ios.infoPlist`
- [ ] Android foreground service permission is declared
- [ ] Prebuild generates valid native projects (`npx expo prebuild --clean` succeeds)

**Expected Commit:**
```
chore: configure audio permissions in app.json
```

#### 1.5 Create Zustand Store Skeleton

Define the `PlayerState` interface and create an empty Zustand store that will be populated in later phases.

```typescript
interface PlayerState {
  // Playback
  isPlaying: boolean;
  isBuffering: boolean;
  isConnected: boolean;
  volume: number;

  // Metadata
  trackTitle: string;
  artistName: string;
  artworkUrl: string | null;
  isLive: boolean;
  listenerCount: number;

  // Actions
  play: () => Promise<void>;
  pause: () => Promise<void>;
  setVolume: (volume: number) => void;
  setMetadata: (metadata: NowPlayingMetadata) => void;
}
```

**Acceptance Criteria:**
- [ ] Store file exists at `store/playerStore.ts`
- [ ] `PlayerState` interface is exported and fully typed
- [ ] Store initializes with sensible defaults (isPlaying: false, volume: 1.0, etc.)
- [ ] Store is importable from a component without errors

**Expected Commit:**
```
feat: add player store with initial state interface
```

#### 1.6 Set Up Git Repo With Branching Strategy

Initialize the repository and establish the branching model described in [docs/git-flow.md](git-flow.md).

**Acceptance Criteria:**
- [ ] `main` branch exists with initial commit
- [ ] `develop` branch is created from `main`
- [ ] `.gitignore` covers `node_modules/`, `.env`, `.expo/`, `ios/`, `android/`
- [ ] All Phase 1 work is merged into `develop` via PR

**Expected Commits:**
```
chore: initialize git repo with .gitignore
chore: create develop branch
```

### Risk Areas & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Reanimated plugin conflicts with Expo SDK | Medium | High | Pin to Expo-compatible version; check Expo compatibility table before install |
| Expo tabs template changes between SDK versions | Low | Medium | Lock Expo SDK version; test immediately after scaffold |

---

## Phase 2: Audio Engine (3-5 days)

**Dependencies:** Phase 1 complete (store skeleton, dependencies installed, permissions configured)
**Branch:** `feature/audio-engine`

### Tasks

#### 2.1 Audio Service Initialization

Create `services/audioService.ts` that wraps the `expo-av` Audio.Sound API into a singleton service class.

```typescript
class AudioService {
  private sound: Audio.Sound | null = null;

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }
}
```

**Acceptance Criteria:**
- [ ] `AudioService` class exists with `initialize()` method
- [ ] Audio mode is configured for background playback
- [ ] Service is a singleton (only one instance exists)
- [ ] No audio plays yet; initialization is silent

**Expected Commit:**
```
feat: add audio service with expo-av initialization
```

#### 2.2 HLS Stream Loading

Load the BonnyTone Radio HLS stream and prepare it for playback.

- **Stream URL:** `https://bonnytone.com/stream/hls/btradio/live.m3u8`

**Acceptance Criteria:**
- [ ] `Audio.Sound.createAsync()` loads the HLS stream URL without error
- [ ] Playback status callback is registered
- [ ] Stream loads within 5 seconds on a stable connection
- [ ] Error is caught and logged if the stream is unreachable

**Expected Commit:**
```
feat: implement HLS stream loading and playback
```

#### 2.3 Play/Pause Wired to Zustand Store

Connect the audio service to the Zustand player store so that UI actions trigger audio playback.

**Acceptance Criteria:**
- [ ] Calling `store.play()` starts audio playback
- [ ] Calling `store.pause()` pauses audio playback
- [ ] `store.isPlaying` reflects the actual playback state
- [ ] `store.isBuffering` is true while the stream is loading

**Expected Commit:**
```
feat: wire play/pause controls to player store
```

#### 2.4 Background Audio

Ensure audio continues playing when the app is sent to the background or the device is locked.

**Acceptance Criteria:**
- [ ] Audio continues for 10+ minutes with the app backgrounded on iOS
- [ ] Audio continues for 10+ minutes with the app backgrounded on Android
- [ ] Audio resumes correctly when returning to the foreground
- [ ] `staysActiveInBackground: true` and `playsInSilentModeIOS: true` are configured

**Expected Commit:**
```
feat: configure background audio for iOS and Android
```

#### 2.5 Lock Screen Controls

Display media controls on the lock screen and notification shade using playback status updates.

**Acceptance Criteria:**
- [ ] Lock screen shows play/pause control on iOS
- [ ] Notification shade shows media controls on Android
- [ ] Tapping play/pause on lock screen toggles playback
- [ ] Track title and artist display on lock screen (once metadata is available)

**Expected Commit:**
```
feat: add lock screen media controls with metadata
```

#### 2.6 Auto-Reconnect With Exponential Backoff

Implement reconnection logic when the stream drops unexpectedly.

**Backoff schedule:** 1s, 2s, 4s, 8s, 16s, 30s (capped), max 10 attempts.

```typescript
const BACKOFF_BASE = 1000;
const BACKOFF_MAX = 30000;
const MAX_ATTEMPTS = 10;

function getBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_BASE * Math.pow(2, attempt), BACKOFF_MAX);
}
```

**Acceptance Criteria:**
- [ ] Stream automatically reconnects after a network drop
- [ ] Backoff delays follow the schedule: 1s, 2s, 4s, 8s, 16s, 30s, 30s...
- [ ] Reconnection stops after 10 failed attempts
- [ ] `store.isConnected` updates to reflect connection state
- [ ] Successful reconnection resets the attempt counter
- [ ] User sees a "Reconnecting..." state in the UI (once UI is built)

**Expected Commit:**
```
feat: implement auto-reconnect with exponential backoff
```

### Risk Areas & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| HLS stream not supported on Android emulator | Medium | High | Test on real Android device early; fall back to Icecast MP3 stream if needed |
| Background audio killed by OS battery optimization | Medium | High | Add Android foreground service; document iOS background mode requirements |
| expo-av Audio.Sound memory leak on repeated create/destroy | Low | Medium | Reuse single Sound instance; call `unloadAsync()` before creating new instance |
| Lock screen controls not appearing | Medium | Medium | May require `expo-music-controls` or native module; evaluate in first 2 days |

---

## Phase 3: Mobile Features (3-5 days)

**Dependencies:** Phase 2 complete (audio engine functional, play/pause working, background audio confirmed)
**Branch:** `feature/now-playing`, `feature/volume-control`

> **Parallel Work Opportunity:** Tasks 3.1 (metadata polling) and 3.4 (volume control) can be developed in parallel on separate branches since they have no interdependencies.

### Tasks

#### 3.1 Now-Playing Metadata Polling

Poll the AzuraCast API every 15 seconds to fetch the currently playing track.

- **Endpoint:** `https://bonnytone.com/api/azuracast/nowplaying/btradio`
- **Polling interval:** 15 seconds

**Acceptance Criteria:**
- [ ] Metadata is fetched every 15 seconds while the app is in the foreground
- [ ] Polling pauses when the app is backgrounded (to conserve battery)
- [ ] `store.trackTitle`, `store.artistName`, and `store.artworkUrl` update on each poll
- [ ] `store.isLive` and `store.listenerCount` update from API response
- [ ] API errors are caught silently (do not crash the app or interrupt playback)
- [ ] Stale metadata is displayed rather than blank fields if a poll fails

**Expected Commit:**
```
feat: add now-playing metadata polling service
```

#### 3.2 Bluetooth Audio Routing

Verify that Bluetooth audio routing works correctly through the OS-level audio session.

**Acceptance Criteria:**
- [ ] Audio routes to connected Bluetooth headphones/speakers automatically
- [ ] Disconnecting Bluetooth pauses playback (standard OS behavior)
- [ ] Reconnecting Bluetooth does not auto-resume (user must press play)
- [ ] No custom Bluetooth code is needed (handled by expo-av audio mode)

**Expected Commit:**
```
feat: handle bluetooth audio routing and disconnection
```

#### 3.3 Phone Call / System Interruption Handling

Handle audio interruptions from phone calls, alarms, Siri, and other system events.

**Acceptance Criteria:**
- [ ] Incoming phone call pauses playback
- [ ] Ending the phone call resumes playback automatically
- [ ] Siri activation pauses and resumes playback
- [ ] Alarm/timer audio ducks the stream (lowers volume) rather than pausing
- [ ] `shouldDuckAndroid: true` is configured for Android interruptions

**Expected Commit:**
```
feat: handle phone call and system interruptions
```

#### 3.4 Volume Control Integration

Implement a volume control that adjusts the audio output level through the Zustand store.

**Acceptance Criteria:**
- [ ] `store.setVolume(0.0 - 1.0)` adjusts audio output level
- [ ] Volume change is applied to the active Sound instance in real time
- [ ] Volume persists across play/pause cycles
- [ ] Hardware volume buttons still work independently (OS-level control)
- [ ] Mute sets volume to 0.0 and unmute restores previous level

**Expected Commit:**
```
feat: implement volume slider with mute toggle
```

### Risk Areas & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AzuraCast API rate limiting or downtime | Low | Medium | Cache last successful response; show stale data with "last updated" indicator |
| Metadata polling drains battery in background | Medium | Medium | Stop polling when app is backgrounded; use `AppState` listener |
| Phone call interruption behavior varies by Android OEM | Medium | Medium | Test on Samsung, Pixel, and OnePlus; document OEM-specific quirks |
| Bluetooth disconnect event not firing on some devices | Low | Low | Rely on OS default behavior; do not add custom Bluetooth handling |

---

## Phase 4: UI Implementation (5-7 days)

**Dependencies:** Phase 2 complete (audio engine), Phase 3 complete (metadata + volume)
**Branch:** `feature/player-ui`

> **Parallel Work Opportunity:** Tasks 4.1-4.3 (layout, play button, gradient) can be started as soon as Phase 2 is complete. Tasks 4.4-4.5 (now-playing display, stream status) require Phase 3 metadata polling. The UI branch can be worked on in parallel with Phase 3 by using mock data initially.

### Tasks

#### 4.1 Full-Screen Player Layout

Build the main player screen with a glass-morphism design. This is the single primary screen of the app.

**Acceptance Criteria:**
- [ ] Player occupies the full screen with no visible navigation chrome
- [ ] Glass-morphism effect is visible (blurred translucent panels over gradient)
- [ ] Layout is responsive across iPhone SE (375pt), iPhone 15 (393pt), and standard Android sizes
- [ ] Safe area insets are respected (notch, Dynamic Island, Android status bar)

**Expected Commit:**
```
feat: implement full-screen player layout
```

#### 4.2 Glass Play Button With Pulse Animation

Create the central play/pause button with a glass effect and animated pulse ring.

```typescript
// Pulse animation pseudocode
const pulseScale = useSharedValue(1);
const pulseOpacity = useSharedValue(0.6);

// When playing: ring pulses outward continuously
// When paused: ring is static, full opacity
```

**Acceptance Criteria:**
- [ ] Button is circular, centered, with a translucent glass fill
- [ ] Play icon (triangle) and pause icon (two bars) toggle based on `store.isPlaying`
- [ ] Pulse ring animates outward when playing (scale 1.0 to 1.4, opacity 0.6 to 0.0)
- [ ] Pulse animation loops continuously while playing
- [ ] Animation stops when paused
- [ ] Button responds to tap within 100ms (no perceived lag)
- [ ] All animations use `react-native-reanimated` (run on UI thread)

**Expected Commit:**
```
feat: add glass play button with pulse animation
```

#### 4.3 Animated Gradient Background

Implement a smoothly animating gradient that shifts colors over time.

**Acceptance Criteria:**
- [ ] Background displays a multi-color gradient using `expo-linear-gradient`
- [ ] Colors animate smoothly (interpolated via `reanimated`)
- [ ] Animation cycle is 10-20 seconds for a full color rotation
- [ ] Gradient does not cause frame drops (maintains 60fps)
- [ ] Works on both iOS and Android

**Expected Commit:**
```
feat: add animated gradient background
```

#### 4.4 Now-Playing Display

Show the currently playing track with artwork, artist name, and track title.

**Acceptance Criteria:**
- [ ] Artwork image renders at 300x300pt with rounded corners
- [ ] Artist name displays below artwork in secondary text style
- [ ] Track title displays below artist in primary/bold text style
- [ ] Placeholder artwork shows when `artworkUrl` is null
- [ ] Text truncates with ellipsis for long titles (max 2 lines)
- [ ] Metadata updates smoothly (crossfade or slide transition)

**Expected Commit:**
```
feat: add artwork, artist, and title display
```

#### 4.5 Stream Status Indicators

Display a LIVE badge and listener count sourced from the metadata API.

**Acceptance Criteria:**
- [ ] "LIVE" badge is visible when `store.isLive` is true
- [ ] Badge pulses or glows to indicate live status
- [ ] Listener count displays as "X listeners" text
- [ ] Listener count updates every 15 seconds (in sync with metadata polling)
- [ ] Badge hides gracefully when stream is offline

**Expected Commit:**
```
feat: add live badge and listener count
```

#### 4.6 Action Bar (Share, Quality Selector)

Add a row of action buttons below the player controls.

**Share:** Uses React Native Share API to share a link to BonnyTone Radio.
**Quality Selector:** Allows switching between stream quality options (if available).

**Acceptance Criteria:**
- [ ] Share button opens the native share sheet with a predefined message and URL
- [ ] Share sheet works on both iOS and Android
- [ ] Quality selector opens a bottom sheet or modal with stream options
- [ ] Selected quality is persisted in the store
- [ ] Actions are accessible (minimum 44x44pt touch targets)

**Expected Commit:**
```
feat: add share button and quality selector
```

#### 4.7 Loading States

Display appropriate UI feedback for buffering, connecting, and offline states.

| State | UI Treatment |
|-------|-------------|
| Buffering | Spinning indicator over play button, "Buffering..." text |
| Connecting | "Connecting..." text, animated dots |
| Offline | "Offline" badge, retry button |
| Reconnecting | "Reconnecting (attempt X/10)..." text |

**Acceptance Criteria:**
- [ ] Buffering spinner appears within 500ms of stream loading
- [ ] "Connecting..." text shows before first playback
- [ ] "Offline" badge and retry button appear after max reconnect attempts exhausted
- [ ] Retry button resets the reconnect counter and attempts connection
- [ ] Transitions between states are smooth (no layout jumping)

**Expected Commit:**
```
feat: add buffering spinner and offline states
```

### Risk Areas & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Glass-morphism blur performance on older Android devices | High | Medium | Use `@react-native-community/blur` with fallback to semi-transparent overlay on low-end devices |
| Reanimated gradient animation causing jank | Medium | High | Profile with Flipper/Perf Monitor; reduce animation complexity if needed; keep colors in shared values |
| 300x300pt artwork images slow to load | Medium | Low | Use `expo-image` with caching and blurhash placeholder |
| Share API differences between iOS and Android | Low | Low | Test on both platforms; use simple text + URL format for maximum compatibility |

---

## Phase 5: Testing & Polish (3-5 days)

**Dependencies:** All previous phases complete (full app functionality)
**Branch:** `chore/testing`, `fix/*` (per bug)

### Tasks

#### 5.1 Unit Tests for Zustand Store Actions

Test all store actions in isolation to verify state transitions.

**Acceptance Criteria:**
- [ ] Tests cover: `play()`, `pause()`, `setVolume()`, `setMetadata()`
- [ ] Tests verify state transitions (isPlaying false -> true on play)
- [ ] Tests verify edge cases (setVolume clamped to 0.0-1.0)
- [ ] All tests pass: `npx jest store/`
- [ ] Minimum 90% coverage on `playerStore.ts`

**Expected Commit:**
```
chore: add unit tests for player store actions
```

#### 5.2 Unit Tests for Audio Service

Test the audio service logic with mocked expo-av.

**Acceptance Criteria:**
- [ ] `expo-av` is mocked (no actual audio in tests)
- [ ] Tests cover: initialize, loadStream, play, pause, reconnect
- [ ] Exponential backoff timing is verified
- [ ] Max reconnect attempts are verified
- [ ] All tests pass: `npx jest services/`

**Expected Commit:**
```
chore: add unit tests for audio service
```

#### 5.3 Component Tests

Test UI components render correctly and respond to interactions.

**Acceptance Criteria:**
- [ ] Play button toggles between play/pause icons based on store state
- [ ] Volume slider updates store value on change
- [ ] Now-playing display renders track title and artist from store
- [ ] Loading states render correctly for each connection state
- [ ] All tests pass: `npx jest components/`

**Expected Commit:**
```
chore: add component tests for play button and volume
```

#### 5.4 Device Testing

Manual testing on target devices and OS versions.

| Platform | Minimum Version | Test Devices |
|----------|----------------|--------------|
| iOS | 17.0+ | iPhone SE (3rd gen), iPhone 15 |
| Android | 14 (API 34) | Pixel 7, Samsung Galaxy S23 |

**Acceptance Criteria:**
- [ ] App installs and launches on all target devices
- [ ] Audio plays on all target devices
- [ ] Background audio works on all target devices
- [ ] Lock screen controls work on all target devices
- [ ] No crashes during 15-minute manual testing session per device

**Expected Commit:**
```
fix: <specific device/platform bug descriptions as discovered>
```

#### 5.5 Network Resilience Testing

Test the app under degraded network conditions.

**Test Scenarios:**
1. Airplane mode toggle while playing
2. Wi-Fi to cellular handoff
3. Slow 3G simulation (Network Link Conditioner / Android throttling)
4. Complete network loss for 60 seconds, then restore

**Acceptance Criteria:**
- [ ] App does not crash under any network condition
- [ ] Reconnect logic activates within 2 seconds of stream drop
- [ ] App recovers playback after network is restored
- [ ] User sees appropriate loading/reconnecting states
- [ ] No zombie audio sessions or memory leaks after repeated reconnects

**Expected Commit:**
```
fix: <specific network resilience bugs as discovered>
```

#### 5.6 Long Session Testing

Verify stability over extended playback sessions.

**Acceptance Criteria:**
- [ ] Audio plays continuously for 1+ hour without interruption
- [ ] Memory usage remains stable (no upward trend in Instruments/Profiler)
- [ ] Metadata continues updating after 1+ hour
- [ ] App remains responsive after 1+ hour (no UI freezes)
- [ ] Battery usage is reasonable (no excessive CPU in background)

**Expected Commit:**
```
fix: <specific stability bugs as discovered>
```

#### 5.7 Bug Fixes

Address all bugs discovered during testing phases 5.4-5.6.

**Acceptance Criteria:**
- [ ] All P0 (crash) and P1 (major functionality) bugs are resolved
- [ ] P2 (minor) bugs are documented in issues for post-launch
- [ ] Regression tests are added for each fixed bug
- [ ] Final build passes all unit and component tests

**Expected Commits:**
```
fix: <one commit per bug, following docs/git-flow.md conventions>
```

### Risk Areas & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| expo-av memory leak during long sessions | Medium | High | Profile memory in Instruments; call `unloadAsync()` explicitly; test 2-hour session |
| Test flakiness from async audio operations | High | Medium | Use proper async/await in tests; increase timeouts for audio-related assertions |
| Device-specific bugs discovered late | Medium | High | Start device testing on day 1 of Phase 5; keep a 2-day buffer for fixes |
| Android OEM battery optimization killing background audio | High | Medium | Document per-OEM settings (Samsung: disable battery optimization for app); add in-app guidance |

---

## Timeline Summary

| Phase | Duration | Days | Parallel Opportunities |
|-------|----------|------|----------------------|
| Phase 1: Project Setup | 1-2 days | 1-2 | None (must complete first) |
| Phase 2: Audio Engine | 3-5 days | 3-7 | None (depends on Phase 1) |
| Phase 3: Mobile Features | 3-5 days | 6-12 | Tasks 3.1 and 3.4 can run in parallel |
| Phase 4: UI Implementation | 5-7 days | 8-17 | Tasks 4.1-4.3 can start during Phase 3 (use mock data) |
| Phase 5: Testing & Polish | 3-5 days | 15-20 | Tasks 5.1-5.3 can run in parallel |

**Critical Path:** Phase 1 -> Phase 2 -> Phase 3/4 (partial overlap) -> Phase 5

### Parallel Work Diagram

```
Week 1          Week 2          Week 3          Week 4
|--- Phase 1 ---|
                |------- Phase 2 -------|
                                |--- Phase 3 ---|
                                |-------- Phase 4 --------|
                                                    |--- Phase 5 ---|
```

Phases 3 and 4 overlap because UI layout and animations (4.1-4.3) do not depend on metadata polling (3.1). Mock data can be used until Phase 3 is merged.

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
