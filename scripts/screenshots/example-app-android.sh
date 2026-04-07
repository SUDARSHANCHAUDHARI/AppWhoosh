#!/bin/bash
# AppWhoosh screenshot: Example App
set -e
OUTPUT_DIR="${1:-/tmp/appwhoosh-builds/example-app/screenshots}"
PACKAGE="com.sudarshantechlabs.exampleapp"
mkdir -p "$OUTPUT_DIR"
adb shell am force-stop "$PACKAGE" 2>/dev/null || true
sleep 1
adb shell am start -n "$PACKAGE/.MainActivity"
sleep 4
adb exec-out screencap -p > "$OUTPUT_DIR/screen1.png"
echo "[AppWhoosh] Done"
