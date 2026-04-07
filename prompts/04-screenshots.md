# PROMPT 04 — Screenshot Automation System

## Context
I am building AppWhoosh Release Tool. Screenshots are required for both Play Store and App Store.
The challenge: I have 20+ apps, each with different UI flows.
The solution: per-app bash scripts + a smart screenshot manager.

## Files to work with
- `tools/screenshots.js`
- `scripts/screenshots/example-app-android.sh`
- `scripts/screenshots/example-app-ios.sh`

## Your tasks

1. Read all the above files first.

2. Rewrite `tools/screenshots.js` with these improvements:
   - Before running, check ADB is connected (Android) or simulator is booted (iOS)
   - After capture, verify each PNG file is > 10KB (not a blank screen)
   - Generate a `screenshots-report.json` in the output dir:
     ```json
     {
       "app_id": "example-app",
       "platform": "android",
       "timestamp": "2025-01-01T00:00:00Z",
       "screenshots": [
         { "file": "screen1.png", "size_kb": 245, "valid": true }
       ]
     }
     ```
   - Add `copyToMetadata(appId, platform)` function that copies screenshots
     from the output dir to the correct fastlane metadata path

3. Create `tools/screenshot-manager.js`:
   - `generateScriptTemplate(appId, platform)` — generates a new per-app
     screenshot script with correct package name / bundle ID pre-filled
   - `validateScript(scriptPath)` — checks script exists and is executable
   - `runAllScreenshots(platform)` — runs screenshots for every registered app,
     collects results, prints a summary table

4. Create a `scripts/screenshots/TEMPLATE-android.sh`:
   A well-commented template that developers copy per app.
   Include sections:
   - CONFIG (package name, activity, sleep duration)
   - PRE-FLIGHT (ADB connected? App installed?)
   - SCREENS (numbered, each with a comment for what to customize)
   - POST (verify files saved, print summary)

5. Create a `scripts/screenshots/TEMPLATE-ios.sh`:
   Same structure for iOS with simctl commands.

6. Add CLI commands:
   - `appwhoosh screenshots <app-id>` — capture for both platforms
   - `appwhoosh screenshots <app-id> --android-only`
   - `appwhoosh screenshots <app-id> --ios-only`
   - `appwhoosh screenshots all` — run for all apps (sequential)
   - `appwhoosh screenshots generate-script <app-id>` — generate script from template
   - `appwhoosh screenshots copy-to-metadata <app-id>` — copy to fastlane metadata dirs

7. Add a `appwhoosh screenshots preview <app-id>` command:
   - Opens the screenshot output folder in macOS Finder:
     `open /tmp/appwhoosh-builds/{app-id}/screenshots/`

## Done when
- `appwhoosh screenshots generate-script example-app` creates a pre-filled script
- `appwhoosh screenshots preview example-app` opens Finder
- Screenshot validation checks file size and reports blanks
- `copyToMetadata` correctly places files in fastlane directory structure
