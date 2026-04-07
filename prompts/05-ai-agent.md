# PROMPT 05 — AI Agent / MCP Layer (Claude API Orchestration)

## Context
I am building AppWhoosh Release Tool. This is the AppWhoosh-like magic layer —
the user types natural language and Claude figures out what to run.

The AI agent uses the Anthropic Claude API with tool_use (function calling).
It runs an agentic loop: Claude calls tools → we execute → results go back → Claude continues.

## Files to work with
- `mcp/server.js` — AI agent agentic loop
- `mcp/tools.js` — tool registry (8 tools defined)

## Your tasks

1. Read both files fully first.

2. Improve `mcp/server.js`:
   - Add streaming output support: use `stream: true` on the API call so the
     user sees Claude's thinking token by token instead of waiting
   - Add a `--confirm` flag: before running `release_app` or `release_all`,
     print what will happen and ask "Proceed? (y/n)"
   - Add conversation history: keep last 10 messages in memory so the user
     can say "now do the same for the other app"
   - Handle API rate limit errors: retry with exponential backoff (max 3 retries)
   - Add a `--dry-run` flag that prints what tools would be called without running them

3. Improve `mcp/tools.js`:
   - Add a new tool: `get_app_status`
     - Returns build status, last deploy date, last screenshot date for an app
     - Reads from a `~/.appwhoosh/history.json` file (create if missing)
   - Add a new tool: `update_whatsnew`
     - Input: `app_id`, `text`
     - Writes the text to `apps/{app-id}/metadata/android/en-US/changelogs/default.txt`
     - And to `apps/{app-id}/metadata/ios/en-US/release_notes.txt`
   - Add a new tool: `open_store_listing`
     - Opens the Play Store or App Store listing URL in the browser
     - Uses `open` command on macOS

4. Create `mcp/history.js`:
   - Stores a log of every tool execution to `~/.appwhoosh/history.json`
   - Fields: `timestamp`, `app_id`, `tool_name`, `success`, `duration_ms`, `error`
   - `getHistory(appId)` — returns history for one app
   - `getLastRelease(appId)` — returns the most recent successful `release_app` entry

5. Update the SYSTEM_PROMPT in `mcp/server.js`:
   - Add: "You are running on macOS for SudarshanTechLabs, a solo Android developer
     with 20+ apps on Google Play. Package prefix: com.sudarshantechlabs."
   - Add: "When the user says 'release all', always confirm before proceeding."
   - Add: "When a tool fails, suggest a specific fix based on the error message."
   - Add: "Keep responses concise. Use bullet points for multi-step summaries."

6. Add CLI command: `appwhoosh history <app-id>` — prints last 10 operations for that app.

7. Add CLI command: `appwhoosh ask` in interactive mode:
   - If no message argument given, start a REPL loop
   - User types commands, Claude responds, conversation continues
   - Type `exit` to quit

## Done when
- `appwhoosh ask "what apps do I have?"` calls `list_apps` and responds correctly
- `appwhoosh ask "release example-app"` asks for confirmation before running
- History is written to `~/.appwhoosh/history.json` after each tool call
- `appwhoosh history example-app` prints recent operations
- Interactive REPL works: `appwhoosh ask` starts a conversation loop
