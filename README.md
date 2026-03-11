# BonnyTone Radio

A 24/7 internet radio mobile app streaming curated house, deep house, tech house, progressive, and electronic music. Built with React Native + Expo.

## Features

- **HLS adaptive streaming** — 48/128/256 kbps auto-switching based on connection quality
- **Background playback** — audio continues when the app is backgrounded or screen is locked
- **Lock screen controls** — play/pause and track metadata on iOS Control Center and Android notification shade
- **Now playing metadata** — artist, track title, and cover art updated every 15 seconds from AzuraCast API
- **Glass-morphism UI** — full-screen player with animated gradient background and pulse play button
- **Auto-reconnect** — exponential backoff (1s→30s cap, max 10 attempts) with offline state and manual retry
- **Bluetooth support** — automatic audio routing to headphones, speakers, and car audio
- **Share** — native share sheet to share the station link

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native + Expo SDK 55 |
| Language | TypeScript (strict mode) |
| Audio | expo-av (native HLS via AVPlayer / ExoPlayer) |
| State | Zustand 5.x |
| Navigation | expo-router |
| Animations | react-native-reanimated 4.x |
| Gradients | expo-linear-gradient |
| Testing | Jest + jest-expo |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator

### Install

```bash
npm install
```

### Run

```bash
npx expo start
```

Then press `i` for iOS Simulator or `a` for Android Emulator.

### Test

```bash
npm test
```

## Project Structure

```
app/                    # Expo Router pages
  _layout.tsx           # Root layout (StatusBar, Slot)
  index.tsx             # Entry → PlayerScreen

screens/
  PlayerScreen.tsx      # Main (and only) screen

components/
  PlayerBackground.tsx  # Animated gradient background
  Header.tsx            # App title bar
  NowPlaying.tsx        # Artwork + artist + title
  PlayButton.tsx        # Glass play/pause with pulse animation
  VolumeControl.tsx     # Slider + mute toggle
  StreamStatus.tsx      # LIVE badge, listener count, connection status
  ActionBar.tsx         # Share button

services/
  audioService.ts       # expo-av audio management, reconnection logic
  metadataService.ts    # Now-playing API polling (15s interval)

store/
  playerStore.ts        # Zustand store (playback state, metadata, errors)

hooks/
  usePlayer.ts          # Audio init + player controls
  useNowPlaying.ts      # Metadata polling lifecycle

types/
  player.ts             # TypeScript interfaces

constants/
  config.ts             # Stream URL, API URL, intervals, retry params
  theme.ts              # Colors, typography, spacing, glass tokens

__tests__/              # Jest unit tests
```

## Streaming

| Parameter | Value |
|-----------|-------|
| Stream URL | `https://bonnytone.com/stream/hls/btradio/live.m3u8` |
| Metadata API | `https://bonnytone.com/api/azuracast/nowplaying/btradio` |
| Codec | AAC-LC |
| Bitrates | 48 / 128 / 256 kbps |
| Segment duration | 4 seconds |

## Build & Deploy

EAS Build profiles are configured in `eas.json`:

```bash
# Development (simulator)
eas build --profile development --platform ios

# Preview (real device testing)
eas build --profile preview --platform all

# Production (App Store / Play Store)
eas build --profile production --platform all

# Submit
eas submit --platform ios
eas submit --platform android
```

## License

MIT
