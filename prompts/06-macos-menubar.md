# PROMPT 06 — macOS Menu Bar App (SwiftUI)

## Context
I am building AppWhoosh Release Tool. The macOS UI layer is a menu bar app built in SwiftUI.
It wraps the CLI and AI agent behind a native macOS interface.
The app must run on macOS 13+ (Ventura and above).

## Files to work with
- `AppWhooshMenuBar/AppWhooshApp.swift` — full app stub already written

## Setup required first
1. Open Xcode
2. Create new project → macOS → App
3. Name: AppWhooshMenuBar, Bundle ID: com.sudarshantechlabs.appwhooshreleasetool
4. Copy `AppWhooshMenuBar/AppWhooshApp.swift` content into your project
5. In Info.plist set: `Application is agent (UIElement)` = YES

## Your tasks

1. Read `AppWhooshMenuBar/AppWhooshApp.swift` fully first.

2. Fix the `shell()` function in `AppWhooshViewModel`:
   - Replace the hardcoded `/path/to/appwhoosh-release-tool` with a dynamic path
   - Read the CLI path from UserDefaults key `appwhoosh.cli.path`
   - If not set, show a setup prompt asking user to locate the CLI

3. Implement `loadApps()` properly:
   - Call `node cli/index.js list` via shell()
   - Parse the output to extract app IDs
   - Handle errors gracefully (show "No apps found" if CLI fails)

4. Add a `SettingsView`:
   - Field: CLI path (file picker, saves to UserDefaults)
   - Field: Default platform (Android / iOS / Both) — picker
   - Toggle: Confirm before release (default ON)
   - Toggle: Skip screenshots (default OFF)
   - Button: Test connection (runs `appwhoosh list` and shows result)

5. Improve `AppRow`:
   - Show last release date (read from `~/.appwhoosh/history.json`)
   - Add platform badges: 🤖 Android, 🍎 iOS
   - Add a "..." menu per app: Release Android, Release iOS, Screenshots, View in Store

6. Add `LogView` as a proper component:
   - Monospaced font, dark background
   - Auto-scroll to bottom on new output
   - Copy button (copies full log to clipboard)
   - Clear button

7. Add a `ReleaseProgressView`:
   - Shows when a release is running
   - Steps: Build → Screenshots → Deploy
   - Each step shows: pending / running / done / failed
   - Cancel button that kills the running process

8. Add keyboard shortcut: Cmd+R → trigger release for selected app.

9. Add menu bar icon states:
   - Default: bolt icon (gray)
   - Building: bolt icon (yellow, animated pulse)
   - Success: bolt icon (green)
   - Error: bolt icon (red)

## Done when
- App launches as menu bar only (no Dock icon)
- App list loads from CLI
- Release runs and shows progress
- Settings panel saves CLI path
- Log panel shows real-time output
