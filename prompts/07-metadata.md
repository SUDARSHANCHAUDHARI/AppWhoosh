# PROMPT 07 — Metadata Management

## Context
I am building AppWhoosh Release Tool. Metadata = everything except the binary:
titles, descriptions, screenshots, changelogs, keywords.
Both Play Store (fastlane supply format) and App Store (fastlane deliver format).

## Files to work with
- `apps/example-app/metadata/android/en-US/README.md`
- `apps/example-app/metadata/ios/en-US/README.md`
- `tools/deploy.js`

## Your tasks

1. Create `tools/metadata.js`:

   `validateAndroidMetadata(appId)`:
   - Check all required files exist: title.txt, short_description.txt, full_description.txt
   - Check character limits: title ≤ 50, short_description ≤ 80, full_description ≤ 4000
   - Check screenshots exist in `phoneScreenshots/` folder
   - Return `{ valid: bool, errors: [], warnings: [] }`

   `validateIOSMetadata(appId)`:
   - Check: name.txt, subtitle.txt, description.txt, keywords.txt, release_notes.txt
   - Check limits: name ≤ 30, subtitle ≤ 30, keywords ≤ 100
   - Return `{ valid: bool, errors: [], warnings: [] }`

   `scaffoldMetadata(appId, platform, displayName)`:
   - Creates all required metadata files with placeholder content
   - Fills in the app name in title/name files automatically
   - Creates correct folder structure for fastlane

   `updateChangelog(appId, text, locale)`:
   - Writes changelog to android: `changelogs/default.txt`
   - Writes release notes to ios: `release_notes.txt`
   - If text is null, prompt with AI: generate changelog from git log

   `generateChangelogFromGit(appId)`:
   - Run `git log --oneline -10` in the app's android folder
   - Send to Claude API: "Write a user-friendly Play Store changelog from these commits: ..."
   - Return the generated text

2. Add CLI commands:
   - `appwhoosh metadata validate <app-id>` — validate both platforms, print report
   - `appwhoosh metadata scaffold <app-id>` — create all metadata files from scratch
   - `appwhoosh metadata changelog <app-id> "Bug fixes and improvements"` — update changelog
   - `appwhoosh metadata changelog <app-id> --ai` — generate changelog from git log using Claude

3. Add to `fastlane/Fastfile`:
   - A `validate_metadata` lane that checks metadata before deploy
   - Call it automatically before `deploy` lane runs

4. Create `apps/example-app/metadata/android/en-US/title.txt` with content:
   `Example App`

5. Create `apps/example-app/metadata/android/en-US/short_description.txt`:
   `A useful utility app by SudarshanTechLabs.`

6. Create `apps/example-app/metadata/android/en-US/full_description.txt`:
   A multi-line placeholder description with correct format.

7. Create `apps/example-app/metadata/ios/en-US/name.txt`: `Example App`
8. Create `apps/example-app/metadata/ios/en-US/keywords.txt`: `utility, tools, android`
9. Create `apps/example-app/metadata/ios/en-US/release_notes.txt`: `Bug fixes and performance improvements.`

## Done when
- `appwhoosh metadata validate example-app` prints a clear pass/fail report
- `appwhoosh metadata scaffold my-new-app` creates all files
- `appwhoosh metadata changelog example-app --ai` calls Claude and writes a changelog
- All metadata files for example-app exist with correct content
