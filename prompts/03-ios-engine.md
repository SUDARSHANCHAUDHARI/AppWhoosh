# PROMPT 03 — iOS Engine (Build + Sign + Deploy)

## Context
I am building AppWhoosh Release Tool. This prompt covers the complete iOS pipeline:
fastlane match (certs) → xcodebuild archive → export IPA → fastlane deliver → App Store Connect.

iOS is harder than Android due to code signing. The approach:
- Use fastlane match for certificate management (git-based)
- Use App Store Connect API key (not Apple ID + password)
- Export IPA with app-store method

## Files to work with
- `tools/build-ios.js`
- `tools/deploy.js` (deployIOS function)
- `scripts/ios-build.sh`
- `fastlane/Fastfile` (ios platform section)

## Your tasks

1. Read all the above files first.

2. Improve `tools/build-ios.js`:
   - Add pre-flight check: verify Xcode is installed (`xcode-select -p`)
   - Add pre-flight check: verify workspace file exists
   - Add pre-flight check: verify MATCH_GIT_URL is set in env
   - After export, verify IPA exists before returning path
   - Add `clean` option (default true) — skip clean for faster dev builds
   - Return `{ ipaPath, buildTime }` object

3. Add `tools/match.js` utility:
   - `syncCerts(bundleId, type)` — runs `fastlane match {type}` for appstore/development
   - `nukeAndRenew(bundleId)` — use with caution: nuke + re-create certs
   - `listCerts()` — list available certs in the match repo

4. Improve `tools/deploy.js` (deployIOS function):
   - Read `release_notes.txt` from metadata path for what's new
   - Support `submitForReview: true/false` from config
   - Print App Store Connect URL after deploy:
     `https://appstoreconnect.apple.com/apps/{apple_id}/appstore`
   - Catch common errors and print human-readable messages:
     - "No bundle ID found" → check config.ios.bundleId
     - "Invalid credentials" → check APP_STORE_KEY_* env vars

5. Add `tools/simulator.js` utility:
   - `listSimulators()` — list available iOS simulators
   - `bootSimulator(deviceName)` — boot a simulator by name
   - `shutdownAll()` — shutdown all simulators
   - `installApp(bundleId, appPath)` — install .app on booted sim
   - `launchApp(bundleId)` — launch app on booted sim

6. Add CLI commands:
   - `appwhoosh ios build <app-id>` — build only
   - `appwhoosh ios deploy <app-id> --ipa <path>` — deploy only
   - `appwhoosh ios certs sync <app-id>` — sync match certificates
   - `appwhoosh ios simulators list` — list available simulators

7. Improve `scripts/screenshots/example-app-ios.sh`:
   - Add check: print Xcode version at start
   - Add simulator status check before launching
   - Shut down simulator after screenshots are done

## Done when
- `appwhoosh ios certs sync example-app` runs fastlane match correctly
- `appwhoosh ios simulators list` prints available simulators
- Pre-flight checks fire before any build starts
- Build + deploy functions return structured result objects
