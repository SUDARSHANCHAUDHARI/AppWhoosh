# PROMPT 09 — Error Handling, Logging & Resilience

## Context
I am building AppWhoosh Release Tool. Production reliability matters —
a failed release at 2am should tell me exactly what went wrong and how to fix it.

## Your tasks

1. Create `tools/logger.js`:
   - Uses `chalk` for coloured terminal output
   - Log levels: `info` (white), `success` (green), `warn` (yellow), `error` (red), `step` (cyan)
   - Each log line includes timestamp
   - Writes to `~/.appwhoosh/logs/appwhoosh-{date}.log` (plain text, no colors)
   - Example output:
     ```
     [10:32:01] ℹ  Building example-app...
     [10:34:22] ✓  Build complete: app-release.aab (2m 21s)
     [10:34:22] →  Uploading to Google Play (track: production)...
     [10:37:05] ✓  Deploy complete
     [10:37:05] ✓  https://play.google.com/store/apps/details?id=com.x.app
     ```

2. Create `tools/errors.js` — custom error classes:
   - `AppWhooshError` (base)
   - `ConfigError` — missing/invalid config field
   - `BuildError` — Gradle or Xcode build failed
   - `SigningError` — keystore or cert issue
   - `DeployError` — fastlane supply/deliver failed
   - `ScreenshotError` — ADB or simctl failed
   - Each error class includes a `hint` property with a fix suggestion

3. Update all tool files to use logger.js and the custom error classes:
   - `tools/build-android.js` — replace console.log with logger
   - `tools/build-ios.js` — replace console.log with logger
   - `tools/deploy.js` — replace console.log with logger
   - `tools/screenshots.js` — replace console.log with logger

4. Add retry logic to `tools/deploy.js`:
   - If fastlane supply/deliver fails with a network error, retry up to 3 times
   - Wait 10 seconds between retries
   - Log each retry attempt

5. Add a `tools/preflight.js` module:
   - `checkAll()` — runs all pre-flight checks and returns `{ ok: bool, issues: [] }`
   - Checks: Node version, ADB available, Xcode available, fastlane available,
     ANTHROPIC_API_KEY set, GOOGLE_PLAY_JSON_KEY_PATH exists, env file present
   - `appwhoosh doctor` CLI command that runs `checkAll()` and prints a report:
     ```
     AppWhoosh Doctor
     ────────────────────────
     ✓ Node.js 20.x
     ✓ ADB connected (Pixel 7)
     ✓ Xcode 15.2
     ✓ fastlane 2.219
     ✓ Anthropic API key set
     ✗ GOOGLE_PLAY_JSON_KEY_PATH not set
       → Set this in your .env file
     ✗ No apps registered
       → Run: appwhoosh config add
     ────────────────────────
     2 issues found
     ```

6. Add crash reporting to `mcp/server.js`:
   - Wrap the agentic loop in try/catch
   - On crash: write full error + stack trace to `~/.appwhoosh/crash-{timestamp}.log`
   - Print a short user-friendly message + the log file path

## Done when
- `appwhoosh doctor` runs and prints the preflight report
- All tool files use logger.js (no raw console.log left)
- Custom error classes are used in at least build-android.js and deploy.js
- Crash logs are written on agent failures
