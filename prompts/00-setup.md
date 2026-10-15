# PROMPT 00 — Project Setup & Dependencies

## Context
I am building "AppWhoosh Release Tool" — an AI-powered macOS-only release pipeline for Android + iOS apps.
The project is already scaffolded. Your job is to finish the setup so it runs cleanly.

## Project location
The project root is: `appwhoosh-release-tool/`

## Your tasks

1. Read `CLAUDE.md` and `README.md` first to understand the full project.

2. Run `pnpm install` and confirm all dependencies install without errors.

3. Verify Node.js version is 18+. If not, tell me what to install.

4. Check that the following binaries are available on PATH:
   - `adb` (Android Debug Bridge)
   - `fastlane`
   - `xcodebuild`
   - `xcrun`
   If any are missing, print the exact install command for macOS.

5. Create a `.env` file from `.env.example`. Leave placeholder values but add comments
   explaining exactly where to get each credential:
   - ANTHROPIC_API_KEY → https://console.anthropic.com
   - GOOGLE_PLAY_JSON_KEY_PATH → Google Play Console → Setup → API access → Service accounts
   - APP_STORE_KEY_ID / ISSUER_ID / KEY_PATH → App Store Connect → Users → Keys
   - MATCH_GIT_URL → a private GitHub repo you create for certs
   - KEYSTORE_BASE_PATH → folder where your .keystore files are stored

6. Run `node cli/index.js list` and confirm it prints the app registry without crashing.

7. Fix any import errors, missing modules, or path issues you find.

## Done when
- `pnpm install` succeeds
- `node cli/index.js list` runs and prints the registered apps
- `.env` file exists with all keys documented
