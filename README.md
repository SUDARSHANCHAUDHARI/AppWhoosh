# AppWhoosh

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/)
[![Release](https://img.shields.io/badge/release-POC%20internal%20tool-orange.svg)](RELEASE_MEMORY.md)

AI-powered macOS release pipeline concept for Android and iOS apps. AppWhoosh aims to build, package, validate, and deploy mobile releases from one CLI.

> **Status:** POC/internal release tool · not production-ready until doctor checks, dry-run protections, fixture AAB flow, iOS archive flow, and store credential safety are verified

## Why This Exists

Mobile release work repeats across apps: version bumps, signed Android bundles, iOS archives, screenshots, metadata, store uploads, and notifications. AppWhoosh explores a single CLI workflow for that release pipeline.

## Status

| Item | State |
|---|---|
| Release type | POC/internal CLI |
| Platform | macOS only |
| Android flow | Pending fixture dry run |
| iOS flow | Pending archive verification |
| Store submission | Must stay guarded by dry-run safety |

## Key Technical Decisions

**The tool is macOS-only.** Android and iOS release tooling depends on Xcode, fastlane, Android Studio, signing assets, and local machine state.

**A doctor command is required before release workflows.** Store credentials and local toolchains are sensitive; preflight checks should catch missing configuration before build/deploy commands run.

**Dry-run behavior is mandatory before real store submission.** A release tool must make accidental real submission difficult during testing.

**Credentials stay in `.env` and local files.** Examples use `YOUR_*` placeholders and should never include real signing or store material.

## Features

- natural-language `appwhoosh ask` command concept
- app registry/config commands
- Android build/deploy command area
- iOS archive/deploy command area
- metadata validation command area
- Telegram/macOS notification concept
- credential rotation docs

## Setup

```bash
bash scripts/setup.sh
```

Then configure:

```bash
nano .env
appwhoosh doctor
appwhoosh config add
```

## Core Commands

```bash
appwhoosh ask "<natural language>"
appwhoosh list
appwhoosh doctor
appwhoosh dashboard
appwhoosh build <app-id>
appwhoosh screenshots <app-id>
appwhoosh deploy <app-id> --aab <path>
appwhoosh release <app-id>
appwhoosh release-all
appwhoosh config add
appwhoosh config validate <app-id>
appwhoosh metadata validate <app-id>
```

## Verification

Before internal release:

```bash
pnpm test
appwhoosh doctor
```

Then verify:

- setup script on a safe machine
- dry-run protections for deployment
- Android fixture AAB path
- iOS archive path if Xcode credentials are ready
- credential redaction in logs

## Known Limits

- Real store submission should not be enabled until dry-run rehearsals pass.
- Android/iOS local toolchains can vary by machine.
- Signing keys and App Store credentials are high-risk secrets.
- A fixture release rehearsal is still required.

## Author

Built by **[Sudarshan Chaudhari](https://github.com/SUDARSHANCHAUDHARI)** — SudarshanTechLabs.
