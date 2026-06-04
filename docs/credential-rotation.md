# Credential Rotation Guide

Rotate credentials regularly. This guide covers each credential type.

---

## 1. Anthropic API Key — Rotate every 90 days

1. Go to: https://console.anthropic.com → API Keys
2. Create new key → name it `appwhoosh-v2` (include date)
3. Update `.env`: `ANTHROPIC_API_KEY=YOUR_NEW_ANTHROPIC_API_KEY`
4. Test: `appwhoosh ask "list apps"`
5. Delete old key in Anthropic Console

---

## 2. Google Play Service Account Key — Rotate every 12 months

1. Google Cloud Console → IAM & Admin → Service Accounts
2. Click `appwhoosh-release-tool` service account → Keys tab
3. Add Key → Create New Key → JSON → Download
4. Move to `~/.appwhoosh/credentials/sudarshantechlabs-play-key-new.json`
5. Update `.env`: `GOOGLE_PLAY_JSON_KEY_PATH=/Users/YOUR_MAC_USERNAME/.appwhoosh/credentials/YOUR_NEW_PLAY_KEY_FILE.json`
6. Test: `appwhoosh deploy <any-app> --dry-run` (if supported) or `appwhoosh list`
7. Delete old key in Google Cloud Console (Keys tab → Delete)

---

## 3. App Store Connect API Key — Rotate every 12 months

1. App Store Connect → Users and Access → Keys
2. Generate new key → Download `.p8`
3. Note new Key ID and Issuer ID
4. Move to `~/.appwhoosh/credentials/AuthKey_NEWKEYID.p8`
5. Update `.env`:
   ```
   APP_STORE_KEY_ID=NEWKEYID
   APP_STORE_KEY_PATH=/path/to/AuthKey_NEWKEYID.p8
   ```
   (Issuer ID usually stays the same)
6. Test: `appwhoosh ios build <any-app>` or fastlane validate
7. Revoke old key in App Store Connect

---

## 4. fastlane Match Passphrase — Rotate if compromised

⚠️ This is destructive — requires regenerating all certificates.

```bash
# Step 1: Nuke all existing certs (THIS DELETES FROM APPLE + GIT REPO)
fastlane match nuke appstore

# Step 2: Re-run match for each bundle ID with new passphrase
fastlane match appstore --app_identifier com.sudarshantechlabs.myfamilytracker
# Enter new passphrase when prompted

# Step 3: Update .env
MATCH_PASSWORD=new_passphrase_here

# Step 4: Test build
appwhoosh ios build myfamilytracker
```

---

## 5. Android Keystores — NEVER rotate (critical)

Android keystores cannot be rotated without losing the ability to update your app.
The keystore is permanently tied to your Play Store listing.

**Protect keystores:**
- Keep encrypted backups in at least 2 locations (iCloud, external drive)
- Never commit to git
- Never share via email or Slack
- Store password in macOS Keychain as backup:
  ```bash
  security add-generic-password -a "appwhoosh" -s "keystore-password" -w "YOUR_KEYSTORE_PASSWORD"
  # Retrieve:
  security find-generic-password -a "appwhoosh" -s "keystore-password" -w
  ```

---

## 6. Telegram Bot Token — Rotate if exposed

1. Open Telegram → @BotFather → `/mybots` → Select bot → API Token → Revoke
2. Copy new token
3. Update `.env`: `TELEGRAM_BOT_TOKEN=new_token`
4. Test: `appwhoosh notify test`

---

## Rotation Schedule

| Credential | Frequency | Last Rotated | Next Due |
|---|---|---|---|
| Anthropic API Key | 90 days | — | — |
| Play Service Account | 12 months | — | — |
| App Store API Key | 12 months | — | — |
| Match Passphrase | Only if compromised | — | — |
| Telegram Token | Only if exposed | — | — |

Update this table after each rotation.
