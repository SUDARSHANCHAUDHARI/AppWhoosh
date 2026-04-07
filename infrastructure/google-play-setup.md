# Google Play Service Account Setup Guide

Complete step-by-step to get your `service-account.json` for fastlane supply.

---

## Step 1 — Enable Google Play Android Developer API

1. Go to: https://console.cloud.google.com
2. Create a new project or select existing (e.g. "SudarshanTechLabs")
3. In the search bar, search: "Google Play Android Developer API"
4. Click Enable

---

## Step 2 — Create a Service Account

1. In Google Cloud Console → IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `blitz-release-tool`
4. Description: "Fastlane supply for Play Store uploads"
5. Click Create and Continue
6. Role: Skip (no GCP roles needed — Play Console has its own permissions)
7. Click Done

---

## Step 3 — Download the JSON Key

1. Click your new service account → Keys tab
2. Add Key → Create New Key → JSON
3. Download the file
4. Rename it to: `sudarshantechlabs-play-key.json`
5. Move to: `~/.blitz/credentials/sudarshantechlabs-play-key.json`
6. Set in `.env`:
   ```
   GOOGLE_PLAY_JSON_KEY_PATH=/Users/yourname/.blitz/credentials/sudarshantechlabs-play-key.json
   ```

---

## Step 4 — Grant Access in Play Console

1. Go to: https://play.google.com/console
2. Setup → API Access
3. You'll see a prompt to link to a Google Cloud project — link to the one you just used
4. Find your service account email (looks like: `blitz-release-tool@your-project.iam.gserviceaccount.com`)
5. Click "Grant Access"
6. Set permissions:
   - Release manager: YES
   - View app information: YES
   - Manage store presence: YES
   - Manage production releases: YES (careful — this allows publishing)
7. Click Invite User → Apply

---

## Step 5 — Test the connection

```bash
cd blitz-release-tool/
node cli/index.js ask "list all apps"
# OR test fastlane directly:
fastlane run validate_play_store_json_key json_key:/path/to/key.json
```

---

## Security Notes

- Store the JSON key in `~/.blitz/credentials/` — NOT inside the project repo
- Add `*.json` to `.gitignore` if you ever put it elsewhere
- Rotate the key every 12 months (Google Cloud → Service Accounts → Keys → Rotate)
- The service account only has Play Console access — not GCP billing or other services

---

## Troubleshooting

**Error: "The caller does not have permission"**
→ You haven't granted the service account access in Play Console (Step 4)

**Error: "Package not found"**
→ The app must already exist in Play Console (even as a draft)
→ Upload the first APK/AAB manually, then fastlane handles subsequent ones

**Error: "Invalid JWT"**
→ The JSON key file is corrupt or wrong project
→ Re-download from Google Cloud Console
