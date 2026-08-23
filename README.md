# AppWhoosh

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/)
[![Release](https://img.shields.io/badge/release-POC%20internal%20tool-orange.svg)](RELEASE_MEMORY.md)

AI-powered macOS release pipeline concept for Android and iOS apps. AppWhoosh aims to build, package, validate, and deploy mobile releases from one CLI.

> **Status:** POC/internal release tool · not production-ready until doctor checks, dry-run protections, fixture AAB flow, iOS archive flow, and store credential safety are verified

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Status](#status)
- [Key Technical Decisions](#key-technical-decisions)
- [Features](#features)
- [Setup](#setup)
- [Core Commands](#core-commands)
- [Verification](#verification)
- [Known Limits](#known-limits)
- [About](#about)

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
npm test
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

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
