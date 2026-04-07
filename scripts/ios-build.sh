#!/bin/bash
# AppWhoosh — iOS archive + export build wrapper
# Usage: bash ios-build.sh <workspace> <scheme> <archive_path> <export_path> <export_plist>
set -e

WORKSPACE="$1"
SCHEME="$2"
ARCHIVE_PATH="$3"
EXPORT_PATH="$4"
EXPORT_PLIST="$5"

if [ -z "$WORKSPACE" ] || [ -z "$SCHEME" ]; then
  echo "Usage: ios-build.sh <workspace> <scheme> <archive_path> <export_path> <export_plist>"
  exit 1
fi

echo "[AppWhoosh] Archiving $SCHEME..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  clean archive

echo "[AppWhoosh] Exporting IPA..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_PLIST" \
  -exportPath "$EXPORT_PATH"

echo "[AppWhoosh] iOS build complete. IPA at: $EXPORT_PATH"
