# PROMPT 02 — Android Engine (Build + Sign + Deploy)

## Context
I am building AppWhoosh Release Tool. This prompt covers the complete Android pipeline:
Gradle build → AAB signing → fastlane supply → Google Play.

My keystore convention (SudarshanTechLabs):
- File: `{KEYSTORE_BASE_PATH}/{appname}.keystore`
- Alias: `{appname}` (same as app ID)
- Store password: `$KEYSTORE_PASSWORD` from env
- Key password: `$KEYSTORE_KEY_PASSWORD` from env
- Algorithm: RSA 2048, validity 10000 days, CN=SudarshanTechLabs, OU=Bangkok, C=TH

## Files to work with
- `tools/build-android.js`
- `tools/deploy.js`
- `scripts/android-build.sh`
- `fastlane/Fastfile` (android platform section)
- `tools/screenshots.js` (androidShots function)

## Your tasks

1. Read all the above files first.

2. Improve `tools/build-android.js`:
   - Add pre-flight check: verify keystore file exists before starting build, throw with clear error if not
   - Add pre-flight check: verify `GOOGLE_PLAY_JSON_KEY_PATH` file exists
   - After build, verify the .aab file actually exists before returning its path
   - Support both `bundleRelease` and `bundleDebug` via a `debug` option
   - Print estimated build time at start ("This usually takes 2-5 minutes...")
   - Return an object `{ aabPath, buildTime }` instead of just the path

3. Improve `tools/deploy.js` (deployAndroid function):
   - Add `--whats_new` support: read from `config.release.whatsnew` or a `changelogs/default.txt` file
   - Add `--track` override: accept `internal`, `alpha`, `beta`, `production`
   - Print the Play Store URL after successful deploy:
     `https://play.google.com/store/apps/details?id={package}`
   - Catch fastlane errors and print a human-readable message

4. Add a `tools/keystore.js` utility:
   - `createKeystore(appId)` — generates a new keystore using keytool with the SudarshanTechLabs convention
   - `verifyKeystore(appId)` — verifies keystore exists and alias is valid
   - `listKeystores()` — lists all .keystore files in KEYSTORE_BASE_PATH

5. Add CLI commands:
   - `appwhoosh android build <app-id>` — build only
   - `appwhoosh android deploy <app-id> --aab <path> --track <track>` — deploy only
   - `appwhoosh android keystore create <app-id>` — create keystore
   - `appwhoosh android keystore verify <app-id>` — verify keystore

6. Improve `scripts/screenshots/example-app-android.sh`:
   - Add error handling: exit if ADB device not connected
   - Add device check: print connected device name before starting
   - Add a configurable SLEEP_DURATION variable at the top

## Done when
- `appwhoosh android build example-app` runs (even if it fails on missing project — the logic should be correct)
- `appwhoosh android keystore verify example-app` checks and reports keystore status
- All pre-flight checks fire before any build starts
