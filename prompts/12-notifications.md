# PROMPT 12 — Notifications (macOS + Telegram)

## Context
When AppWhoosh runs a release (especially batch releases), I need to know when it succeeds or fails.
Two channels: macOS system notifications + Telegram bot message.

## Your tasks

1. Create `tools/notify.js`:

   `notifyMac(title, message, options)`:
   - Use `osascript` to show a macOS notification
   - `options.sound` — play a sound (default: "Glass" for success, "Basso" for error)
   - `options.subtitle` — optional subtitle
   - Example: `notifyMac("AppWhoosh ✓", "example-app released to Play Store", { sound: "Glass" })`

   `notifyTelegram(message)`:
   - POST to Telegram Bot API: `https://api.telegram.org/bot{TOKEN}/sendMessage`
   - Uses env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - If vars not set, skip silently (don't throw)
   - Format messages with Markdown:
     ```
     ✅ *AppWhoosh Release Complete*
     App: `example-app`
     Platform: Android
     Track: production
     Duration: 4m 32s
     ```

   `notifyError(appId, platform, error)`:
   - Sends both macOS + Telegram notifications
   - Telegram message includes error message and hint

   `notifySuccess(appId, platform, duration)`:
   - Sends both macOS + Telegram notifications
   - Includes Play Store / App Store URL

2. Add `.env.example` entries:
   ```
   TELEGRAM_BOT_TOKEN=
   TELEGRAM_CHAT_ID=
   ```

3. Wire notifications into:
   - `tools/deploy.js` → call `notifySuccess` after successful deploy
   - `tools/deploy.js` → call `notifyError` in catch block
   - `tools/batch.js` → send Telegram summary after all apps finish:
     ```
     📊 *AppWhoosh Batch Complete*
     ✅ 18 apps released
     ❌ 2 failed: broken-app, another-app
     Duration: 42m 18s
     ```

4. Add `docs/telegram-setup.md`:
   - How to create a Telegram bot via @BotFather
   - How to get your chat ID
   - How to test: `appwhoosh notify test`

5. Add CLI command: `appwhoosh notify test`:
   - Sends a test macOS notification
   - Sends a test Telegram message if credentials are set
   - Prints result

6. Add to SwiftUI `AppWhooshApp.swift`:
   - Import `UserNotifications`
   - Request notification permission on launch
   - Show a local notification when a release completes
   - Notification actions: "View in Store" button

## Done when
- `appwhoosh notify test` shows a macOS notification
- Telegram message is sent if `TELEGRAM_BOT_TOKEN` is set
- `notifySuccess` and `notifyError` are called from deploy.js
- Batch summary Telegram message includes pass/fail counts
