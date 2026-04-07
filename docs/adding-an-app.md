# Adding a New App — Complete Walkthrough

Time required: ~10 minutes per app.

---

## Option A — Automated (recommended for bulk)

```bash
# Edit configs/bulk-generate-configs.js
# Add your app to the APPS array:
["my-new-app", "My New App", "mynewapp"],

# Run the generator
node configs/bulk-generate-configs.js

# Validate
appwhoosh config validate my-new-app
```

---

## Option B — Interactive CLI

```bash
appwhoosh config add
# Prompts:
# App ID: my-new-app
# Display name: My New App
# Package suffix (after com.sudarshantechlabs.): mynewapp
# Platforms: android
```

---

## Option C — Manual (full control)

### Step 1 — Create config.json
```bash
cp apps/example-app/config.json apps/my-new-app/config.json
```

Edit `apps/my-new-app/config.json`:
```json
{
  "name": "my-new-app",
  "displayName": "My New App",
  "android": {
    "package": "com.sudarshantechlabs.mynewapp",
    "path": "apps/my-new-app/android",
    "keystoreAlias": "mynewapp",
    "screenshotScript": "scripts/screenshots/my-new-app-android.sh",
    "metadataPath": "apps/my-new-app/metadata/android",
    "track": "production"
  }
}
```

### Step 2 — Register the app
Add to `config/registry.json`:
```json
{
  "id": "my-new-app",
  "configPath": "apps/my-new-app/config.json",
  "enabled": true,
  "platforms": ["android"]
}
```

### Step 3 — Create metadata
```bash
appwhoosh metadata scaffold my-new-app
# Creates: title.txt, short_description.txt, full_description.txt,
#          changelogs/default.txt, phoneScreenshots/ folder
```

Edit the metadata files:
- `apps/my-new-app/metadata/android/en-US/title.txt` — max 50 chars
- `apps/my-new-app/metadata/android/en-US/short_description.txt` — max 80 chars
- `apps/my-new-app/metadata/android/en-US/full_description.txt` — max 4000 chars

### Step 4 — Generate screenshot script
```bash
appwhoosh screenshots generate-script my-new-app
# Creates: scripts/screenshots/my-new-app-android.sh
```

Edit the script — customize tap coordinates for your app's UI:
```bash
nano scripts/screenshots/my-new-app-android.sh
```

### Step 5 — Create keystore (if new app)
```bash
appwhoosh android keystore create my-new-app
# Creates: $KEYSTORE_BASE_PATH/mynewapp.keystore
# Alias: mynewapp
# Password: from $KEYSTORE_PASSWORD env var
```

### Step 6 — Validate everything
```bash
appwhoosh config validate my-new-app
appwhoosh metadata validate my-new-app
appwhoosh android keystore verify my-new-app
appwhoosh doctor
```

### Step 7 — First build (dry run test)
```bash
# Make sure your Android project is at apps/my-new-app/android/
appwhoosh build my-new-app --android-only
```

### Step 8 — Upload first release manually
The very first release to Google Play must be done manually:
1. Build the AAB: `appwhoosh build my-new-app --android-only`
2. Go to Play Console → Create new app
3. Upload the AAB from `/tmp/appwhoosh-builds/my-new-app/`
4. Fill in store listing manually (or copy from your metadata files)
5. Submit for review

After the first manual upload, all subsequent releases use `appwhoosh release my-new-app`.

### Step 9 — Translate metadata (optional)
```bash
appwhoosh translate my-new-app --to hi-IN
appwhoosh translate my-new-app --to th-TH
```

---

## Checklist

- [ ] `apps/my-new-app/config.json` created and filled in
- [ ] Entry added to `config/registry.json`
- [ ] Metadata files created in `apps/my-new-app/metadata/android/en-US/`
- [ ] Screenshot script created at `scripts/screenshots/my-new-app-android.sh`
- [ ] Keystore created at `$KEYSTORE_BASE_PATH/mynewapp.keystore`
- [ ] `appwhoosh config validate my-new-app` passes
- [ ] `appwhoosh metadata validate my-new-app` passes
- [ ] Android project linked at `apps/my-new-app/android/`
- [ ] First release uploaded manually to Play Console
- [ ] `appwhoosh release my-new-app` tested successfully
