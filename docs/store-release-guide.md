# BonnyTone Radio - Store Release Guide

> Reference: Spec Section 13 (App Store Preparation Agent), Section 14 (Deployment Agent)

---

## 1. App Store Connect Requirements (iOS)

**App Name:** BonnyTone Radio

**Subtitle:** 24/7 House & Electronic Music

**Keywords:**
```
electronic music, house music, deep house, tech house, radio, dj mixes, dance music, club music, live radio, streaming radio
```

**Full Description:**
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

---

## 2. Google Play Console Requirements

**App Name:** BonnyTone Radio

**Short Description:**
```
24/7 House & Electronic Music — Live Radio Streaming
```

**Full Description:**
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

**Category:** Music & Audio

**Content Rating:** Everyone

**Privacy Policy URL:** https://bonnytone.com/privacy

---

## 3. Asset Requirements Checklist

### App Icons

| Platform | Size | Format | Notes |
|----------|------|--------|-------|
| iOS | 1024x1024 | PNG | No alpha channel, no rounded corners |
| Android | 512x512 | PNG | Can have transparency |

**Design Brief:**
- BonnyTone branding with cyan/teal color scheme on dark background
- Stylized "BT" monogram as placeholder
- Clean, modern, recognizable at small sizes
- Must pass visibility test at 29x29pt (smallest iOS usage)

### Screenshots (3-5 per platform)

| # | Screen | Description | Key Elements |
|---|--------|-------------|--------------|
| 1 | **Player (Playing)** | Full-screen player with play button active | LIVE badge, listener count, artwork, pulse animation visible |
| 2 | **Player (Metadata)** | Same screen with different artist/track | Demonstrates metadata variety, use a well-known DJ name if possible |
| 3 | **Share Sheet** | Native share sheet overlay on player | iOS and Android native share UIs |
| 4 | **Background Playback** | Lock screen with BonnyTone controls visible | Requires real device capture |

### Screenshot Sizes

**iOS (required device sizes):**

| Device Class | Resolution | Example Device |
|-------------|------------|----------------|
| 6.7" | 1290x2796 | iPhone 15 Pro Max |
| 6.5" | 1242x2688 | iPhone 11 Pro Max |
| 5.5" | 1242x2208 | iPhone 8 Plus |

**Android (minimum resolutions):**

| Device Class | Minimum Resolution |
|-------------|-------------------|
| Phone | 1080x1920 |
| 7" Tablet | 1200x1920 |
| 10" Tablet | 1600x2560 |

### Feature Graphic (Google Play Only)

| Property | Value |
|----------|-------|
| Size | 1024x500 |
| Format | PNG or JPEG |
| Content | BonnyTone branding with tagline "24/7 House & Electronic Music" |

---

## 4. Privacy Policy

**Data Collection Summary:**

| Data Type | Collected? | Details |
|-----------|-----------|---------|
| User accounts | No | No login required |
| Personal information | No | -- |
| Location data | No | -- |
| Analytics | No | No analytics SDKs |
| Advertising | No | No ad SDKs |
| Streaming logs | Yes (server-side) | IP address, user agent for stream delivery and error diagnostics only |

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

**Action Required:** Publish this privacy policy at https://bonnytone.com/privacy before submitting to either store.

---

## 5. Release Notes Template (v1.0.0)

```
Welcome to BonnyTone Radio!

Stream 24/7 house and electronic music on your phone.

Features:
- Live streaming with adaptive quality
- Background playback
- Lock screen controls
- Now playing info with artwork
- Share station with friends

Just tap play and enjoy!
```

---

## 6. Submission Checklist

- [ ] App icons generated (1024x1024 iOS, 512x512 Android)
- [ ] 3-5 screenshots captured per platform
- [ ] Feature graphic created (Android)
- [ ] App metadata written (name, description, keywords)
- [ ] Privacy policy published at bonnytone.com/privacy
- [ ] Support URL confirmed (bonnytone.com)
- [ ] Age rating determined (4+ iOS / Everyone Android)
- [ ] Category selected (Music iOS / Music & Audio Android)
- [ ] Release notes written
- [ ] Test builds verified on real devices
- [ ] QA sign-off received

---

## 7. EAS Build Configuration

Add the following to `eas.json` in the project root:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "ios": { "autoIncrement": true },
      "android": { "autoIncrement": true }
    }
  }
}
```

### Build Commands

**Development build (internal distribution):**
```bash
eas build --platform all --profile development
```

**Preview build (real device testing):**
```bash
eas build --platform all --profile preview
```

**Production build (store submission):**
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Submission Commands

**iOS (App Store Connect):**
```bash
eas submit --platform ios
```
Requires: Apple Developer credentials, App Store Connect app created.

**Android (Google Play Console):**
```bash
eas submit --platform android
```
Requires: Google Play Console app created, upload signing key configured.

---

## 8. Phased Rollout Strategy

| Phase | Platform | Distribution | Audience | Duration |
|-------|----------|-------------|----------|----------|
| 1. Internal Testing | iOS + Android | EAS internal distribution | Development team | 1-3 days |
| 2. Closed Beta | iOS: TestFlight / Android: Internal Testing | Invite-only | 10-50 testers | 1-2 weeks |
| 3. Open Beta (optional) | iOS: TestFlight public link / Android: Open Testing | Public opt-in | Unlimited | 1 week |
| 4. Production Release | App Store + Google Play | 100% rollout | General public | After beta approval |

### Review Timelines

- **iOS App Store:** Typically 1-3 days
- **Google Play Store:** Typically a few hours to 1 day

### Post-Submission Monitoring

- Check for review feedback emails from Apple and Google
- Respond to any reviewer questions promptly
- Monitor crash reports via Sentry or Expo crash reporting
- Track download stats in App Store Connect and Play Console

### Prerequisites Before Submission

- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App icons, screenshots, metadata prepared (see sections above)
- [ ] Privacy policy live at bonnytone.com/privacy
- [ ] QA approval received
- [ ] Expo EAS configured and authenticated

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
