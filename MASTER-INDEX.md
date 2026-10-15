# AppWhoosh Release Tool — Master Index

Everything in this project and where to find it.

---

## Prompts (use with Claude Code in order)

| # | File | Builds |
|---|---|---|
| 00 | `prompts/00-setup.md` | pnpm install, env, CLI sanity |
| 01 | `prompts/01-config-registry.md` | App config system |
| 02 | `prompts/02-android-engine.md` | Android build + sign + deploy |
| 03 | `prompts/03-ios-engine.md` | iOS build + certs + deploy |
| 04 | `prompts/04-screenshots.md` | Screenshot automation |
| 05 | `prompts/05-ai-agent.md` | Claude API agentic loop |
| 06 | `prompts/06-macos-menubar.md` | SwiftUI menu bar app (Xcode) |
| 07 | `prompts/07-metadata.md` | Metadata management |
| 08 | `prompts/08-batch-scale.md` | Batch ops for 20+ apps |
| 09 | `prompts/09-error-handling.md` | Logging + preflight checks |
| 10 | `prompts/10-testing.md` | Test suite |
| 11 | `prompts/11-cicd.md` | GitHub Actions workflows |
| 12 | `prompts/12-notifications.md` | macOS + Telegram notifications |
| 13 | `prompts/13-xcode-setup.md` | Xcode project setup guide |
| 14 | `prompts/14-version-management.md` | Auto version bumping |
| 15 | `prompts/15-aso.md` | AI-powered ASO optimization |
| 16 | `prompts/16-analytics.md` | Play Store analytics dashboard |
| 17 | `prompts/17-reviews.md` | AI review responder |
| 18 | `prompts/18-translations.md` | Multi-language metadata |
| 19 | `prompts/19-self-hosted-runner.md` | macOS GitHub Actions runner |

---

## Infrastructure & Credentials

| File | Purpose |
|---|---|
| `infrastructure/google-play-setup.md` | Google Play service account setup |
| `infrastructure/appstore-setup.md` | App Store Connect API + Match setup |
| `docs/ci-setup.md` | GitHub Actions + secrets setup |
| `docs/credential-rotation.md` | How and when to rotate each credential |

---

## Code & Config

| File | Purpose |
|---|---|
| `fastlane/Gemfile` | Exact Ruby gem versions |
| `fastlane/Appfile` | Fastlane default app identifiers |
| `fastlane/Matchfile` | iOS certificate management config |
| `github/.eslintrc.json` | ESLint rules for Node.js code |
| `github/dependabot.yml` | Auto-update npm + bundler deps |
| `configs/bulk-generate-configs.js` | Generate all 22 app configs at once |
| `skills/CLAUDE.md` | Claude Code skill for this project |

---

## GitHub Actions Workflows

| File | Trigger |
|---|---|
| `github/workflows/test.yml` | Push to main / PR |
| `github/workflows/lint.yml` | Push to main / PR |
| `github/workflows/release-app.yml` | Manual (workflow_dispatch) |
| `github/workflows/batch-release.yml` | Every Monday 9AM Bangkok + manual |

---

## Screenshot Scripts (22 apps)

All in `scripts/screenshots/` — one per app, pre-filled with:
- Correct package name
- ADB pre-flight checks
- 3 screen capture steps with TODO comments for tap coordinates
- Blank screenshot detection

---

## Documentation

| File | Contents |
|---|---|
| `docs/architecture-decisions.md` | Why things are built the way they are |
| `docs/troubleshooting.md` | Common errors and exact fixes |
| `docs/adding-an-app.md` | Step-by-step walkthrough |
| `docs/credential-rotation.md` | Security rotation schedule |
| `docs/ci-setup.md` | GitHub Actions and runner setup |

---

## SwiftUI App

| File | Contents |
|---|---|
| `AppWhooshApp-Full.swift` | Complete production SwiftUI menu bar app |
| `prompts/13-xcode-setup.md` | How to set it up in Xcode |

---

## Recommended session order

```
Session 1: Prompts 00 → 01 → 09 → 05
           Get CLI running + AI agent working
           Test: appwhoosh ask "list all apps"

Session 2: Prompts 02 → 04 → 07 → 08
           Android pipeline + screenshots + metadata + batch

Session 3: Prompts 14 → 15 → 17 → 18
           Version bump + ASO + reviews + translations

Session 4: Prompts 03 → 06 → 13
           iOS engine + SwiftUI app

Session 5: Prompts 10 → 11 → 12 → 19
           Tests + CI/CD + notifications + runner
```
