# BonnyTone Radio Mobile Application
Claude Code Multi-Agent Development Specification — UPDATED v2.0

Project: BonnyTone Radio Mobile App
Platforms: iOS, Android
Framework: React Native (Expo)
Reference: Web app at [bonnytone.com](https://bonnytone.com)

---

# REVISION SUMMARY

This updated specification incorporates technical details from the BonnyTone web application implementation, filling critical gaps identified during architecture review.

**Key Changes:**
- Added streaming architecture specifications from production web app
- Defined state management structure (Zustand store schema)
- Specified HLS.js configuration optimized for mobile streaming
- Clarified technology stack (replaced Expo AV with expo-av + native fallbacks)
- Added concrete error handling and reconnection strategies
- Defined UI/UX specifications with reference implementations
- Added testing acceptance criteria with measurable benchmarks
- Included agent validation checkpoints

---

# 1. Project Overview

The goal of this project is to build a native mobile application for BonnyTone Radio using React Native with Expo.

**BonnyTone Radio** is a 24/7 internet radio station streaming curated DJ mixes including house, deep house, tech house, progressive, breaks, and electronic music.

**Reference Web Application:** The web app at [bonnytone.com](https://bonnytone.com) uses Next.js 13, HLS.js, and Web Audio API. The mobile app should deliver the same streaming quality and reliability while being optimized for mobile UX.

The mobile application must deliver:

- High quality radio streaming (HLS adaptive bitrate)
- Modern full screen player with glass-morphism design
- Dynamic animated background (audio-reactive or gradient-based)
- Stable playback even on unstable internet (auto-reconnect, buffering)
- Native mobile integrations (background audio, lock screen, Bluetooth)
- Offline resilience with graceful error recovery

Authentication from the web application will NOT be implemented in version 1.0.0.

---

# 2. Streaming Architecture Specification

## 2.1 Stream Details

**Source:** AzuraCast streaming server (Liquidsoap + HLS output)

| Specification | Value |
|---------------|-------|
| **Stream URL** | `https://bonnytone.com/stream/hls/btradio/live.m3u8` |
| **Protocol** | HLS (HTTP Live Streaming) |
| **Codec** | AAC-LC (universally supported) |
| **Segment Duration** | 4 seconds |
| **Playlist Depth** | 5 segments (20s buffer available) |

## 2.2 Bitrate Ladder (Adaptive Streaming)

| Tier | Bitrate | Sample Rate | Use Case |
|------|---------|-------------|----------|
| Low | 48 kbps AAC-LC | 44.1 kHz | Very slow connections (2G, poor WiFi) |
| Medium | 128 kbps AAC-LC | 44.1 kHz | Standard listening (default start) |
| High | 256 kbps AAC-LC | 44.1 kHz | High quality on fast connections |

**Why AAC-LC:**
- Decoded natively by iOS and Android
- Smallest codec overhead for mobile data usage
- Best compatibility across all devices including older phones
- Safari/iOS plays HLS with AAC natively without JavaScript library

## 2.3 Metadata Protocol

**Now-Playing Metadata API:**
- URL: `https://bonnytone.com/api/azuracast/nowplaying/btradio`
- Format: JSON
- Polling: Every 15 seconds (mobile-optimized to reduce battery drain)
- Fields: `song.title`, `song.artist`, `song.art`, `listeners.current`, `live.is_live`

**Sample Response:**
```json
{
  "station": {
    "name": "BTRadio DJ",
    "listen_url": "https://bonnytone.com/stream/hls/btradio/live.m3u8"
  },
  "now_playing": {
    "song": {
      "title": "Deep House Mix",
      "artist": "DJ Name",
      "art": "https://bonnytone.com/api/station/1/art/12345"
    },
    "duration": 3600,
    "elapsed": 1200
  },
  "listeners": {
    "current": 42
  },
  "live": {
    "is_live": true
  }
}
```

## 2.4 Network Resilience Strategy

| Issue | Solution |
|-------|----------|
| **Bandwidth fluctuation** | HLS adaptive bitrate auto-downgrades to 48kbps on slow connections |
| **Network drop** | Auto-reconnect with exponential backoff: 1s → 2s → 4s → 8s → 30s max |
| **Segment load failure** | Retry up to 6 times per segment with 1s delays |
| **Stream goes offline** | Show "Offline" status, stop retrying after 10 attempts, allow manual retry |
| **Buffer underrun** | Maintain 30s buffer ahead, 3 segments behind live edge |

## 2.5 CORS Configuration

**Critical for mobile:** The streaming server must send CORS headers allowing mobile WebView origins:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Range
```

**Current Status:** ✅ Already configured on bonnytone.com production server

---

# 3. Project Scope

## Included

- Live radio streaming (HLS adaptive bitrate)
- Radio player interface (full-screen glass-morphism design)
- Dynamic animated background (gradient transitions or audio-reactive)
- Volume control (system volume integration)
- Cover artwork display (from now-playing metadata)
- Share functionality (native share sheet)
- Background playback (continues when app backgrounded)
- Lock screen media controls (iOS Control Center, Android notification)
- Bluetooth audio integration (headphones, speakers, car audio)
- Now-playing metadata display (artist, title, artwork)
- Listener count display
- Stream status indicator (LIVE / Connecting / Offline)
- iOS and Android builds via Expo EAS

## Excluded

- User authentication (no login/register)
- User accounts
- Favorites feature
- Mini player (app is single-screen player)
- Offline downloads
- Playlists
- Equalizer (defer to v2.0)
- Chat functionality
- Schedule/calendar view

---

# 4. Mandatory Radio Application Features

## 4.1 Background Audio Playback

**Requirements:**
- Playback continues when switching apps
- Playback continues when device screen locks
- Playback resumes when returning to app
- Interruptions handled gracefully (phone calls, Siri, other media)

**Implementation:**
- iOS: Configure Audio Session with `AVAudioSessionCategoryPlayback`
- Android: Foreground service with MediaSession
- React Native: `expo-av` with `staysActiveInBackground: true`

**Acceptance Criteria:**
- [ ] Audio plays continuously for 1+ hour with screen locked
- [ ] Audio resumes after phone call interruption
- [ ] No battery drain warnings from OS

## 4.2 Lock Screen Media Controls

**Platforms:**
- iOS: Control Center and Lock Screen
- Android: Notification Media Controls

**Controls Required:**
- Play/Pause toggle
- Stream title (artist - track name)
- Station artwork (album art from metadata)

**Optional (future):**
- Open app action
- Next/Previous (if multiple stations added later)

**Acceptance Criteria:**
- [ ] Lock screen shows BonnyTone branding and current track
- [ ] Play/Pause buttons work from lock screen
- [ ] Artwork updates when track changes

## 4.3 Bluetooth and External Audio Devices

**Supported Devices:**
- Bluetooth headphones (AirPods, etc.)
- Bluetooth speakers
- Car audio systems (Bluetooth)
- Wired headphones

**Expected Behavior:**
- Playback routes automatically to connected device
- Headset play/pause buttons control player
- Metadata displayed where supported (Bluetooth AVRCP)

**Optional Future Support:**
- Apple CarPlay
- Android Auto

**Acceptance Criteria:**
- [ ] Audio routes to Bluetooth device automatically
- [ ] Headset buttons control playback
- [ ] Disconnecting headphones pauses playback

---

# 5. Technology Stack

## Core Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React Native + Expo | Expo SDK 51+ |
| **Language** | TypeScript | 5.x |
| **Audio Engine** | expo-av | Latest |
| **HLS Parsing** | Native (iOS AVPlayer, Android ExoPlayer) | Built-in |
| **State Management** | Zustand | 4.x |
| **Navigation** | expo-router | Latest |
| **Animations** | react-native-reanimated | 3.x |
| **Share** | expo-sharing | Latest |

## Why This Stack?

**Expo AV + Native Players:**
- ✅ Supports HLS natively on both platforms (AVPlayer on iOS, ExoPlayer on Android)
- ✅ Automatic bitrate switching built-in
- ✅ Background audio support with minimal configuration
- ✅ Lock screen controls via expo-av playback status updates
- ✅ No need for JavaScript HLS parsing (lighter bundle, better performance)

**Alternative Rejected:** `react-native-track-player`
- ❌ Requires bare React Native workflow (Expo incompatible without custom dev client)
- ❌ Additional native configuration complexity
- ✅ Expo AV is sufficient for single-stream radio app

## Recommended Libraries

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-av": "~14.0.0",
    "expo-router": "~3.5.0",
    "react-native-reanimated": "~3.10.0",
    "expo-sharing": "~12.0.0",
    "zustand": "^4.5.0",
    "expo-linear-gradient": "~13.0.0"
  }
}
```

## Testing Stack

| Purpose | Tool |
|---------|------|
| Unit Tests | Jest + React Native Testing Library |
| E2E Tests | Detox (or defer to manual testing) |
| Type Checking | TypeScript strict mode |

## Build Pipeline

| Stage | Tool |
|-------|------|
| Development Build | `expo run:ios`, `expo run:android` |
| Preview Build | EAS Build (internal distribution) |
| Production Build | EAS Build |
| App Store Submission | EAS Submit |

---

# 6. State Management Architecture

## 6.1 Player State (Zustand Store)

**File:** `store/playerStore.ts`

**State Interface:**

```typescript
export type Quality = 'auto' | 'low' | 'medium' | 'high'
export type StreamStatus = 'idle' | 'connecting' | 'live' | 'offline' | 'error'

export interface NowPlayingInfo {
  title: string
  artist: string
  art: string | null
}

export interface PlayerState {
  // Playback state
  isPlaying: boolean
  isBuffering: boolean
  volume: number              // 0-1 (system volume on mobile)
  isMuted: boolean
  previousVolume: number      // For mute toggle restoration
  quality: Quality

  // Stream status
  streamStatus: StreamStatus
  listenerCount: number | null
  nowPlaying: NowPlayingInfo | null

  // Stream quality (current)
  currentBitrate: number | null  // In bps (e.g., 128000)

  // Error handling
  errorCount: number
  lastError: string | null

  // Actions
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setQuality: (quality: Quality) => void
  setIsPlaying: (isPlaying: boolean) => void
  setIsBuffering: (isBuffering: boolean) => void
  setStreamStatus: (status: StreamStatus) => void
  setListenerCount: (count: number | null) => void
  setNowPlaying: (info: NowPlayingInfo | null) => void
  setCurrentBitrate: (bitrate: number | null) => void
  setError: (error: string | null) => void
  incrementErrorCount: () => void
  resetErrorCount: () => void
  hydrateVolume: () => void   // Load persisted volume from AsyncStorage
}
```

**Key Design Decisions:**
- Single global store (no context provider needed)
- Persistent volume via AsyncStorage (survives app restarts)
- Error count tracking for retry logic
- Separate buffering state from playing state (for UI spinner)

## 6.2 State Machine

**Player States:**

```
IDLE → CONNECTING → LIVE → [PAUSED | BUFFERING | ERROR]
  ↑                             ↓
  └──────── OFFLINE ←──────────┘
```

**State Transitions:**

| From | To | Trigger |
|------|----|----|
| IDLE | CONNECTING | User presses play |
| CONNECTING | LIVE | First segment loaded |
| LIVE | PAUSED | User presses pause |
| LIVE | BUFFERING | Network slow, buffer empty |
| BUFFERING | LIVE | Buffer refilled |
| LIVE | ERROR | Fatal error (after retries) |
| ERROR | CONNECTING | User retries manually |
| CONNECTING | OFFLINE | 10 reconnect attempts failed |

---

# 7. UI/UX Specification

## 7.1 Design System

**Visual Style:** Glass-morphism (inspired by web app)

**Color Palette:**
- Primary: Cyan/Teal (`#06b6d4` / `#14b8a6`)
- Background: Dark gradient (`#0a0a0a` → `#1a1a1a`)
- Glass overlay: `rgba(255, 255, 255, 0.05)` with backdrop blur
- Text: White (`#ffffff`) with reduced opacity for secondary text

**Typography:**
- Headings: System font, Bold, 24-32pt
- Body: System font, Regular, 16pt
- Metadata: System font, Medium, 14pt

## 7.2 Screen Layout (Single Screen App)

**Full-Screen Player:**

```
┌─────────────────────────────┐
│   BonnyTone Radio (Logo)    │ ← Header bar (glass overlay)
│   [Live Badge] 42 listeners │
├─────────────────────────────┤
│                             │
│   Animated Background       │ ← Gradient or waveform
│   (Gradient transitions)    │
│                             │
│   ┌───────────────────┐     │
│   │                   │     │
│   │   Album Artwork   │     │ ← Now-playing cover art
│   │   (512x512)       │     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   DJ Name                   │ ← Artist name
│   Track Title               │ ← Song title
│                             │
│   ┌─────────────────┐       │
│   │   ▶ / ⏸ Button │       │ ← Large glass play button
│   └─────────────────┘       │
│                             │
│   ────●──────────────       │ ← Volume slider
│   [🔇] [🔊]                  │
│                             │
│   [Share] [Quality] [More]  │ ← Action buttons
└─────────────────────────────┘
```

**Component Breakdown:**

| Component | Description |
|-----------|-------------|
| **Header** | Glass overlay bar with logo, live badge, listener count |
| **Background** | Animated gradient or audio-reactive visualization |
| **Artwork** | Rounded square image with shadow, 300x300pt display size |
| **Metadata** | Artist name (bold) and track title (regular) |
| **Play Button** | Large circular button with glass effect, play/pause icon, pulse animation when playing |
| **Volume Control** | Horizontal slider with mute/unmute buttons |
| **Action Bar** | Share, Quality selector, More menu (future: EQ, etc.) |

## 7.3 Dynamic Background Options

**Option A (Simple - Recommended for v1.0):**
- Slow gradient animation transitioning between 3-4 colors
- No audio reactivity needed
- Low CPU usage, smooth on all devices
- Implementation: `expo-linear-gradient` with `react-native-reanimated`

**Option B (Advanced - Defer to v1.1):**
- Audio-reactive visualizer using FFT analysis
- Requires `expo-av` audio metering API
- Higher CPU usage, test on mid-range devices
- Fallback to Option A on low-end devices

**Decision:** Start with Option A. Ship fast, iterate later.

## 7.4 Loading States

| State | UI Behavior |
|-------|-------------|
| `isBuffering: true` | Play button shows spinner overlay |
| `streamStatus: 'connecting'` | "Connecting..." text below play button |
| `streamStatus: 'offline'` | "Offline" badge, play button disabled, "Retry" button shown |
| `streamStatus: 'error'` | Error icon, error message, "Retry" button |

## 7.5 Share Functionality

**Implementation:**
- Use React Native `Share` API (built-in)
- Share text: "Listen to BonnyTone Radio – 24/7 House & Electronic Music"
- Share URL: `https://bonnytone.com`
- On iOS: Native share sheet with AirDrop, Messages, etc.
- On Android: Native share sheet with apps

**Code Example:**
```typescript
import { Share } from 'react-native'

async function handleShare() {
  await Share.share({
    title: 'BonnyTone Radio',
    message: 'Listen to BonnyTone Radio – 24/7 House & Electronic Music\nhttps://bonnytone.com',
    url: 'https://bonnytone.com' // iOS only
  })
}
```

---

# 8. Multi-Agent Architecture

Development will be executed using specialized Claude Code agents with clear handoffs and validation checkpoints.

**Agents:**

1. **Architect / Research Agent** — Analyze web app, define mobile architecture
2. **Team Lead Agent** — Review and approve architecture decisions
3. **Mobile Developer Agent** — Implement the React Native app
4. **QA Engineer Agent** — Test on devices, verify quality standards
5. **App Store Preparation Agent** — Prepare metadata, screenshots, assets
6. **Deployment Agent** — Submit to App Store and Google Play

---

# 9. Architect / Research Agent

## Purpose

Analyze the BonnyTone web application and define the mobile architecture.

## Responsibilities

- ✅ Analyze the web version UI at [bonnytone.com](https://bonnytone.com)
- ✅ Inspect streaming implementation (HLS.js, Web Audio API)
- ✅ Document player behavior (play/pause, volume, reconnection)
- ✅ Define mobile architecture (React Native + Expo equivalent)
- ✅ Research streaming stability best practices for mobile
- ✅ Define state management structure (Zustand store schema)
- ✅ Specify error handling and reconnection logic
- ✅ Define testing strategy with acceptance criteria

## Outputs

The agent must generate a `/docs` folder containing:

```
docs/
├── architecture.md            # System architecture diagram, tech stack justification
├── implementation-plan.md     # Phase-by-phase development plan with timeline
├── component-structure.md     # Component hierarchy, props, state flow
├── streaming-integration.md   # HLS setup, expo-av configuration, error handling
├── state-management.md        # Zustand store schema, actions, persistence
├── testing-strategy.md        # Unit/E2E test plan, device testing matrix
└── store-release-guide.md     # App Store / Play Store requirements, assets
```

## Success Criteria

Architecture is complete when all of the following are delivered:

- [x] **Streaming Architecture:** HLS URL, bitrate tiers, codec specs, CORS requirements
- [x] **State Management:** Complete Zustand store TypeScript interface
- [x] **Component Hierarchy:** Diagram showing all components and data flow
- [x] **Error Handling:** State machine diagram with all error states and recovery paths
- [x] **Performance Targets:** Defined benchmarks (e.g., "stream starts in <3s on 4G")
- [x] **Dependency Justification:** Explanation for each npm package choice
- [x] **Mobile-Specific Considerations:** Background audio, lock screen, interruptions
- [x] **Testing Matrix:** List of devices and OS versions to test

---

# 10. Team Lead Agent

## Purpose

Review and validate architecture decisions from Architect Agent.

## Responsibilities

- Review architecture documents for completeness
- Validate streaming implementation approach (HLS + expo-av)
- Validate state management structure (Zustand store schema)
- Confirm component structure is scalable and maintainable
- Confirm performance strategy (buffer sizes, reconnection logic)
- Verify all mandatory features are addressed (background audio, lock screen, Bluetooth)
- Check for over-engineering (reject unnecessary complexity)

## Approval Checklist

Architecture is approved when:

- [ ] All streaming specs are production-ready (URL, bitrate, metadata API)
- [ ] State management handles all edge cases (interruptions, errors, offline)
- [ ] Component structure follows React Native best practices
- [ ] Error handling covers all failure modes with user-friendly recovery
- [ ] Testing strategy covers network scenarios (slow 3G, offline, reconnect)
- [ ] Performance targets are measurable and realistic
- [ ] Dependencies are minimal, well-maintained, and properly licensed
- [ ] No microservices, Kafka, Elasticsearch, or other over-engineering
- [ ] Mobile-specific requirements are addressed (iOS Audio Session, Android foreground service)

## Possible Outcomes

1. **Approve Implementation** — Developer agent can proceed
2. **Request Revisions** — Architect agent must address specific concerns (list provided)

---

# 11. Mobile Developer Agent

## Purpose

Implement the mobile application following the approved architecture.

## Responsibilities

### Phase 1: Project Initialization

```bash
npx create-expo-app@latest bonnytone-radio --template tabs
cd bonnytone-radio
npx expo install expo-av expo-router react-native-reanimated expo-sharing expo-linear-gradient zustand
```

**Setup:**
- Configure TypeScript strict mode
- Set up Zustand store with PlayerState interface
- Configure expo-av for background audio
- Set up app.json with proper audio permissions

### Phase 2: Audio Engine Implementation

**Implement:**
- Audio service using expo-av Audio.Sound API
- HLS stream loading with native player (no HLS.js needed on mobile)
- Play/pause controls wired to Zustand store
- Volume control (system volume on mobile)
- Background audio configuration (iOS Audio Session, Android foreground service)
- Lock screen controls via expo-av playback status updates
- Bluetooth audio routing (automatic via OS)

**File:** `services/audioService.ts`

**Key Functions:**
- `initializeAudio()` — Create Audio.Sound instance with staysActiveInBackground
- `play()` — Load HLS stream, start playback
- `pause()` — Pause playback, keep stream loaded
- `handleInterruption()` — Resume after phone call, Siri, etc.
- `updateNowPlayingInfo()` — Update lock screen metadata

### Phase 3: UI Implementation

**Implement:**
- Full-screen player layout (following UI/UX spec section 7)
- Glass-morphism components (play button, action bar, header)
- Animated gradient background (expo-linear-gradient + reanimated)
- Now-playing metadata display (artist, title, artwork)
- Loading states (buffering spinner, connecting text, offline badge)
- Share button (React Native Share API)
- Quality selector (manual bitrate override if supported by expo-av)
- Listener count display (polled from API)

**Components:**
```
screens/
└── PlayerScreen.tsx          # Main screen
components/
├── PlayerBackground.tsx      # Animated gradient
├── PlayButton.tsx            # Large glass play/pause button
├── NowPlaying.tsx            # Artwork, artist, title
├── VolumeControl.tsx         # Volume slider
├── ActionBar.tsx             # Share, quality, more buttons
└── StreamStatus.tsx          # Live badge, listener count
```

### Phase 4: Networking & Error Handling

**Implement:**
- Now-playing metadata polling (every 15s)
- Auto-reconnect logic with exponential backoff
- Network error handling (segment failures, stream offline)
- Stream status updates (connecting, live, offline, error)
- Graceful degradation (show last known metadata if API fails)

**File:** `hooks/useNowPlaying.ts`

### Phase 5: Testing

**Write Tests:**
- Unit tests for Zustand store actions
- Unit tests for audio service functions
- UI component tests (play button, volume slider)
- Integration tests (play → pause → resume flow)
- Mock audio playback for Jest tests

**Manual Testing:**
- Test on iOS Simulator and Android Emulator
- Test on real iOS device (required for background audio testing)
- Test on real Android device (required for lock screen testing)
- Test network scenarios (airplane mode, slow 3G)
- Test interruptions (phone call, Siri, other apps)
- Test long sessions (1+ hour playback)

---

# 12. QA Engineer Agent

## Purpose

Verify application quality and stability across devices and network conditions.

## Testing Matrix

### Devices

| Platform | Device | OS Version |
|----------|--------|------------|
| iOS | iPhone SE 3 | iOS 17.x |
| iOS | iPhone 15 Pro | iOS 17.x |
| Android | Pixel 7 | Android 14 |
| Android | Samsung Galaxy S23 | Android 14 |

### Testing Areas

#### 1. Streaming Playback

| Test Case | Expected Behavior | Acceptance Criteria |
|-----------|-------------------|---------------------|
| Start playback | Audio starts within 3 seconds on WiFi | ✅ Stream plays, no errors |
| Pause playback | Audio stops immediately, stream stays loaded | ✅ Instant pause, no delay |
| Resume playback | Audio resumes from live edge (not cached position) | ✅ Resumes within 1 second |
| Network drop (airplane mode) | Buffering indicator shows, auto-reconnect when back online | ✅ Reconnects within 5s |
| Stream offline | "Offline" status shows, retry button appears | ✅ User can manually retry |

#### 2. Background Audio Behavior

| Test Case | Expected Behavior | Acceptance Criteria |
|-----------|-------------------|---------------------|
| Switch to another app | Audio continues playing | ✅ No interruption |
| Lock screen | Audio continues, lock screen controls appear | ✅ Controls show artist/title/artwork |
| Lock screen play/pause | Buttons control playback | ✅ Instant response |
| Disconnect Bluetooth headphones | Audio pauses automatically | ✅ Pauses gracefully |
| Phone call interruption | Audio pauses, resumes after call ends | ✅ Auto-resume works |

#### 3. UI / UX

| Test Case | Expected Behavior | Acceptance Criteria |
|-----------|-------------------|---------------------|
| Play button animation | Pulses when playing, static when paused | ✅ Smooth 60fps animation |
| Buffering state | Spinner overlay on play button | ✅ Visible during buffering |
| Metadata updates | Artist/title/artwork update when track changes | ✅ Updates within 15s |
| Share button | Native share sheet opens | ✅ Works on iOS and Android |
| Volume slider | Changes system volume | ✅ Real-time volume adjustment |

#### 4. Network Resilience Testing

| Network Condition | Expected Behavior | Acceptance Criteria |
|-------------------|-------------------|---------------------|
| WiFi (50 Mbps) | Streams at 256kbps (high quality) | ✅ No buffering |
| 4G LTE | Streams at 128kbps (medium quality) | ✅ Occasional bitrate switch |
| 3G (3 Mbps) | Streams at 48kbps (low quality) | ✅ Stable playback, no gaps |
| Unstable connection (intermittent) | Buffers gracefully, auto-reconnects | ✅ No crashes, <5s recovery |
| Airplane mode → WiFi on | Reconnects automatically | ✅ Resumes within 5s |

#### 5. Long Session Stability

| Test Case | Expected Behavior | Acceptance Criteria |
|-----------|-------------------|---------------------|
| 1 hour playback (WiFi) | No crashes, no audio drift | ✅ Stable |
| 4 hour playback (WiFi) | No crashes, no memory leak | ✅ Memory usage <100MB |
| Overnight playback (8 hours) | Continuous playback (optional test) | ✅ No crashes |

## Bug Reporting

When bugs are found, report with:

1. **Device & OS:** e.g., "iPhone 15 Pro, iOS 17.4"
2. **Network:** e.g., "WiFi", "4G", "Airplane mode"
3. **Steps to Reproduce:** Numbered list
4. **Expected vs Actual:** Clear description
5. **Logs:** Console errors if available
6. **Severity:** Critical / High / Medium / Low

## Sign-Off Criteria

QA approves when:

- [ ] All streaming playback tests pass on 2+ devices per platform
- [ ] Background audio works on real iOS and Android devices
- [ ] Lock screen controls work on both platforms
- [ ] Network resilience tests show graceful degradation (no crashes)
- [ ] Long session test (1+ hour) passes on 2 devices
- [ ] No critical or high severity bugs remain
- [ ] All UI elements are functional and match design spec

---

# 13. App Store Preparation Agent

## Purpose

Prepare all metadata and assets required for App Store and Google Play submission.

## Responsibilities

- Generate store metadata (name, description, keywords)
- Define screenshot requirements (devices, screens to capture)
- Prepare app icons (1024x1024 for iOS, 512x512 for Android)
- Create feature graphic (Google Play)
- Write release notes
- Prepare submission checklist

## Outputs

### App Store Metadata (`store-metadata/ios.md`)

**App Name:** BonnyTone Radio

**Subtitle:** 24/7 House & Electronic Music

**Keywords:**
```
electronic music, house music, deep house, tech house, radio, dj mixes, dance music, club music, live radio, streaming radio
```

**Description:**
```
BonnyTone Radio is a 24/7 online radio station dedicated to house, deep house, tech house, progressive, and electronic music.

Stream curated DJ mixes and live sets from Miami and around the world. Our station broadcasts non-stop electronic music for dance music lovers and club music enthusiasts.

Features:
• High quality live streaming (adaptive bitrate for any connection)
• Full-screen radio player with dynamic visuals
• Background playback (listen while using other apps)
• Lock screen controls (play/pause without unlocking your phone)
• Now playing info with artist, track, and cover art
• Share your favorite station with friends
• Works on WiFi, 4G, and 3G connections

Whether you're working, working out, or relaxing, BonnyTone Radio delivers the best house and electronic music 24/7.

No login required. Just tap play and enjoy.
```

**Category:** Music

**Age Rating:** 4+ (no explicit content)

**Support URL:** https://bonnytone.com

**Privacy Policy URL:** https://bonnytone.com/privacy

### Google Play Metadata (`store-metadata/android.md`)

**App Name:** BonnyTone Radio

**Short Description:**
```
24/7 House & Electronic Music — Live Radio Streaming
```

**Full Description:**
```
(Same as iOS description above)
```

**Category:** Music & Audio

**Content Rating:** Everyone

## Asset Requirements

### App Icons

| Platform | Size | Format | Notes |
|----------|------|--------|-------|
| iOS | 1024x1024 | PNG | No alpha channel, no rounded corners |
| Android | 512x512 | PNG | Can have transparency |

**Design Brief:**
- BonnyTone logo (stylized "BT" or station branding)
- Cyan/teal color scheme matching web app
- Clean, modern, recognizable at small sizes

### Screenshots

**Required Screens to Capture:**

| Screen | Description | Notes |
|--------|-------------|-------|
| **Player (Playing)** | Full screen player with play button active, pulse animation visible | Show "LIVE" badge, listener count, artwork |
| **Player (Metadata Visible)** | Same screen but with different artist/track to show variety | Use a well-known DJ name if possible |
| **Share Sheet** | Tap share button, show native share sheet overlay | iOS and Android versions |
| **Background Playback** | Lock screen with BonnyTone controls visible | Requires real device photo |

**Screenshot Sizes:**

**iOS:**
- 6.7" (iPhone 15 Pro Max): 1290x2796
- 6.5" (iPhone 11 Pro Max): 1242x2688
- 5.5" (iPhone 8 Plus): 1242x2208

**Android:**
- Phone: 1080x1920 or higher
- 7" Tablet: 1200x1920 or higher
- 10" Tablet: 1600x2560 or higher

### Feature Graphic (Google Play Only)

- Size: 1024x500 pixels
- Format: PNG or JPEG
- Content: BonnyTone branding with tagline "24/7 House & Electronic Music"

## Privacy Policy Requirements

**Data Collection (for disclosure):**

BonnyTone Radio v1.0 collects:
- ❌ No user accounts
- ❌ No personal information
- ❌ No location data
- ❌ No analytics (if no analytics SDK added)
- ✅ Streaming logs (IP address, user agent) — server-side only

**Privacy Policy Content:**

```markdown
# Privacy Policy

BonnyTone Radio does not collect personal information.

When you stream audio, your device connects to our streaming server.
Our server logs include your IP address and device type for technical
purposes only (stream delivery, error diagnostics). We do not store
or sell this information.

We do not use analytics, tracking, or advertising SDKs in this app.

For questions, contact: privacy@bonnytone.com
```

**Action Required:** Create privacy policy page at `https://bonnytone.com/privacy`

## Release Notes Template

**Version 1.0.0 (Initial Release)**

```
Welcome to BonnyTone Radio!

Stream 24/7 house and electronic music on your phone.

Features:
• Live streaming with adaptive quality
• Background playback
• Lock screen controls
• Now playing info with artwork
• Share station with friends

Just tap play and enjoy!
```

## Submission Checklist

- [ ] App icons generated (1024x1024 iOS, 512x512 Android)
- [ ] 3-5 screenshots captured per platform
- [ ] Feature graphic created (Android)
- [ ] App metadata written (name, description, keywords)
- [ ] Privacy policy published at bonnytone.com/privacy
- [ ] Support URL confirmed (bonnytone.com)
- [ ] Age rating determined (4+ / Everyone)
- [ ] Category selected (Music)
- [ ] Release notes written
- [ ] Test builds installed on real devices and verified
- [ ] QA sign-off received

---

# 14. Deployment Agent

## Purpose

Submit application to App Store Connect and Google Play Console.

## Prerequisites

- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App icons, screenshots, metadata prepared
- [ ] Privacy policy live at bonnytone.com/privacy
- [ ] QA approval received
- [ ] Expo EAS configured

## Build Commands

### iOS Build (App Store)

```bash
eas build --platform ios --profile production
```

**Required:** Apple Developer credentials, App Store Connect app created

### Android Build (Play Store)

```bash
eas build --platform android --profile production
```

**Required:** Google Play Console app created, upload signing key configured

## Submission Steps

### iOS (App Store Connect)

1. Create app in App Store Connect
2. Upload build via EAS Submit: `eas submit --platform ios`
3. Fill in metadata (name, description, keywords, screenshots)
4. Set app category (Music)
5. Set age rating (4+)
6. Add privacy policy URL
7. Submit for review

**Review Time:** Typically 1-3 days

### Android (Google Play Console)

1. Create app in Play Console
2. Upload AAB via EAS Submit: `eas submit --platform android`
3. Fill in store listing (name, description, screenshots, feature graphic)
4. Set content rating (Everyone)
5. Set app category (Music & Audio)
6. Add privacy policy URL
7. Submit for review

**Review Time:** Typically few hours to 1 day

## Post-Submission Monitoring

- Check for review feedback emails
- Respond to any questions from App Store / Play Store reviewers
- Monitor crash reports (Sentry or Expo crash reporting)
- Track download stats

## Rollout Strategy

**Recommended:** Phased rollout

1. **Internal Testing:** EAS internal distribution to team members
2. **Closed Beta:** TestFlight (iOS) / Internal Testing (Android) — 10-50 testers
3. **Open Beta (optional):** TestFlight public link / Open Testing (Android)
4. **Production Release:** 100% rollout after beta period (1-2 weeks)

---

# 15. Definition of Done

## v1.0.0 Completion Checklist

The project is complete when ALL of the following are true:

### Streaming & Playback

- [ ] HLS stream plays from bonnytone.com
- [ ] Audio starts within 3 seconds on WiFi, 5 seconds on 4G
- [ ] Adaptive bitrate switches automatically (high → medium → low)
- [ ] Playback is stable for 1+ hours without glitches
- [ ] Network drops trigger auto-reconnect (max 10 attempts)
- [ ] Stream offline state shows "Offline" badge and retry button

### Audio Controls

- [ ] Play button starts playback
- [ ] Pause button stops playback
- [ ] Volume slider controls system volume (or shows "system volume" on iOS)
- [ ] Mute button mutes audio
- [ ] Quality selector allows manual override (if supported by expo-av)

### Mobile-Specific Features

- [ ] Background playback works (app backgrounded, audio continues)
- [ ] Screen lock playback works (audio continues when screen locked)
- [ ] Lock screen controls appear (iOS Control Center, Android notification)
- [ ] Lock screen shows artist, title, and artwork
- [ ] Lock screen play/pause buttons work
- [ ] Bluetooth audio routing works (headphones, speakers, car)
- [ ] Headset button controls work (play/pause)
- [ ] Phone call interruption handled (audio pauses, resumes after call)

### UI / UX

- [ ] Full-screen player matches design spec (glass-morphism)
- [ ] Dynamic background animates (gradient transitions)
- [ ] Play button has pulse animation when playing
- [ ] Buffering state shows spinner overlay
- [ ] Stream status indicator shows (LIVE / Connecting / Offline)
- [ ] Now-playing metadata displays (artist, title, artwork)
- [ ] Listener count displays in header
- [ ] Share button opens native share sheet
- [ ] All UI elements are responsive and functional

### Testing

- [ ] Tested on iOS Simulator (iPhone 15 Pro)
- [ ] Tested on real iOS device (iPhone with iOS 17+)
- [ ] Tested on Android Emulator (Pixel 7)
- [ ] Tested on real Android device (Android 13+)
- [ ] Network resilience tested (WiFi, 4G, 3G, airplane mode toggle)
- [ ] Long session tested (1+ hour on WiFi)
- [ ] No crashes, no memory leaks, no audio drift
- [ ] QA sign-off received

### Store Preparation

- [ ] App icons generated (1024x1024 iOS, 512x512 Android)
- [ ] Screenshots captured (3-5 per platform)
- [ ] App metadata written (name, description, keywords)
- [ ] Privacy policy published (bonnytone.com/privacy)
- [ ] Release notes written
- [ ] EAS builds successful (iOS and Android production builds)

### Submission

- [ ] App submitted to App Store Connect
- [ ] App submitted to Google Play Console
- [ ] Review feedback addressed (if any)
- [ ] Apps approved and live on stores

---

# 16. Risk Assessment & Mitigation

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Expo AV limitations with HLS** | Medium | High | Test early (Phase 1). If insufficient, switch to bare React Native + react-native-video |
| **Background audio not working on iOS** | Low | Critical | Configure Audio Session correctly. Test on real device early. |
| **Lock screen controls not updating** | Medium | High | Use expo-av playback status updates. Test metadata updates. |
| **Bluetooth audio routing issues** | Low | Medium | Native OS handles this. Test with AirPods, car Bluetooth. |
| **Stream offline detection** | Medium | Medium | Poll now-playing API, detect 404/500 errors, show offline state |
| **Network drops causing crashes** | Low | High | Wrap audio playback in try-catch, implement reconnect logic |
| **App rejected from App Store** | Low | High | Follow Apple guidelines, test IAP-free version, no private APIs |

## Process Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Architecture not approved by Team Lead** | Low | Medium | Architect agent must deliver complete, detailed docs. Multiple review rounds if needed. |
| **Developer agent deviates from architecture** | Medium | Medium | Team Lead agent reviews code periodically. Use architecture docs as contract. |
| **QA finds critical bugs late** | Medium | High | Test early and often. Manual testing on real devices from Phase 2 onward. |
| **App Store review delays** | High | Low | Submit 1-2 weeks before target launch date. Use phased rollout. |
| **Missing store assets at submission time** | Low | Medium | Store Prep agent works in parallel with QA (Week 3-4 of development) |

---

# 17. Timeline Estimate

| Phase | Duration | Agent | Deliverable |
|-------|----------|-------|-------------|
| **Architecture & Planning** | 3-5 days | Architect + Team Lead | Complete docs in `/docs` folder, approved architecture |
| **Phase 1: Project Setup** | 1-2 days | Mobile Developer | Expo project initialized, dependencies installed, Zustand store set up |
| **Phase 2: Audio Engine** | 3-5 days | Mobile Developer | Audio playback working (play, pause, volume, HLS streaming) |
| **Phase 3: Mobile Features** | 3-5 days | Mobile Developer | Background audio, lock screen controls, Bluetooth routing |
| **Phase 4: UI Implementation** | 5-7 days | Mobile Developer | Full-screen player, animations, metadata display, action buttons |
| **Phase 5: Testing** | 3-5 days | QA Engineer + Mobile Developer | Bug fixes, device testing, network testing, long session testing |
| **Phase 6: Store Prep** | 2-3 days | App Store Prep Agent | Icons, screenshots, metadata, privacy policy |
| **Phase 7: Submission** | 1-2 days | Deployment Agent | Builds uploaded, apps submitted to stores |
| **Review & Launch** | 1-7 days | Deployment Agent | App Store review, launch monitoring |

**Total Estimated Timeline:** 4-6 weeks (depending on complexity and bug count)

---

# 18. Success Metrics (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Crash-Free Rate** | >99% | Sentry / Expo crash reporting |
| **Average Session Duration** | >15 minutes | Analytics (if added in v1.1) |
| **Playback Failure Rate** | <1% | Error logs |
| **App Store Rating** | ≥4.5 stars | App Store / Play Store reviews |
| **Background Audio Success Rate** | >95% | User feedback, support tickets |
| **Lock Screen Controls Satisfaction** | >90% | User feedback, reviews |

---

# APPENDIX A: Reference Implementation (Web App)

The web app at [bonnytone.com](https://bonnytone.com) serves as the reference implementation. Key files to review:

| File | Purpose |
|------|---------|
| `store/playerStore.ts` | Zustand store schema (adapted for mobile) |
| `components/player/PlayerProvider.tsx` | HLS.js + Web Audio API integration (adapt to expo-av) |
| `components/radio/GlassPlayButton.tsx` | Play button with glass effect (adapt styles to React Native) |
| `components/radio/VolumeSlider.tsx` | Volume control (adapt to React Native Slider) |
| `hooks/useNowPlaying.ts` | Now-playing metadata polling (same API, adapt to React Native fetch) |
| `.env.example` | Environment variables (STREAM_URL, AZURACAST_API_URL) |
| `docs/ARCHITECTURE_REVIEW.md` | Full architecture deep dive (web context, but concepts apply) |

**Key Differences for Mobile:**
- Replace HLS.js with expo-av (native HLS player)
- Replace Web Audio API with expo-av audio graph (if needed)
- Replace CSS glass-morphism with React Native View + BlurView
- Replace `localStorage` with AsyncStorage
- Replace `navigator.mediaSession` with expo-av playback status updates

---

# APPENDIX B: Questions to Resolve Before Implementation

If any of these are unclear, stop and ask the user:

1. **Stream URL Access:** Confirm the stream URL `https://bonnytone.com/stream/hls/btradio/live.m3u8` is publicly accessible (no auth required).

2. **App Branding Assets:** Does the user have a logo, app icon design, or brand guidelines? If not, Developer Agent should use placeholder icon.

3. **Analytics:** Should we add analytics (Firebase, Amplitude, etc.) in v1.0, or defer to v1.1?

4. **Dynamic Background:** Confirm preference for Option A (gradient) vs Option B (audio-reactive). Recommendation: Option A for v1.0.

5. **Apple Developer Account:** Does the user have an active Apple Developer account? If not, this is a blocker for iOS submission.

6. **Google Play Account:** Does the user have a Google Play Developer account? If not, this is a blocker for Android submission.

7. **Privacy Policy:** Can we publish a privacy policy at `bonnytone.com/privacy`? If the user doesn't have web access, we need an alternative URL.

8. **Support Email:** What email should be listed for app support? (e.g., `support@bonnytone.com`)

---

# APPENDIX C: Changes from Original Spec

| Section | Change | Reason |
|---------|--------|--------|
| **Streaming Architecture (New Section 2)** | Added full HLS details (URL, bitrate tiers, metadata API) | Critical gap: original spec didn't specify stream source |
| **State Management (New Section 6)** | Added complete Zustand store TypeScript interface | Critical gap: state structure was undefined |
| **UI/UX Specification (New Section 7)** | Added screen layout diagram, component breakdown, design system | Gap: "modern full screen player" was too vague |
| **Technology Stack (Section 5)** | Confirmed expo-av (not Expo AV as generic term) | Clarified: expo-av supports HLS natively, no need for JS HLS parsing |
| **Testing Strategy (Section 12)** | Added testing matrix, acceptance criteria, sign-off checklist | Gap: QA section was too generic |
| **App Store Prep (Section 13)** | Added complete metadata, asset requirements, privacy policy content | Gap: metadata was present but asset requirements were missing |
| **Architecture Agent (Section 9)** | Added success criteria checklist | Gap: no validation criteria for deliverables |
| **Team Lead Agent (Section 10)** | Added approval checklist | Gap: approval process was vague |
| **Definition of Done (Section 15)** | Expanded to 40+ checkboxes covering all requirements | Gap: original DoD was high-level |

---

# FINAL RECOMMENDATIONS

1. **Start with Architecture Phase:** Do not skip to coding. The Architect Agent must deliver complete `/docs` folder before Developer Agent starts.

2. **Test on Real Devices Early:** Background audio and lock screen controls cannot be fully tested in simulators. Get real iOS and Android devices by Phase 2.

3. **Prioritize Stability Over Features:** If timeline is tight, cut the dynamic background (use static gradient) and ship a rock-solid player first.

4. **Phased Rollout:** Use TestFlight and Google Play Internal Testing for beta testing before public launch. This catches device-specific issues.

5. **Monitor Crashes:** Set up Sentry or Expo crash reporting from day 1. Mobile apps crash more than web apps due to device diversity.

6. **Defer v2.0 Features:** No authentication, no favorites, no EQ in v1.0. Ship a great radio player first, iterate later.

---

**END OF SPECIFICATION**

---

**Document Version:** 2.0 (Updated)
**Last Updated:** 2026-03-10
**Status:** Ready for Implementation
**Approval Required:** Team Lead Agent must approve before Mobile Developer Agent starts coding
