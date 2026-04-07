#!/bin/bash
# Screenshot script: Password Generator
# Package: com.sudarshantechlabs.passwordgenerator
# Usage: bash password-generator-android.sh [output_dir]
set -e

OUTPUT_DIR="${1:-/tmp/screenshots/password-generator}"
PACKAGE="com.sudarshantechlabs.passwordgenerator"
ACTIVITY="com.sudarshantechlabs.passwordgenerator/.MainActivity"
SLEEP_LAUNCH=4
SLEEP_NAV=2

mkdir -p "$OUTPUT_DIR"

# Pre-flight
if ! adb devices | grep -q "device$"; then
  echo "[ERROR] No ADB device connected."
  exit 1
fi
echo "[Screenshot] Launching Password Generator..."
adb shell am force-stop "$PACKAGE" 2>/dev/null || true
sleep 1
adb shell am start -n "$ACTIVITY"
sleep $SLEEP_LAUNCH

# Screen 1: generator screen — launch screen, no tap needed
adb exec-out screencap -p > "$OUTPUT_DIR/screen1.png"
echo "[Screenshot] Saved screen1.png"

# Screen 2: password list
adb shell input tap 540 1200   # TODO: customize tap for "password list"
sleep $SLEEP_NAV
adb exec-out screencap -p > "$OUTPUT_DIR/screen2.png"
echo "[Screenshot] Saved screen2.png"

# Screen 3: settings
adb shell input tap 540 1200   # TODO: customize tap for "settings"
sleep $SLEEP_NAV
adb exec-out screencap -p > "$OUTPUT_DIR/screen3.png"
echo "[Screenshot] Saved screen3.png"

echo "[Screenshot] Done: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"

for f in "$OUTPUT_DIR"/*.png; do
  FSIZE=$(wc -c < "$f")
  if [ "$FSIZE" -lt 10240 ]; then
    echo "[WARNING] $f may be blank ($FSIZE bytes)"
  fi
done