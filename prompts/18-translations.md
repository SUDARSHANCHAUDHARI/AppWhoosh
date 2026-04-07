# PROMPT 18 — Multi-Language Metadata (AI Translation)

## Context
My apps target users in Thailand (th-TH), India (hi-IN), and globally (en-US).
Claude translates metadata into each locale automatically.
Fastlane supply/deliver picks up all locales automatically.

## Target locales
- `en-US` — English (already exists)
- `hi-IN` — Hindi (large Android market in India)
- `th-TH` — Thai (Bangkok base, local market)

## Your tasks

1. Create `tools/translate.js`:

   `translateMetadata(appId, fromLocale, toLocale, platform)`:
   - Reads all metadata files from `apps/{id}/metadata/{platform}/{fromLocale}/`
   - For each file (title, description, short_description, changelogs/default):
     - Call Claude API:
       ```
       Translate this {platform} app store metadata from {fromLocale} to {toLocale}.
       Field: {fieldName}
       Original: {text}
       Rules:
       - Keep character limits: title ≤ 50 (Android) / 30 (iOS), short_desc ≤ 80
       - Use natural, native phrasing — not literal translation
       - Keep brand names and app names in English
       - Preserve bullet points and formatting
       Return ONLY the translated text.
       ```
   - Write translated files to `apps/{id}/metadata/{platform}/{toLocale}/`
   - Return summary of files translated

   `translateAllApps(fromLocale, toLocale, platform)`:
   - Run translateMetadata for every registered app
   - Print progress: `[3/22] calorie-counter → th-TH`
   - Skip apps that already have the target locale (unless --force)

   `validateTranslation(appId, locale, platform)`:
   - Check all required files exist for the locale
   - Check character limits are respected
   - Return `{ valid: bool, errors: [] }`

2. Scaffold locale directories for all apps:
   - Create `tools/locale-scaffold.js`:
     - `scaffoldLocale(appId, locale, platform)` — creates empty locale folder structure
     - `scaffoldAllLocales(locales, platform)` — for every app, create all locale folders

3. Add CLI commands:
   - `appwhoosh translate <app-id> --to th-TH` — translate one app to Thai
   - `appwhoosh translate <app-id> --to hi-IN` — translate one app to Hindi
   - `appwhoosh translate all --to th-TH` — translate all apps to Thai
   - `appwhoosh translate all --to hi-IN --force` — retranslate even if exists
   - `appwhoosh translate validate <app-id> --locale th-TH` — check translation quality
   - `appwhoosh locale scaffold <app-id> --locales en-US,hi-IN,th-TH` — create folders

4. Add to `mcp/tools.js`:
   - Tool: `translate_metadata` — input: `{ app_id, to_locale, platform }`
   - Tool: `translate_all` — input: `{ to_locale, platform }`

5. Update `fastlane/Fastfile`:
   - The supply/deliver lanes already pick up all locales automatically
   - Add a validate step that checks all locales before upload

6. Create `config/locales.json`:
   ```json
   {
     "target_locales": ["en-US", "hi-IN", "th-TH"],
     "primary_locale": "en-US",
     "android_locale_map": {
       "en-US": "en-US",
       "hi-IN": "hi-IN",
       "th-TH": "th-TH"
     },
     "ios_locale_map": {
       "en-US": "en-US",
       "hi-IN": "hi-IN",
       "th-TH": "th-TH"
     }
   }
   ```

## Done when
- `appwhoosh translate myfamilytracker --to th-TH` creates Thai metadata files
- `appwhoosh translate all --to hi-IN` translates all 22 apps to Hindi
- Character limits are validated after translation
- Translated files appear in correct fastlane folder structure
