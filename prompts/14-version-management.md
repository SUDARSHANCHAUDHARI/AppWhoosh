# PROMPT 14 — Version Management

## Context
Every Android release needs an incremented versionCode and versionName.
This prompt automates version bumping, syncing, and tracking across all 20+ apps.

## Your tasks

1. Create `tools/version.js`:

   `getCurrentVersion(appId)`:
   - Read `versionCode` and `versionName` from `apps/{id}/android/app/build.gradle`
   - Parse using regex: `versionCode\s+(\d+)` and `versionName\s+"([\d.]+)"`
   - Return `{ versionCode: number, versionName: string }`

   `bumpVersion(appId, type)`:
   - type: `"patch"` | `"minor"` | `"major"` | `"code-only"`
   - patch: 1.0.0 → 1.0.1, minor: 1.0.0 → 1.1.0, major: 1.0.0 → 2.0.0
   - Always increment versionCode by 1 regardless of type
   - Write back to build.gradle using str_replace (not full file rewrite)
   - Record in `~/.appwhoosh/versions.json`: `{ appId, old, new, timestamp }`
   - Return `{ old: { versionCode, versionName }, new: { versionCode, versionName } }`

   `syncVersions(appId)`:
   - If app has ios config: update `ios/{scheme}/Info.plist`
     - `CFBundleShortVersionString` = versionName
     - `CFBundleVersion` = versionCode (as string)

   `getVersionHistory(appId)`:
   - Read `~/.appwhoosh/versions.json`
   - Return last 10 entries for this app

   `bumpAllVersions(type)`:
   - Bump version for every registered app
   - Print summary table

2. Auto-bump before build:
   - In `tools/build-android.js`, before calling Gradle:
     - Call `bumpVersion(appId, "patch")` automatically
     - Log: `[Version] example-app: 1.0.5 (42) → 1.0.6 (43)`

3. Add CLI commands:
   - `appwhoosh version <app-id>` — show current version
   - `appwhoosh version bump <app-id> [patch|minor|major]` — bump version
   - `appwhoosh version bump-all [patch|minor|major]` — bump all apps
   - `appwhoosh version history <app-id>` — show version history
   - `appwhoosh version sync <app-id>` — sync Android version to iOS Info.plist

4. Add to `mcp/tools.js`:
   - Tool: `bump_version` — input: `{ app_id, type }`
   - Tool: `get_version` — input: `{ app_id }`

5. Create `tools/version-report.js`:
   - `printVersionTable()` — prints all apps with current versions:
     ```
     APP ID              VERSION    CODE   LAST BUMPED
     myfamilytracker     2.1.4      87     2 days ago
     calorie-counter     1.0.3      12     1 week ago
     ```

## Done when
- `appwhoosh version myfamilytracker` prints current version
- `appwhoosh version bump myfamilytracker patch` increments version in build.gradle
- Build auto-bumps patch version before Gradle runs
- Version history is saved to `~/.appwhoosh/versions.json`
