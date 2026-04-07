# AppWhoosh ⚡

> Ship your apps. Whoosh.

AI-powered macOS release pipeline for Android + iOS apps.
One command releases all your apps to Google Play and App Store Connect.

Built by SudarshanTechLabs.

---

## What it does

You type:
```bash
appwhoosh ask "release all apps"
```

AppWhoosh does:
1. Bumps version codes
2. Builds signed AABs / IPAs
3. Captures Play Store / App Store screenshots
4. Uploads metadata
5. Submits to Google Play + App Store Connect
6. Notifies you via macOS + Telegram

---

## Requirements

- macOS 13+ only
- Node.js 18+
- Android Studio + ADB (for Android)
- Xcode 15+ (for iOS)
- fastlane (`gem install fastlane`)

---

## Setup

```bash
# 1. Clone / unzip
cd appwhoosh/

# 2. Run setup (installs deps, creates .env, links CLI)
bash scripts/setup.sh

# 3. Fill in credentials
nano .env

# 4. Health check
appwhoosh doctor

# 5. Add your first app
appwhoosh config add

# 6. First release
appwhoosh ask "list all apps"
```

---

## CLI Commands

```bash
appwhoosh ask "<natural language>"     # AI agent
appwhoosh list                         # List all apps
appwhoosh doctor                       # Health check
appwhoosh dashboard                    # Status dashboard

appwhoosh build <app-id>               # Build Android + iOS
appwhoosh screenshots <app-id>         # Capture screenshots
appwhoosh deploy <app-id> --aab <path> # Deploy to stores
appwhoosh release <app-id>             # Full pipeline
appwhoosh release-all                  # Release every app

appwhoosh config add                   # Add new app
appwhoosh config validate <app-id>     # Validate config

appwhoosh metadata validate <app-id>   # Check metadata
appwhoosh metadata scaffold <app-id>   # Create metadata files
appwhoosh metadata changelog <app-id>  # Update changelog

appwhoosh version bump <app-id>        # Bump version
appwhoosh version table                # Show all versions

appwhoosh aso audit <app-id>           # ASO score
appwhoosh aso optimize <app-id>        # AI-optimize metadata
appwhoosh aso keywords <app-id>        # Keyword research

appwhoosh translate app <app-id> --to hi-IN   # Translate metadata
appwhoosh translate all --to th-TH            # Translate all apps

appwhoosh batch release                # Batch release all
appwhoosh batch validate               # Batch validate metadata

appwhoosh android keystore create <app-id>
appwhoosh android keystore verify <app-id>

appwhoosh history <app-id>             # Release history
appwhoosh notify test                  # Test notifications
```

---

## Project Structure

```
appwhoosh/
├── cli/index.js              ← CLI entry point
├── mcp/
│   ├── server.js             ← Claude API agentic loop
│   └── tools.js              ← Tool registry (15 tools)
├── tools/
│   ├── config.js             ← App config loader
│   ├── build-android.js      ← Gradle build
│   ├── build-ios.js          ← Xcode archive
│   ├── deploy.js             ← fastlane supply + deliver
│   ├── screenshots.js        ← ADB + simctl
│   ├── metadata.js           ← Metadata validation
│   ├── logger.js             ← Coloured terminal logger
│   ├── errors.js             ← Custom error classes
│   ├── notify.js             ← macOS + Telegram
│   ├── history.js            ← Release history
│   ├── version.js            ← Version bumping
│   ├── keystore.js           ← Keystore management
│   ├── preflight.js          ← blitz doctor checks
│   ├── batch.js              ← Batch operations
│   ├── aso.js                ← ASO optimization
│   └── translate.js          ← AI translation
├── apps/<app-id>/
│   ├── config.json           ← Per-app config
│   └── metadata/             ← fastlane metadata
├── scripts/
│   ├── setup.sh              ← One-shot setup
│   └── screenshots/          ← Per-app screenshot scripts
├── config/registry.json      ← Master app list
├── fastlane/Fastfile         ← Android + iOS lanes
├── AppWhooshMenuBar/         ← macOS SwiftUI menu bar app
├── tests/                    ← Test suite
└── .github/workflows/        ← CI/CD
```

---

## Adding a new app

```bash
appwhoosh config add
# Follow the prompts — done in 2 minutes
```

---

## macOS Menu Bar App

Open `AppWhooshMenuBar/AppWhooshApp.swift` in Xcode.
See `docs/xcode-setup.md` for full instructions.

---

## Developer

**SudarshanTechLabs** · Bangkok, Thailand
GitHub: [SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
