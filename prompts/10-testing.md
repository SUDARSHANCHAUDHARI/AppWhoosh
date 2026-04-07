# PROMPT 10 — Testing Suite

## Context
AppWhoosh Release Tool needs tests so regressions don't silently break 20+ app releases.
We test the logic layer only — no real builds, no real store uploads.
Use Node.js built-in `node:test` (no extra test framework needed).

## Your tasks

1. Create `tests/config.test.js`:
   - Test `loadAppConfig('example-app')` returns correct fields
   - Test `loadAppConfig('nonexistent')` throws with clear message
   - Test `listAppIds()` returns array with at least one entry
   - Test `resolveKeystorePath()` returns correct path pattern

2. Create `tests/build-android.test.js`:
   - Mock `execSync` — do not run real Gradle
   - Test that build fails fast if keystore path does not exist
   - Test that build fails fast if android path does not exist
   - Test that correct Gradle task is selected for flavored vs plain builds
   - Test that returned object has `{ aabPath, buildTime }` shape

3. Create `tests/deploy.test.js`:
   - Mock `execSync` — do not run real fastlane
   - Test `deployAndroid` throws if `GOOGLE_PLAY_JSON_KEY_PATH` not set
   - Test `deployIOS` throws if `APP_STORE_KEY_ID` not set
   - Test correct fastlane flags are constructed from config

4. Create `tests/screenshots.test.js`:
   - Mock `execSync`
   - Test that missing screenshot script throws `ScreenshotError`
   - Test that `screenshotsAndroid` creates output directory
   - Test that blank PNG (< 10KB) triggers a warning

5. Create `tests/metadata.test.js`:
   - Test `validateAndroidMetadata` catches missing title.txt
   - Test character limit validation (title > 50 chars → error)
   - Test `scaffoldMetadata` creates all required files

6. Create `tests/agent.test.js`:
   - Mock Anthropic SDK
   - Test that `runAgent("list apps")` calls `list_apps` tool
   - Test that unknown tool name throws cleanly
   - Test that tool result is fed back into message history

7. Add to `package.json`:
   ```json
   "scripts": {
     "test": "node --test tests/*.test.js",
     "test:watch": "node --test --watch tests/*.test.js"
   }
   ```

8. Create `tests/fixtures/example-app-config.json`:
   A complete valid config fixture used across all tests.

## Done when
- `npm test` runs all test files without errors
- At least 20 test cases pass
- No test makes real network calls or filesystem writes outside /tmp
