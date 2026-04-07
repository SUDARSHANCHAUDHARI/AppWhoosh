#!/bin/bash
# AppWhoosh — Android release build wrapper
# Usage: bash android-build.sh <project_path> <keystore_path> <alias> <store_pass> <key_pass>
set -e

PROJECT_PATH="$1"
KEYSTORE_PATH="$2"
ALIAS="$3"
STORE_PASS="$4"
KEY_PASS="$5"

if [ -z "$PROJECT_PATH" ]; then
  echo "Usage: android-build.sh <project_path> <keystore_path> <alias> <store_pass> <key_pass>"
  exit 1
fi

cd "$PROJECT_PATH"
echo "[AppWhoosh] Building release AAB..."

./gradlew clean bundleRelease \
  -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$STORE_PASS" \
  -Pandroid.injected.signing.key.alias="$ALIAS" \
  -Pandroid.injected.signing.key.password="$KEY_PASS"

echo "[AppWhoosh] Android build complete."
