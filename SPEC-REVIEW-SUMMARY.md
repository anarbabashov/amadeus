# BonnyTone Mobile App Specification Review Summary

**Reviewer:** AI Engineer / Technical Project Manager
**Date:** 2026-03-10
**Original Spec:** `bonnytone-mobile-agents-spec.md`
**Updated Spec:** `bonnytone-mobile-agents-spec-UPDATED.md`

---

## Executive Summary

✅ **Status:** Specification is now **READY FOR IMPLEMENTATION** after incorporating technical details from the artistmanager (BonnyTone web app) project.

**Original Assessment:** ⚠️ NOT READY (7 critical gaps identified)
**Updated Assessment:** ✅ READY (all gaps filled with production-proven implementation details)

---

## Information Successfully Retrieved from ArtistManager Project

### ✅ 1. Streaming Architecture (COMPLETE)

**Source Files:**
- [README.md](../artistmanager/README.md)
- [.env.example](../artistmanager/.env.example)
- [docs/ARCHITECTURE_REVIEW.md](../artistmanager/docs/ARCHITECTURE_REVIEW.md)

**What We Found:**
- ✅ **Stream URL:** `https://bonnytone.com/stream/hls/btradio/live.m3u8`
- ✅ **Stream Format:** HLS (HTTP Live Streaming)
- ✅ **Codec:** AAC-LC (universally supported)
- ✅ **Bitrate Tiers:** 48kbps (low), 128kbps (medium), 256kbps (high)
- ✅ **Metadata API:** `https://bonnytone.com/api/azuracast/nowplaying/btradio`
- ✅ **Segment Duration:** 4 seconds
- ✅ **Streaming Server:** AzuraCast (Liquidsoap + HLS output)
- ✅ **CORS:** Already configured on production server

**Added to Spec:**
- Complete "Section 2: Streaming Architecture Specification" with all production details

---

### ✅ 2. State Management Structure (COMPLETE)

**Source File:**
- [store/playerStore.ts](../artistmanager/store/playerStore.ts)

**What We Found:**
- ✅ Complete Zustand store TypeScript interface
- ✅ Player states: `isPlaying`, `isBuffering`, `volume`, `isMuted`, `quality`, `streamStatus`
- ✅ Stream status enum: `'idle' | 'connecting' | 'live' | 'offline' | 'error'`
- ✅ Quality enum: `'auto' | 'low' | 'medium' | 'high'`
- ✅ Now-playing metadata structure: `{ title, artist, art }`
- ✅ Error handling state: `errorCount`, `lastError`
- ✅ Volume persistence: `hydrateVolume()` from localStorage
- ✅ All action methods defined

**Added to Spec:**
- Complete "Section 6: State Management Architecture" with full TypeScript interfaces
- State machine diagram with all transitions

---

### ✅ 3. HLS Configuration (COMPLETE)

**Source File:**
- [components/player/PlayerProvider.tsx](../artistmanager/components/player/PlayerProvider.tsx)

**What We Found:**
- ✅ **Buffer Settings:** `maxBufferLength: 30s`, `maxMaxBufferLength: 60s`
- ✅ **Live Sync:** `liveSyncDurationCount: 3` (stay 3 segments behind live edge)
- ✅ **Retry Logic:** `fragLoadingMaxRetry: 6` with exponential backoff
- ✅ **ABR Strategy:** Conservative upswitch, quick downswitch
- ✅ **Start Level:** 0 (lowest quality, upgrade fast)
- ✅ **Reconnection Logic:** Max 10 attempts with exponential backoff (1s → 2s → 4s → 8s → 30s)
- ✅ **Error Recovery:** Auto-retry on media errors, reconnect on network errors

**Added to Spec:**
- "Section 2.4: Network Resilience Strategy" with complete retry logic
- HLS configuration parameters (adapted for expo-av on mobile)

---

### ✅ 4. UI/UX Design System (COMPLETE)

**Source Files:**
- [CLAUDE.md](../artistmanager/CLAUDE.md)
- [components/radio/GlassPlayButton.tsx](../artistmanager/components/radio/GlassPlayButton.tsx)
- [components/radio/VolumeSlider.tsx](../artistmanager/components/radio/VolumeSlider.tsx)
- [components/radio/NowPlayingBar.tsx](../artistmanager/components/radio/NowPlayingBar.tsx)

**What We Found:**
- ✅ **Design Style:** Glass-morphism with backdrop blur
- ✅ **Color Palette:** Cyan/teal primary (`#06b6d4` / `#14b8a6`), dark gradient background
- ✅ **Glass Effect:** `rgba(255, 255, 255, 0.05)` with blur
- ✅ **Component Structure:**
  - GlassPlayButton (large circular button with pulse animation)
  - VolumeSlider (horizontal slider with mute buttons)
  - NowPlayingBar (artist/title/artwork display)
  - ActionButtons (share, quality, more)
- ✅ **Animation:** `pulse-glow` keyframe for active play state

**Added to Spec:**
- "Section 7: UI/UX Specification" with complete design system
- Screen layout diagram
- Component breakdown
- Design tokens (colors, typography, spacing)

---

### ✅ 5. Error Handling & Recovery (COMPLETE)

**Source File:**
- [components/player/PlayerProvider.tsx](../artistmanager/components/player/PlayerProvider.tsx) (lines 159-174, 105-129)

**What We Found:**
- ✅ **Fatal Error Handling:** Media errors trigger `hls.recoverMediaError()`, network errors trigger reconnect
- ✅ **Reconnection Strategy:** Exponential backoff with max 10 attempts
- ✅ **Error States:** `incrementErrorCount()`, `setError(details)`, `resetErrorCount()` on success
- ✅ **Stream Offline Detection:** After max attempts, set status to 'offline', show retry button
- ✅ **Graceful Degradation:** Show last known metadata if API fails

**Added to Spec:**
- Error handling state machine in Section 6.2
- Reconnection logic details in Section 2.4
- QA testing for error scenarios in Section 12

---

### ✅ 6. Media Session Integration (COMPLETE)

**Source File:**
- [components/player/PlayerProvider.tsx](../artistmanager/components/player/PlayerProvider.tsx) (lines 285-311)

**What We Found:**
- ✅ **Lock Screen Metadata:** Dynamic `MediaMetadata` with title, artist, artwork from now-playing API
- ✅ **Action Handlers:** Play and pause registered with `mediaSession.setActionHandler()`
- ✅ **Background Playback:** Audio element persistence prevents garbage collection
- ✅ **Artwork Handling:** URL resolution logic to convert relative paths to absolute URLs

**Added to Spec:**
- "Section 4.2: Lock Screen Media Controls" with complete implementation details
- Media Session API integration requirements
- Acceptance criteria for lock screen testing

---

### ✅ 7. Testing Strategy (COMPLETE)

**Source Files:**
- [docs/ARCHITECTURE_REVIEW.md](../artistmanager/docs/ARCHITECTURE_REVIEW.md) (Section 10: Development Plan with acceptance criteria)
- [package.json](../artistmanager/package.json) (testing dependencies)

**What We Found:**
- ✅ **Test Stack:** Jest + React Native Testing Library (web equivalent: @testing-library/react)
- ✅ **Acceptance Criteria:**
  - Stream starts in <3s on WiFi
  - 1+ hour stability test (no crashes, no memory leaks)
  - Network resilience (3G throttling, airplane mode toggle)
  - Long session testing (4+ hours)
- ✅ **Device Matrix:** iOS (Safari, iPhone), Android (Chrome)
- ✅ **Performance Targets:** 60fps animations, <100MB memory usage after 4 hours

**Added to Spec:**
- "Section 12: QA Engineer Agent" with complete testing matrix
- Acceptance criteria for each test case
- Sign-off checklist

---

## ✅ 8. Additional Information Retrieved

### Dynamic Background Clarification

**Source:** [components/radio/Waveform.tsx](../artistmanager/components/radio/Waveform.tsx)

**What We Found:**
- ✅ Mathematical halftone animation (current web version)
- ✅ Optional audio-reactive mode using `AnalyserNode.getByteFrequencyData()`
- ✅ Smooth crossfade between mathematical and audio-reactive modes

**Decision Made:**
- Start with **Option A** (gradient transitions) for mobile v1.0
- Simpler, lower CPU usage, more reliable on mid-range devices
- Audio-reactive visualization deferred to v1.1

---

### Now-Playing Polling Strategy

**Source:** [hooks/useNowPlaying.ts](../artistmanager/hooks/useNowPlaying.ts) (referenced in CLAUDE.md)

**What We Found:**
- ✅ Polling interval: 30 seconds (web) → **15 seconds recommended for mobile** (balance between freshness and battery)
- ✅ Graceful failure: If API call fails, keep showing last known metadata
- ✅ Listener count updates in same API call

**Added to Spec:**
- "Section 2.3: Metadata Protocol" with polling strategy

---

### Share Functionality

**Source:** [components/radio/ActionButtons.tsx](../artistmanager/components/radio/ActionButtons.tsx)

**What We Found:**
- ✅ Web Share API with clipboard fallback (web version)
- ✅ Share data: `{ title, text, url }`

**Adapted for Mobile:**
- Use React Native `Share` API (built-in, no library needed)
- Native share sheet on iOS and Android

**Added to Spec:**
- "Section 7.5: Share Functionality" with mobile implementation

---

## Information Still Missing (User Input Required)

### ⚠️ 1. App Branding Assets

**Status:** Not found in artistmanager project

**Required:**
- [ ] App icon design (1024x1024 for iOS, 512x512 for Android)
- [ ] BonnyTone logo (SVG or high-res PNG)
- [ ] Splash screen design

**Question for User:**
> Do you have existing branding assets (logo, icon design, brand guidelines)?
> If not, should we create a simple placeholder icon for development?

**Recommendation:** Use a simple "BT" monogram in cyan/teal on dark background as placeholder. Professional icon can be designed later.

---

### ⚠️ 2. Analytics Requirements

**Status:** Not specified in original spec, not found in web app (no analytics SDK in package.json)

**Question for User:**
> Should we add analytics in v1.0 (Firebase, Amplitude, etc.) to track:
> - Play/pause events
> - Session duration
> - Network errors
> - App opens
>
> Or defer analytics to v1.1?

**Recommendation:** Add basic Expo Analytics (free, built-in) for crash reports and usage stats. Defer advanced analytics to v1.1.

---

### ⚠️ 3. Apple Developer Account

**Status:** Not verifiable from code

**Question for User:**
> Do you have an active Apple Developer account ($99/year)?
> This is required to submit to the App Store.

**Blocker:** If no account, iOS submission is blocked. Account setup takes 1-2 days.

---

### ⚠️ 4. Google Play Developer Account

**Status:** Not verifiable from code

**Question for User:**
> Do you have a Google Play Developer account ($25 one-time)?
> This is required to submit to Google Play.

**Blocker:** If no account, Android submission is blocked. Account setup takes 1-2 days.

---

### ⚠️ 5. Privacy Policy Hosting

**Status:** Privacy policy URL listed in .env.example (`https://bonnytone.com/privacy`) but not verified to exist

**Question for User:**
> Can we publish a privacy policy at `https://bonnytone.com/privacy`?
> If you don't have web access, we need an alternative URL.

**Requirement:** Both App Store and Google Play require a publicly accessible privacy policy URL.

**Fallback:** Can host on GitHub Pages or Google Docs if bonnytone.com is unavailable.

---

### ⚠️ 6. Support Email

**Status:** Not specified

**Question for User:**
> What email should be listed for app support?
> Examples: `support@bonnytone.com`, `hello@bonnytone.com`, or personal email.

**Requirement:** Both app stores require a support contact.

---

### ℹ️ 7. Dynamic Background Preference (OPTIONAL)

**Question for User:**
> For the dynamic background, prefer:
> - **Option A:** Slow gradient transitions (simpler, lower CPU) ← RECOMMENDED
> - **Option B:** Audio-reactive visualizer (more impressive, higher CPU)

**Current Decision:** Option A for v1.0, Option B for v1.1. User can override if they have strong preference.

---

## Strategic Changes Made to Original Spec

### 🔧 1. Technology Stack Clarification

**Original:** "Expo AV or equivalent audio engine"

**Updated:**
- ✅ **expo-av** (official Expo audio library)
- ✅ Native HLS support (iOS AVPlayer, Android ExoPlayer)
- ✅ No need for JavaScript HLS parsing (lighter bundle, better performance)

**Reason:** expo-av supports HLS streaming natively on both platforms. This is simpler and more reliable than react-native-track-player (which requires bare workflow).

---

### 🔧 2. HLS Configuration Added

**Original:** Generic "HLS adaptive streaming" mentioned

**Updated:**
- ✅ Complete buffer configuration (30s ahead, 3 segments behind live edge)
- ✅ Retry logic (6 attempts per segment, exponential backoff)
- ✅ Reconnection strategy (max 10 attempts with delays: 1s → 2s → 4s → 8s → 30s)

**Reason:** These are production-proven values from the web app. They work for 4+ hour sessions on slow connections.

---

### 🔧 3. State Machine Defined

**Original:** Generic "state management" mentioned

**Updated:**
- ✅ Complete state machine: IDLE → CONNECTING → LIVE → [PAUSED | BUFFERING | ERROR] → OFFLINE
- ✅ All transitions defined with triggers
- ✅ Error states with recovery paths

**Reason:** Without a clear state machine, developers will invent their own, leading to inconsistent behavior.

---

### 🔧 4. Testing Acceptance Criteria

**Original:** Generic "test on devices" mentioned

**Updated:**
- ✅ Measurable targets: "Stream starts in <3s on WiFi"
- ✅ Network scenarios: WiFi, 4G, 3G, airplane mode toggle
- ✅ Long session testing: 1+ hour (stability), 4+ hours (memory leak check)
- ✅ Device matrix: iOS 17+, Android 13+, specific device models

**Reason:** QA needs concrete pass/fail criteria, not "test it and see."

---

### 🔧 5. Agent Validation Checkpoints

**Original:** Agent roles defined but no validation criteria

**Updated:**
- ✅ Architect Agent: 8-point success criteria checklist
- ✅ Team Lead Agent: 9-point approval checklist
- ✅ QA Engineer Agent: Multi-section testing matrix with sign-off criteria

**Reason:** Without validation checkpoints, agents can deliver incomplete work and claim "done."

---

### 🔧 6. Definition of Done Expanded

**Original:** 10-item high-level checklist

**Updated:** 40+ item comprehensive checklist covering:
- ✅ Streaming & Playback (6 items)
- ✅ Audio Controls (5 items)
- ✅ Mobile-Specific Features (8 items)
- ✅ UI/UX (9 items)
- ✅ Testing (8 items)
- ✅ Store Preparation (6 items)
- ✅ Submission (4 items)

**Reason:** A clear DoD prevents scope creep and ensures nothing is forgotten.

---

## Risk Assessment: Original vs Updated Spec

| Risk | Original Spec | Updated Spec | Status |
|------|---------------|--------------|--------|
| **Streaming stability** | 🔴 HIGH (no details) | 🟢 LOW (production config) | ✅ Mitigated |
| **State management bugs** | 🔴 HIGH (undefined structure) | 🟢 LOW (complete schema) | ✅ Mitigated |
| **Background audio issues** | 🟡 MEDIUM (requirements listed) | 🟢 LOW (implementation guide) | ✅ Mitigated |
| **Lock screen controls** | 🟡 MEDIUM (requirements listed) | 🟢 LOW (implementation guide) | ✅ Mitigated |
| **Network resilience** | 🔴 HIGH (no retry logic) | 🟢 LOW (complete strategy) | ✅ Mitigated |
| **UI/UX inconsistency** | 🟡 MEDIUM (vague "modern") | 🟢 LOW (detailed design system) | ✅ Mitigated |
| **Testing gaps** | 🔴 HIGH (no acceptance criteria) | 🟢 LOW (complete test matrix) | ✅ Mitigated |

---

## Final Recommendations

### ✅ 1. Approve Updated Specification

The updated spec is production-ready and contains all technical details needed for implementation.

**Next Step:** Team Lead Agent should review and approve the architecture before Mobile Developer Agent starts coding.

---

### ✅ 2. Resolve 6 Open Questions

Before starting implementation, get answers from the user:

1. App icon design (or use placeholder?)
2. Analytics in v1.0? (recommend: basic Expo crash reporting only)
3. Apple Developer account status?
4. Google Play Developer account status?
5. Privacy policy hosting at bonnytone.com/privacy?
6. Support email address?

---

### ✅ 3. Follow Phased Development

**Do NOT skip Architecture Phase.**

Architect Agent must deliver complete `/docs` folder before Developer Agent writes any code.

**Timeline:**
- Architecture & Planning: 3-5 days
- Implementation: 15-20 days (5 phases)
- QA & Bug Fixes: 3-5 days
- Store Prep & Submission: 3-5 days
- **Total: 4-6 weeks**

---

### ✅ 4. Test on Real Devices Early

Background audio and lock screen controls **cannot be fully tested in simulators**.

Acquire real devices by Phase 2 (Week 1 of development):
- iPhone (any model with iOS 17+)
- Android phone (Pixel, Samsung, or similar with Android 13+)

---

### ✅ 5. Use Web App as Reference

The artistmanager (BonnyTone web app) is a production-proven reference implementation.

**Key Reference Files:**
- `store/playerStore.ts` → Mobile store structure
- `components/player/PlayerProvider.tsx` → Audio engine logic (adapt HLS.js → expo-av)
- `components/radio/` → UI components (adapt CSS → React Native styles)
- `docs/ARCHITECTURE_REVIEW.md` → Deep architectural context

---

## Conclusion

✅ **SPECIFICATION IS READY FOR IMPLEMENTATION**

All critical gaps identified in the original review have been filled with production-proven details from the BonnyTone web application.

**Confidence Level:** HIGH — The updated spec contains sufficient detail for a development team (or AI agents) to build a production-quality mobile app without major architectural decisions during implementation.

**Remaining Blockers:**
- 6 open questions (app icon, analytics, developer accounts, privacy policy, support email, background preference)
- None are technical blockers; all are administrative/design decisions

**Recommendation:**
1. User answers 6 open questions (30 minutes)
2. Team Lead Agent approves architecture (2 hours)
3. Mobile Developer Agent starts implementation (Week 1)

---

**Document Status:** FINAL
**Approval Required:** User confirmation on 6 open questions
**Next Agent:** Team Lead Agent (for architecture approval)
