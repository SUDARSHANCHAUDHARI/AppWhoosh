# PROMPT 16 — Analytics Dashboard (Play Console + App Store)

## Context
Pull real installs, ratings, crashes, and revenue data from both stores.
Display in terminal and export to CSV/Excel for tracking.

## Your tasks

1. Create `tools/analytics.js`:

   `getPlayStoreStats(appId)`:
   - Use Google Play Developer API (same service account JSON)
   - Endpoint: `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{package}/reviews`
   - Fetch: total installs, active installs, rating, review count, crash rate
   - Return structured object:
     ```json
     {
       "installs": 1240,
       "activeInstalls": 890,
       "rating": 4.2,
       "reviews": 43,
       "crashes": 2,
       "lastUpdated": "2025-01-01"
     }
     ```

   `getAppStoreStats(appId)`:
   - Use App Store Connect API (same .p8 key)
   - Fetch: downloads, active devices, rating, crash count
   - Return same shape as above

   `getAllStats()`:
   - Fetch stats for all registered apps (both platforms)
   - Cache results in `~/.appwhoosh/stats-cache.json` (TTL: 6 hours)
   - Return array of `{ appId, android: stats, ios: stats }`

2. Create `tools/dashboard-full.js`:

   `printFullDashboard()`:
   - Terminal table using chalk + padding:
     ```
     ┌─────────────────────┬──────────┬────────┬────────┬──────────┬──────────────┐
     │ APP                 │ INSTALLS │ ACTIVE │ RATING │ REVIEWS  │ LAST RELEASE │
     ├─────────────────────┼──────────┼────────┼────────┼──────────┼──────────────┤
     │ myfamilytracker     │  1,240   │   890  │  4.2★  │    43    │  2 days ago  │
     │ calorie-counter     │    456   │   312  │  4.5★  │    12    │  1 week ago  │
     └─────────────────────┴──────────┴────────┴────────┴──────────┴──────────────┘
     Total: 22 apps · 18,430 installs · 12,890 active
     ```

3. Create `tools/export.js`:

   `exportToCSV(data, outputPath)`:
   - Write analytics data to CSV
   - Columns: App ID, Package, Installs, Active, Rating, Reviews, Last Release, Version

   `exportToExcel(data, outputPath)`:
   - Write to .xlsx using the existing xlsx skill
   - One sheet per platform (Android, iOS)
   - Auto-format: numbers right-aligned, rating with star, dates formatted

4. Add CLI commands:
   - `appwhoosh stats <app-id>` — stats for one app
   - `appwhoosh stats all` — full dashboard table
   - `appwhoosh stats export --csv` — export to CSV
   - `appwhoosh stats export --xlsx` — export to Excel
   - `appwhoosh dashboard` — alias for `appwhoosh stats all`

5. Add to `mcp/tools.js`:
   - Tool: `get_stats` — input: `{ app_id }`
   - Tool: `get_dashboard` — no input, returns all stats

6. Add `appwhoosh stats trend <app-id>`:
   - Compare this week vs last week installs
   - Uses cached history: `~/.appwhoosh/stats-history.json`
   - Prints: `↑ +12% installs this week (1,240 vs 1,107)`

## Done when
- `appwhoosh stats myfamilytracker` fetches and prints real Play Store data
- `appwhoosh stats all` prints the full dashboard table
- `appwhoosh stats export --csv` creates a downloadable CSV
- Stats are cached and not re-fetched within 6 hours
