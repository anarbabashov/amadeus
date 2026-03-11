# Git Flow & Commit Conventions
**BonnyTone Radio Mobile Application**

---

## Overview

This document defines the Git workflow and commit conventions for the BonnyTone Radio mobile app project. All agents and contributors must follow these rules throughout every phase of implementation.

---

## Branch Strategy

### Branch Types

| Branch | Purpose | Naming Convention | Merges Into |
|--------|---------|-------------------|-------------|
| `main` | Production-ready code | `main` | — |
| `develop` | Integration branch for active development | `develop` | `main` |
| `feature/*` | New features | `feature/<short-description>` | `develop` |
| `fix/*` | Bug fixes | `fix/<short-description>` | `develop` |
| `refactor/*` | Code refactoring | `refactor/<short-description>` | `develop` |
| `chore/*` | Tooling, config, non-functional changes | `chore/<short-description>` | `develop` |
| `release/*` | Release preparation | `release/v1.0.0` | `main` + `develop` |

### Branch Naming Examples

```
feature/audio-engine
feature/play-button
feature/now-playing-metadata
fix/background-audio-ios
fix/reconnect-loop
refactor/player-store
chore/eas-build-config
chore/update-dependencies
release/v1.0.0
```

---

## Commit Message Convention

### Format

```
<type>: <short description>
```

- **Lowercase** type prefix
- **Colon + space** after the type
- **Imperative mood** in the description (e.g., "add", "fix", "update" — not "added", "fixed", "updated")
- **Max 72 characters** for the subject line

### Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or functionality | `feat: implement the homepage player` |
| `fix` | Bug fix | `fix: bug with player` |
| `refactor` | Code restructuring without changing behavior | `refactor: homepage player` |
| `chore` | Tooling, config, dependencies, non-functional | `chore: configure EAS build profiles` |

### Rules

1. **One logical change per commit.** Don't bundle unrelated changes.
2. **Commit after each completed task.** Every task in the implementation plan should result in at least one commit.
3. **Stage only related files.** Use `git add <file>` for specific files, not `git add .` blindly.
4. **Never commit secrets.** No `.env` files, API keys, or credentials.
5. **Write meaningful descriptions.** The message should explain *what* was done, not *how*.

### Good vs Bad Commits

```
# Good
feat: add expo-av audio service with HLS streaming
feat: implement glass play button with pulse animation
fix: audio not resuming after phone call interruption
refactor: extract metadata polling into useNowPlaying hook
chore: add react-native-reanimated to dependencies

# Bad
fix: stuff                          # Too vague
feat: added things and fixed bugs   # Multiple changes in one commit
update                              # No type prefix, no description
feat: Updated the PlayerScreen.tsx file to add the play button component with glass morphism effect and pulse animation  # Too long
```

---

## Workflow Per Task

Every task in the implementation plan follows this cycle:

```
1. Pull latest from develop
   └── git checkout develop && git pull

2. Create branch (if new task area)
   └── git checkout -b feature/<task-name>

3. Implement the task
   └── Write code, test locally

4. Stage changed files
   └── git add <specific-files>

5. Commit with proper message
   └── git commit -m "feat: <description>"

6. Push branch
   └── git push -u origin feature/<task-name>

7. Create PR to develop (when feature is complete)
   └── PR reviewed → merged → branch deleted
```

### When to Commit

| Scenario | Action |
|----------|--------|
| Completed a task from the implementation plan | Commit |
| Fixed a bug found during development | Commit with `fix:` |
| Refactored code for clarity/performance | Commit with `refactor:` |
| Updated config, dependencies, or tooling | Commit with `chore:` |
| Work in progress (end of day, switching context) | Commit to feature branch (OK to be WIP) |

---

## Mapping to Implementation Phases

### Phase 1: Project Setup

| Task | Branch | Expected Commits |
|------|--------|-----------------|
| Initialize Expo project | `chore/project-init` | `chore: initialize expo project with tabs template` |
| Install dependencies | `chore/project-init` | `chore: install expo-av, zustand, reanimated, and dependencies` |
| Configure TypeScript strict mode | `chore/project-init` | `chore: enable TypeScript strict mode` |
| Set up app.json permissions | `chore/project-init` | `chore: configure audio permissions in app.json` |
| Set up Zustand store skeleton | `feature/player-store` | `feat: add player store with initial state interface` |

### Phase 2: Audio Engine

| Task | Branch | Expected Commits |
|------|--------|-----------------|
| Audio service initialization | `feature/audio-engine` | `feat: add audio service with expo-av initialization` |
| HLS stream loading | `feature/audio-engine` | `feat: implement HLS stream loading and playback` |
| Play/pause controls | `feature/audio-engine` | `feat: wire play/pause controls to player store` |
| Background audio config | `feature/audio-engine` | `feat: configure background audio for iOS and Android` |
| Lock screen controls | `feature/audio-engine` | `feat: add lock screen media controls with metadata` |
| Error handling & reconnect | `feature/audio-engine` | `feat: implement auto-reconnect with exponential backoff` |

### Phase 3: Mobile Features

| Task | Branch | Expected Commits |
|------|--------|-----------------|
| Metadata polling | `feature/now-playing` | `feat: add now-playing metadata polling service` |
| Bluetooth audio routing | `feature/audio-engine` | `feat: handle bluetooth audio routing and disconnection` |
| Interruption handling | `feature/audio-engine` | `feat: handle phone call and system interruptions` |
| Volume control | `feature/volume-control` | `feat: implement volume slider with mute toggle` |

### Phase 4: UI Implementation

| Task | Branch | Expected Commits |
|------|--------|-----------------|
| Player screen layout | `feature/player-ui` | `feat: implement full-screen player layout` |
| Glass play button | `feature/player-ui` | `feat: add glass play button with pulse animation` |
| Animated gradient background | `feature/player-ui` | `feat: add animated gradient background` |
| Now-playing display | `feature/player-ui` | `feat: add artwork, artist, and title display` |
| Stream status indicator | `feature/player-ui` | `feat: add live badge and listener count` |
| Action bar (share, quality) | `feature/player-ui` | `feat: add share button and quality selector` |
| Loading states | `feature/player-ui` | `feat: add buffering spinner and offline states` |

### Phase 5: Testing & Polish

| Task | Branch | Expected Commits |
|------|--------|-----------------|
| Unit tests for store | `chore/testing` | `chore: add unit tests for player store actions` |
| Unit tests for audio service | `chore/testing` | `chore: add unit tests for audio service` |
| Component tests | `chore/testing` | `chore: add component tests for play button and volume` |
| Bug fixes from QA | `fix/<bug-name>` | `fix: <specific bug description>` |
| Performance polish | `refactor/performance` | `refactor: optimize metadata polling interval` |

---

## Pull Request Guidelines

### PR Title Format

Same as commit convention:

```
feat: implement audio engine with HLS streaming
fix: background audio stops after 30 minutes on iOS
refactor: simplify player store action handlers
chore: update expo SDK to 51.0.1
```

### PR Description Template

```markdown
## What
Brief description of the change.

## Why
Context on why this change is needed.

## Testing
- [ ] Tested on iOS Simulator
- [ ] Tested on Android Emulator
- [ ] Tested on real device (if applicable)

## Related
- Implementation Plan Phase X, Task Y
```

### PR Rules

1. **One feature/fix per PR.** Keep PRs focused and reviewable.
2. **All commits in a PR follow the commit convention.**
3. **Squash merge to develop** to keep history clean.
4. **Delete branch after merge.**

---

## Release Flow

```
1. Create release branch from develop
   └── git checkout -b release/v1.0.0 develop

2. Final testing, bug fixes (commit to release branch)
   └── fix: <description>

3. Merge release into main
   └── git checkout main && git merge release/v1.0.0

4. Tag the release
   └── git tag v1.0.0

5. Merge release back into develop
   └── git checkout develop && git merge release/v1.0.0

6. Delete release branch
   └── git branch -d release/v1.0.0

7. Push tags
   └── git push origin v1.0.0
```

---

## Quick Reference

```
# Start new feature
git checkout develop
git pull
git checkout -b feature/my-feature

# Commit work
git add src/services/audioService.ts
git commit -m "feat: add audio service with HLS streaming"

# Push and create PR
git push -u origin feature/my-feature
# → Create PR to develop

# After PR merged, clean up
git checkout develop
git pull
git branch -d feature/my-feature
```

---

## Document Completion Checklist

- [x] All required sections present
- [x] Commit types defined (feat, fix, refactor, chore)
- [x] Branch naming conventions defined
- [x] Workflow per task documented
- [x] Mapped commits to implementation phases
- [x] PR guidelines included
- [x] Release flow documented
- [x] Ready for Team Lead review

**Author:** Architect Agent
**Date:** 2026-03-10
**Status:** Ready for Review
