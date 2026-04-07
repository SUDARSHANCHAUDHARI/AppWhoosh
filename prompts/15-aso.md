# PROMPT 15 — ASO (App Store Optimization) with AI

## Context
I have 20+ utility apps. ASO is how they get discovered.
This prompt uses Claude API to research keywords, rewrite descriptions,
and score metadata quality for each app.

## Your tasks

1. Create `tools/aso.js`:

   `scoreMetadata(appId, platform)`:
   - Reads current metadata files
   - Scores on: title length, keyword density, description length,
     call-to-action presence, emoji usage, bullet points
   - Returns `{ score: 0-100, issues: [], suggestions: [] }`

   `optimizeTitle(appId, currentTitle, keywords)`:
   - Call Claude API with prompt:
     ```
     You are an ASO expert for Google Play Store.
     App: {currentTitle}
     Target keywords: {keywords}
     Rules: max 30 chars, include primary keyword, no special chars
     Return ONLY the optimized title, nothing else.
     ```
   - Return the optimized title string

   `optimizeDescription(appId, currentDescription, keywords)`:
   - Call Claude API:
     ```
     You are an ASO expert. Rewrite this Play Store description.
     Current: {currentDescription}
     Keywords to include: {keywords}
     Rules: max 4000 chars, keyword in first 167 chars, use bullet points,
     include call to action, no spam. Return ONLY the description.
     ```

   `researchKeywords(appId, category)`:
   - Call Claude API:
     ```
     Suggest 30 high-value keywords for a {category} Android app called {displayName}.
     Focus on: long-tail keywords, low competition, high intent.
     Return as JSON array of strings only.
     ```
   - Return array of keyword strings

   `generateShortDescription(appId, title, keywords)`:
   - Claude API → max 80 chars, includes primary keyword, strong hook

2. Create `tools/aso-report.js`:
   - `runASOAudit(appId)` — runs all checks, returns full report
   - `printASOReport(appId)` — prints colored terminal report:
     ```
     ASO Audit: myfamilytracker
     ──────────────────────────
     Score: 72/100

     ✓ Title length: 18 chars (good)
     ✗ Short description: missing primary keyword
     ✗ Full description: too short (800 chars, aim for 2500+)
     ✓ Screenshots: 5 found
     ! Keywords: consider adding "family location tracker"

     Suggestions:
     1. Add "GPS tracker" to title
     2. Expand description with feature bullet points
     3. Include "real-time" in short description
     ```

3. Add CLI commands:
   - `appwhoosh aso audit <app-id>` — run ASO audit and print report
   - `appwhoosh aso optimize <app-id>` — AI-optimize title + description + short desc
   - `appwhoosh aso keywords <app-id>` — research and suggest keywords
   - `appwhoosh aso audit-all` — audit every registered app, print summary table

4. Add to `mcp/tools.js`:
   - Tool: `aso_audit` — input: `{ app_id }`
   - Tool: `aso_optimize` — input: `{ app_id, field: "title"|"description"|"short_description" }`
   - Tool: `aso_keywords` — input: `{ app_id }`

5. Wire into metadata flow:
   - After `appwhoosh metadata scaffold <app-id>`, auto-run `aso audit`
   - Before `appwhoosh deploy`, warn if ASO score < 60

## Done when
- `appwhoosh aso audit myfamilytracker` prints a scored report
- `appwhoosh aso optimize myfamilytracker` calls Claude API and rewrites metadata files
- `appwhoosh aso keywords myfamilytracker` returns 30 keyword suggestions
- ASO score warning appears before deploy if score is low
