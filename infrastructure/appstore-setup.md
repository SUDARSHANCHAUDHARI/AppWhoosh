# App Store Connect API Key Setup Guide

Complete step-by-step to get your `.p8` key for fastlane deliver.

---

## Step 1 — Generate the API Key

1. Go to: https://appstoreconnect.apple.com
2. Users and Access → Keys tab (top navigation)
3. Click the "+" button to add a new key
4. Name: `BlitzReleaseTool`
5. Access: App Manager (can upload builds, manage metadata, submit for review)
6. Click Generate

---

## Step 2 — Download the Key

1. Click Download API Key (you can only download ONCE — don't miss it)
2. File will be named: `AuthKey_XXXXXXXXXX.p8`
3. Move to: `~/.blitz/credentials/AuthKey_XXXXXXXXXX.p8`
4. Note down these three values from the Keys page:
   - Key ID: `XXXXXXXXXX` (10 characters)
   - Issuer ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID)

---

## Step 3 — Set environment variables

In your `.env` file:
```
APP_STORE_KEY_ID=XXXXXXXXXX
APP_STORE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_STORE_KEY_PATH=/Users/yourname/.blitz/credentials/AuthKey_XXXXXXXXXX.p8
```

---

## Step 4 — Test the connection

```bash
fastlane run app_store_connect_api_key \
  key_id:"XXXXXXXXXX" \
  issuer_id:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  key_filepath:"/path/to/AuthKey_XXXXXXXXXX.p8"
```

If no error → credentials are valid.

---

## Step 5 — Set up fastlane Match (iOS code signing)

Match manages certificates and provisioning profiles in a private git repo.

### Create the certs repo
1. Create a new **private** GitHub repo: `sudarshantechlabs-certificates`
2. Do NOT initialize with README (keep it empty)
3. Copy the SSH URL: `git@github.com:SUDARSHANCHAUDHARI/sudarshantechlabs-certificates.git`

### Initialize match
```bash
cd blitz-release-tool/
fastlane match init
# Storage mode: git
# URL: git@github.com:SUDARSHANCHAUDHARI/sudarshantechlabs-certificates.git
```

### Generate first certificate
```bash
fastlane match appstore --app_identifier com.sudarshantechlabs.myfamilytracker
# Enter a strong passphrase when prompted — save this as MATCH_PASSWORD in .env
```

### Add to .env
```
MATCH_GIT_URL=git@github.com:SUDARSHANCHAUDHARI/sudarshantechlabs-certificates.git
MATCH_PASSWORD=your_strong_passphrase_here
```

---

## Security Notes

- The `.p8` key cannot be re-downloaded — keep a backup in a secure location
- Store it in `~/.blitz/credentials/` — never in the project repo
- The Match passphrase encrypts all certificates in the git repo — never lose it
- Rotate the API key yearly via App Store Connect → Users and Access → Keys

---

## Troubleshooting

**Error: "Authentication credentials are missing or invalid"**
→ Check KEY_ID, ISSUER_ID, and KEY_PATH are all correct in .env

**Error: "No provisioning profile found"**
→ Run: `fastlane match appstore --app_identifier com.sudarshantechlabs.yourapp`

**Error: "Match passphrase incorrect"**
→ MATCH_PASSWORD in .env doesn't match what you used when generating certs
→ Run `fastlane match nuke appstore` and regenerate (nuclear option)

**Error: "Certificate has expired"**
→ Run: `fastlane match appstore --force_for_new_devices true`
