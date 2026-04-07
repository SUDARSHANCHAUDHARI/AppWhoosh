#!/bin/bash
# Screenshot script: File Manager
# Package: com.sudarshantechlabs.filemanager
# Usage: bash file-manager-android.sh [output_dir]
set -e

OUTPUT_DIR="${1:-/tmp/screenshots/file-manager}"
PACKAGE="com.sudarshantechlabs.filemanager"
ACTIVITY="com.sudarshantechlabs.filemanager/.MainActivity"
SLEEP_LAUNCH=4
SLEEP_NAV=2

mkdir -p "$OUTPUT_DIR"

# Pre-flight
if ! adb devices | grep -q "device$"; then
  echo "[ERROR] No ADB device connected."
  exit 1
fi
echo "[Screenshot] Launching File Manager..."
adb shell am force-stop "$PACKAGE" 2>/dev/null || true
sleep 1
adb shell am start -n "$ACTIVITY"
sleep $SLEEP_LAUNCH

# Screen 1: home folder — launch screen, no tap needed
adb exec-out screencap -p > "$OUTPUT_DIR/screen1.png"
echo "[Screenshot] Saved screen1.png"

# Screen 2: file list
adb shell input tap 540 1200   # TODO: customize tap for "file list"
sleep $SLEEP_NAV
adb exec-out screencap -p > "$OUTPUT_DIR/screen2.png"
echo "[Screenshot] Saved screen2.png"

# Screen 3: storage stats
adb shell input tap 540 1200   # TODO: customize tap for "storage stats"
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