# PROMPT 08 — Scale to 20+ Apps (Batch Operations)

## Context
I am building AppWhoosh Release Tool for SudarshanTechLabs.
I have 20+ Android apps on Google Play. Package prefix: `com.sudarshantechlabs`.
This prompt covers batch operations, bulk config generation, and managing many apps at once.

## Your tasks

1. Create `tools/batch.js`:

   `batchRelease(appIds, options)`:
   - Runs release pipeline for each app sequentially (not parallel — avoid store rate limits)
   - After each app: print ✓ or ✗ with duration
   - At the end: print a summary table with all results
   - Write results to `~/.appwhoosh/batch-{timestamp}.json`
   - Continue on failure (don't stop the whole batch for one failed app)

   `batchScreenshots(appIds, platform)`:
   - Same pattern — run for each app, collect results

   `batchValidate(appIds)`:
   - Runs `validateAndroidMetadata` and `validateIOSMetadata` for every app
   - Prints a table: App ID | Android | iOS | Issues

2. Create `tools/bulk-import.js`:

   `importFromPlayConsole(jsonKeyPath)`:
   - Uses Google Play Developer API to fetch all apps for the account
   - For each app: creates `config.json` from the Play Console data
   - Adds entries to `registry.json`
   - Creates metadata folder structure

   `generateConfigsFromPackageList(packages)`:
   - Input: array of package names like `["com.sudarshantechlabs.app1", ...]`
   - For each: derive app ID (strip prefix), create config.json template, add to registry
   - Prints what was created

3. Add CLI commands:
   - `appwhoosh batch release` — release all apps (with confirm prompt)
   - `appwhoosh batch release --filter android` — android only
   - `appwhoosh batch screenshots` — screenshots for all apps
   - `appwhoosh batch validate` — validate metadata for all apps
   - `appwhoosh batch import --packages "com.x.a,com.x.b,com.x.c"` — bulk add apps

4. Create `tools/dashboard.js`:
   - `printDashboard()` — prints a status table to terminal:
     ```
     APP ID          | ANDROID | iOS | LAST RELEASE    | SCREENSHOTS
     example-app     | ✓ built | —   | 3 days ago      | ✓ 3 shots
     another-app     | ✓ built | ✓   | today           | ✗ missing
     ```
   - Reads from `~/.appwhoosh/history.json`

5. Add CLI command: `appwhoosh dashboard` — prints the dashboard table.

6. Add to `mcp/tools.js`:
   - New tool: `batch_release` — releases multiple apps, input: `{ app_ids: string[] }`
   - New tool: `get_dashboard` — returns dashboard data as JSON

7. Create `scripts/bulk-add-apps.sh`:
   A shell script that accepts a list of package names and calls
   `appwhoosh config add` for each one non-interactively.
   Usage: `bash bulk-add-apps.sh com.x.app1 com.x.app2 com.x.app3`

## Done when
- `appwhoosh batch validate` runs metadata validation for all registered apps and prints a table
- `appwhoosh dashboard` prints the status table
- `appwhoosh batch release` asks for confirmation then runs sequentially
- `generateConfigsFromPackageList` creates configs for a list of package names
