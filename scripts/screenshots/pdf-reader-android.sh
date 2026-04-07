#!/bin/bash
# Screenshot script: PDF Reader
# Package: com.sudarshantechlabs.pdfreader
# Usage: bash pdf-reader-android.sh [output_dir]
set -e

OUTPUT_DIR="${1:-/tmp/screenshots/pdf-reader}"
PACKAGE="com.sudarshantechlabs.pdfreader"
ACTIVITY="com.sudarshantechlabs.pdfreader/.MainActivity"
SLEEP_LAUNCH=4
SLEEP_NAV=2

mkdir -p "$OUTPUT_DIR"

# Pre-flight
if ! adb devices | grep -q "device$"; then
  echo "[ERROR] No ADB device connected."
  exit 1
fi
echo "[Screenshot] Launching PDF Reader..."
adb shell am force-stop "$PACKAGE" 2>/dev/null || true
sleep 1
adb shell am start -n "$ACTIVITY"
sleep $SLEEP_LAUNCH

# Screen 1: file browser — launch screen, no tap needed
adb exec-out screencap -p > "$OUTPUT_DIR/screen1.png"
echo "[Screenshot] Saved screen1.png"

# Screen 2: pdf view
adb shell input tap 540 1200   # TODO: customize tap for "pdf view"
sleep $SLEEP_NAV
adb exec-out screencap -p > "$OUTPUT_DIR/screen2.png"
echo "[Screenshot] Saved screen2.png"

# Screen 3: bookmarks
adb shell input tap 540 1200   # TODO: customize tap for "bookmarks"
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