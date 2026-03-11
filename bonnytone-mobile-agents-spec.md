# BonnyTone Radio Mobile Application
Claude Code Multi-Agent Development Specification

Project: BonnyTone Radio Mobile App  
Platforms: iOS, Android  
Framework: React Native (Expo)

---

# 1. Project Overview

The goal of this project is to build a native mobile application for BonnyTone Radio using React Native with Expo.

The mobile application should replicate the design and streaming functionality of the BonnyTone Radio web application while being optimized for mobile UX.

BonnyTone Radio is a 24/7 internet radio station streaming curated DJ mixes including house, deep house, tech house, progressive, breaks, and electronic music.

The application must deliver:

- high quality radio streaming
- modern full screen player
- dynamic animated background
- stable playback even on unstable internet
- native mobile integrations

Authentication from the web application will NOT be implemented in version 1.

---

# 2. Project Scope

## Included

- live radio streaming
- radio player interface
- dynamic animated background
- volume control
- cover artwork
- share functionality
- background playback
- lock screen media controls
- bluetooth audio integration
- iOS and Android builds

## Excluded

- authentication
- user accounts
- mini player
- offline downloads
- playlists

---

# 3. Mandatory Radio Application Features

These features are required for a professional streaming radio application.

---

# 3.1 Background Audio Playback

The application must support continuous audio playback when the app moves to background.

Requirements:

- playback continues when switching apps
- playback continues when device screen locks
- playback resumes when returning to app
- interruptions handled gracefully

Examples of interruptions:

- phone calls
- Siri activation
- other music apps

Implementation:

Expo AV or equivalent audio engine supporting background playback.

---

# 3.2 Lock Screen Media Controls

Native media controls must be supported.

Platforms:

- iOS Lock Screen Player
- Android Notification Media Controls

Controls required:

- Play
- Pause
- Stream title
- Station artwork

Optional:

- open app action

---

# 3.3 Bluetooth and External Audio Devices

The application must support playback via:

- Bluetooth headphones
- Bluetooth speakers
- car audio systems

Expected behavior:

- playback routes automatically to connected device
- headset play/pause buttons control player
- metadata displayed where supported

Optional future support:

- Apple CarPlay
- Android Auto

---

# 4. Technology Stack

Core stack:

- React Native
- Expo
- TypeScript

Recommended libraries:

- expo-av
- react-navigation or expo-router
- zustand (state management)
- react-native-reanimated
- react-native-share

Testing:

- Jest
- React Native Testing Library

Build pipeline:

- Expo EAS Build
- Expo EAS Submit

---

# 5. Multi-Agent Architecture

Development will be executed using specialized Claude Code agents.

Agents:

1. Architect / Research Agent
2. Team Lead Agent
3. Mobile Developer Agent
4. QA Engineer Agent
5. App Store Preparation Agent
6. Deployment Agent

Each agent has a defined role and responsibilities.

---

# 6. Architect / Research Agent

Purpose

Analyze the BonnyTone web application and define the mobile architecture.

Responsibilities

- analyze the web version UI
- inspect streaming implementation
- document player behavior
- define mobile architecture
- research streaming stability best practices

Outputs

The agent must generate a `/docs` folder containing:

docs/

- architecture.md
- implementation-plan.md
- component-structure.md
- streaming-integration.md
- state-management.md
- testing-strategy.md
- store-release-guide.md

---

# 7. Team Lead Agent

Purpose

Review and validate architecture decisions.

Responsibilities

- review architecture
- validate scalability
- validate streaming implementation
- confirm component structure
- confirm performance strategy

Possible outcomes:

- approve implementation
- request revisions from Architect agent

---

# 8. Mobile Developer Agent

Purpose

Implement the mobile application.

Responsibilities

Initialize Expo project:

npx create-expo-app bonnytone-radio

Implement:

- radio player
- streaming integration
- dynamic animated background
- volume controls
- share functionality
- player state management

Implement required radio features:

- background playback
- lock screen controls
- bluetooth playback support

Testing:

- write unit tests for player components
- test streaming service
- test UI interactions

---

# 9. QA Engineer Agent

Purpose

Verify application quality and stability.

Testing areas

Streaming

- start playback
- pause playback
- reconnect after network drop

Audio behavior

- background playback
- lock screen controls
- bluetooth control buttons

UI

- layout validation
- animation smoothness
- interaction correctness

Network testing

- slow internet
- unstable internet
- reconnection scenarios

Devices

- iPhone
- Android

---

# 10. App Store Preparation Agent

Purpose

Prepare all metadata and assets required for store submission.

Responsibilities

- generate store metadata
- define screenshots requirements
- prepare submission checklist

---

# 11. Store Metadata

App Name

BonnyTone Radio

Short Description

24/7 electronic music radio streaming curated DJ mixes.

Full Description

BonnyTone Radio is a 24/7 online radio station dedicated to electronic music and DJ culture.

The station broadcasts curated DJ mixes including house, deep house, tech house, progressive and electronic music.

The mobile app allows listeners to stream BonnyTone Radio anywhere with a modern radio player optimized for music streaming.

Features:

- high quality radio streaming
- full screen radio player
- animated background visuals
- easy sharing
- stable playback

---

# 12. Keywords

- electronic music
- house music
- deep house
- tech house
- radio
- dj mixes
- dance music
- club music

---

# 13. App Category

Primary Category

Music

Secondary Category

Entertainment

---

# 14. Age Rating

4+

Reason:

No explicit content.

---

# 15. Support URLs

Support URL

https://bonnytone.com

Marketing URL

https://bonnytone.com

Privacy Policy

https://bonnytone.com/privacy

Terms of Service

https://bonnytone.com/terms

---

# 16. App Store and Google Play Preparation Specification

## 16.1 App Identity

App Name

BonnyTone Radio

Short description

24/7 electronic music radio streaming curated DJ mixes.

---

## 16.2 Keywords

- electronic music
- house music
- dj mixes
- dance music
- radio station
- club music

---

## 16.3 Category

Music

---

## 16.4 Age Rating

4+

---

## 16.5 Privacy Policy

Example

https://bonnytone.com/privacy

---

## 16.6 Terms of Service

Optional but recommended.

---

## 16.7 Support URL

https://bonnytone.com

---

## 16.8 Marketing URL

https://bonnytone.com

---

## 16.9 App Versioning

Version format

Major.Minor.Patch

Example

1.0.0

---

## 16.10 Required Store Assets

App icon

1024 x 1024

Android icon

512 x 512

Splash screen

Branded launch screen

---

## 16.11 Screenshots

Required screens

- player screen
- streaming playback
- share screen
- dynamic background

Devices

- iPhone
- Android

---

## 16.12 App Store Preview

Optional 15–30 second preview video.

---

## 16.13 Permissions

Minimal permissions:

- Internet access
- Background audio

---

## 16.14 Analytics and Crash Reporting

Recommended tools

- Sentry
- Firebase Crashlytics

---

## 16.15 App Build Pipeline

Build tool

Expo EAS

Build profiles

- development
- preview
- production

---

## 16.16 Release Notes Template

Version 1.0.0

Initial release of BonnyTone Radio mobile app.

Features

- live electronic music streaming
- full screen player
- animated visuals
- share functionality

---

## 16.17 Definition of Store Ready State

Application is ready when:

- builds succeed on iOS and Android
- QA approval completed
- background playback verified
- lock screen controls verified
- bluetooth playback verified
- metadata prepared
- screenshots uploaded
- privacy policy available

---

# 17. Deployment Agent

Purpose

Submit application to stores.

Targets

- Apple App Store Connect
- Google Play Console

Responsibilities

- upload builds
- configure store listing
- upload screenshots
- configure release notes

---

# 18. Definition of Done

The project is complete when:

- app builds successfully
- streaming stable
- background playback works
- lock screen controls work
- bluetooth playback works
- QA approved
- store metadata prepared
- app ready for submission