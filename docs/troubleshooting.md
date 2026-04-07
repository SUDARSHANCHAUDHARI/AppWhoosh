# Troubleshooting Guide — AppWhoosh Release Tool

Run `appwhoosh doctor` first. It catches 80% of issues automatically.

---

## Android Issues

### Build fails: "KEYSTORE_PASSWORD not set"
```bash
# Check .env is loaded
cat .env | grep KEYSTORE
# Ensure .env is in the project root, not a subdirectory
```

### Build fails: "Could not find keystore file"
```bash
# Verify KEYSTORE_BASE_PATH and alias
appwhoosh android keystore verify <app-id>
# Expected file: $KEYSTORE_BASE_PATH/<appname>.keystore
# Create if missing:
appwhoosh android keystore create <app-id>
```

### Build fails: "Task 'bundleRelease' not found"
```bash
# Check your Android project structure
cd apps/<app-id>/android
./gradlew tasks | grep bundle
# Use the correct flavor:
# "bundleFlavorRelease" → set flavor in config.json
```

### Deploy fails: "The caller does not have permission"
```bash
# Service account not granted access in Play Console
# Go to: Play Console → Setup → API access
# Grant your service account App Manager permissions
# Wait 10 minutes for permissions to propagate
```

### Deploy fails: "Package not found"
```bash
# App must exist in Play Console before fastlane can upload
# Solution: Upload first APK/AAB manually in Play Console
# Then appwhoosh deploy will work for all subsequent releases
```

### ADB: "device not found" for screenshots
```bash
adb devices           # Should list your device
adb kill-server
adb start-server
adb devices           # Try again
# If still empty: check USB cable, enable USB debugging on device
```

### Screenshots are blank (< 10KB PNG)
```bash
# App didn't launch in time — increase sleep in screenshot script
# Open scripts/screenshots/<app-id>-android.sh
# Change: sleep 4 → sleep 7
```

---

## iOS Issues

### Build fails: "xcode-select: error"
```bash
xcode-select --install
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Build fails: "No signing certificate found"
```bash
# Re-sync match certificates
appwhoosh ios certs sync <app-id>
# If that fails, nuke and regenerate:
fastlane match nuke appstore
fastlane match appstore --app_identifier com.sudarshantechlabs.<appname>
```

### Build fails: "Provisioning profile doesn't include bundle ID"
```bash
# Add bundle ID to Matchfile, then re-sync
# fastlane/Matchfile → add to app_identifier array
fastlane match appstore --force
```

### Deploy fails: "Authentication credentials are missing"
```bash
# Check all three App Store vars are set
echo $APP_STORE_KEY_ID
echo $APP_STORE_ISSUER_ID
echo $APP_STORE_KEY_PATH
ls -la $APP_STORE_KEY_PATH   # File must exist
```

### Simulator not found
```bash
xcrun simctl list devices    # List available simulators
# If device missing, open Xcode → Preferences → Components → install simulator
```

---

## AI Agent Issues

### "ANTHROPIC_API_KEY not set"
```bash
cat .env | grep ANTHROPIC
# If missing, get key from: https://console.anthropic.com
```

### Agent loops forever
```bash
# The agentic loop has a max iteration count — if hit, it stops
# Check ~/.appwhoosh/logs/ for the last session log
# Usually caused by a tool throwing an uncaught error
```

### Tool not found error
```bash
# Check mcp/tools.js — tool name must match exactly
# Tool names are snake_case: "build_android" not "buildAndroid"
```

---

## fastlane Issues

### "fastlane: command not found"
```bash
gem install fastlane
# If Ruby version issues:
brew install rbenv
rbenv install 3.2.0
rbenv global 3.2.0
gem install fastlane
```

### "Gemfile.lock out of date"
```bash
cd appwhoosh-release-tool/
bundle install
bundle update fastlane
```

### supply/deliver version mismatch
```bash
bundle exec fastlane supply --version
# If wrong version, update Gemfile pin and run bundle update
```

---

## General Issues

### "appwhoosh: command not found"
```bash
# Re-link the CLI
cd appwhoosh-release-tool/
npm link
# Verify:
which appwhoosh
appwhoosh --version
```

### `.env` variables not loading
```bash
# Verify .env is in project root
ls -la .env
# Verify dotenv is required at top of cli/index.js:
require("dotenv").config();
```

### History file corrupt
```bash
rm ~/.appwhoosh/history.json
# Will be recreated automatically on next tool call
```

### Permission denied on script files
```bash
chmod +x scripts/screenshots/*.sh
chmod +x scripts/android-build.sh
chmod +x scripts/ios-build.sh
```
