# CLAUDE.md — AppWhoosh
# Claude Code skill for SudarshanTechLabs

## What this project is
AppWhoosh — AI-powered macOS release pipeline for Android + iOS apps.
Tagline: "Ship your apps. Whoosh."
CLI command: `appwhoosh`
Built by Sudarshan, SudarshanTechLabs, Bangkok, Thailand.

## Developer context
- Company: SudarshanTechLabs
- Developer: Sudarshan (solo)
- Location: Bangkok, Thailand
- Package prefix: `com.sudarshantechlabs`
- GitHub: `SUDARSHANCHAUDHARI`
- macOS app bundle ID: `com.sudarshantechlabs.appwhoosh`
- Play Store email: `sudarshantechlabs@gmail.com`
- Privacy policy: `https://sudarshanchaudhari.github.io/{appname}-privacy-policy/`

## Project layout
```
cli/index.js              ← CLI (Commander.js), command: appwhoosh
mcp/server.js             ← Claude API agentic loop
mcp/tools.js              ← 15 registered tools
tools/config.js           ← App config loader
tools/build-android.js    ← Gradle build + AAB signing
tools/build-ios.js        ← Xcode archive + IPA export
tools/deploy.js           ← fastlane supply + deliver
tools/screenshots.js      ← ADB + simctl screenshot automation
tools/logger.js           ← Coloured logger + disk log
tools/errors.js           ← 7 custom error classes with hints
tools/notify.js           ← macOS osascript + Telegram Bot API
tools/history.js          ← ~/.appwhoosh/history.json
tools/version.js          ← Read/bump build.gradle versions
tools/keystore.js         ← keytool wrapper
tools/preflight.js        ← appwhoosh doctor checks
tools/batch.js            ← Batch release/screenshots/validate
tools/aso.js              ← ASO scoring + Claude API optimizer
tools/translate.js        ← Claude API metadata translation
apps/{id}/config.json     ← Per-app config
config/registry.json      ← Master app list
fastlane/Fastfile         ← Android supply + iOS deliver lanes
AppWhooshMenuBar/         ← SwiftUI macOS menu bar app
tests/                    ← node:test test suite
```

## Keystore convention (never change)
- File: `{KEYSTORE_BASE_PATH}/{keystoreAlias}.keystore`
- Alias: matches `android.keystoreAlias` in config.json
- Store + key password: `$KEYSTORE_PASSWORD` / `$KEYSTORE_KEY_PASSWORD`
- Algorithm: RSA 2048, 10000 days, CN=SudarshanTechLabs, C=TH

## State stored in ~/.appwhoosh/
- `history.json` — release history
- `versions.json` — version bump log
- `logs/appwhoosh-YYYY-MM-DD.log` — daily log file
- `credentials/` — service account JSON, .p8 key
- `crash-{timestamp}.log` — agent crash logs

## CLI command name
The CLI binary is `appwhoosh` (not `blitz`).
All references in code, docs, and scripts use `appwhoosh`.

## Coding rules
- All tool files use `tools/logger.js` — no raw `console.log`
- All errors use classes from `tools/errors.js`
- Every tool does pre-flight checks before starting work
- Build output goes to `BUILD_OUTPUT_DIR` (default `/tmp/appwhoosh-builds/`)
- History written to `~/.appwhoosh/history.json` after every tool call
- Never hardcode credentials or package names in source files
- Screenshot scripts receive output dir as `$1`
- Metadata follows fastlane supply/deliver folder structure exactly
- Never run `release_all` without user confirmation

## Common tasks

### Add a new app
1. `appwhoosh config add` — interactive
2. Or: copy `apps/example-app/config.json` → `apps/{id}/config.json`
3. Add to `config/registry.json`
4. Run: `appwhoosh config validate {id}`

### Add a new CLI command
1. Open `cli/index.js`
2. Add `program.command(...)` block
3. Wire to tool function
4. Test: `node cli/index.js --help`

### Add a new MCP tool
1. Open `mcp/tools.js`
2. Add to `TOOLS` array: name, description, input_schema, handler
3. Handler returns JSON-serializable object
4. Test: `appwhoosh ask "call {tool_name}"`

## Do not
- Commit `.env`, `*.keystore`, `*.p8`, `*.p12`
- Use `console.log` directly (use `tools/logger.js`)
- Use the old name "blitz" or "Blitz" anywhere in code or docs
- Run release-all without confirming with user
- Change keystore convention
