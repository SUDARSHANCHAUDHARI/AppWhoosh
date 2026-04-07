#!/usr/bin/env node
// bulk-generate-configs.js
// Run this once to generate config.json + registry entries for all your apps
// Usage: node bulk-generate-configs.js

const fs = require("fs");
const path = require("path");

// ─── YOUR 20+ APPS ────────────────────────────────────────────
// Format: [appId, displayName, packageSuffix]
// packageSuffix = what comes after com.sudarshantechlabs.
const APPS = [
  ["myfamilytracker",     "My Family Tracker",         "myfamilytracker"],
  ["calorie-counter",     "Calorie Counter",            "caloriecounter"],
  ["bmi-calculator",      "BMI Calculator",             "bmicalculator"],
  ["unit-converter",      "Unit Converter",             "unitconverter"],
  ["password-generator",  "Password Generator",         "passwordgenerator"],
  ["qr-scanner",          "QR Code Scanner",            "qrscanner"],
  ["pdf-reader",          "PDF Reader",                 "pdfreader"],
  ["file-manager",        "File Manager",               "filemanager"],
  ["notes-app",           "Quick Notes",                "notesapp"],
  ["flashlight",          "Flashlight Pro",             "flashlight"],
  ["compass",             "Digital Compass",            "compass"],
  ["speedtest",           "Speed Test",                 "speedtest"],
  ["wifi-analyzer",       "WiFi Analyzer",              "wifianalyzer"],
  ["battery-saver",       "Battery Saver",              "batterysaver"],
  ["screen-recorder",     "Screen Recorder",            "screenrecorder"],
  ["voice-recorder",      "Voice Recorder",             "voicerecorder"],
  ["alarm-clock",         "Alarm Clock",                "alarmclock"],
  ["stopwatch",           "Stopwatch & Timer",          "stopwatch"],
  ["calculator",          "Calculator Pro",             "calculator"],
  ["currency-converter",  "Currency Converter",         "currencyconverter"],
  ["weather-app",         "Weather Today",              "weatherapp"],
  ["todo-list",           "To-Do List",                 "todolist"],
];

const ROOT = path.resolve(__dirname);
const APPS_DIR = path.join(ROOT, "apps");
const REGISTRY_PATH = path.join(ROOT, "config/registry.json");

const registryEntries = [];

for (const [appId, displayName, pkgSuffix] of APPS) {
  const appDir = path.join(APPS_DIR, appId);
  const metaAndroid = path.join(appDir, "metadata/android/en-US");
  const metaIOS = path.join(appDir, "metadata/ios/en-US");
  const screenshotsAndroid = path.join(metaAndroid, "phoneScreenshots");

  // Create directories
  fs.mkdirSync(metaAndroid, { recursive: true });
  fs.mkdirSync(metaIOS, { recursive: true });
  fs.mkdirSync(screenshotsAndroid, { recursive: true });

  // config.json
  const config = {
    name: appId,
    displayName,
    android: {
      package: `com.sudarshantechlabs.${pkgSuffix}`,
      path: `apps/${appId}/android`,
      keystoreAlias: pkgSuffix,
      buildType: "release",
      flavor: null,
      screenshotScript: `scripts/screenshots/${appId}-android.sh`,
      metadataPath: `apps/${appId}/metadata/android`,
      track: "production"
    },
    ios: null,
    metadata: {
      locales: ["en-US"],
      privacyPolicyUrl: `https://sudarshanchaudhari.github.io/${appId}-privacy-policy/`
    },
    release: {
      autoSubmit: false,
      screenshotsBeforeUpload: true,
      whatsnew: "Bug fixes and performance improvements."
    }
  };

  fs.writeFileSync(
    path.join(appDir, "config.json"),
    JSON.stringify(config, null, 2)
  );

  // Android metadata files
  fs.writeFileSync(path.join(metaAndroid, "title.txt"), displayName);
  fs.writeFileSync(path.join(metaAndroid, "short_description.txt"),
    `${displayName} - free utility app by SudarshanTechLabs.`
  );
  fs.writeFileSync(path.join(metaAndroid, "full_description.txt"),
    `${displayName}\n\nA useful utility app designed to make your life easier.\n\nFeatures:\n• Simple and intuitive interface\n• Fast and lightweight\n• No ads, no tracking\n• Free to use\n\nDeveloped by SudarshanTechLabs.`
  );

  const changelogDir = path.join(metaAndroid, "changelogs");
  fs.mkdirSync(changelogDir, { recursive: true });
  fs.writeFileSync(path.join(changelogDir, "default.txt"),
    "Bug fixes and performance improvements."
  );

  // iOS metadata files
  fs.writeFileSync(path.join(metaIOS, "name.txt"), displayName);
  fs.writeFileSync(path.join(metaIOS, "subtitle.txt"), "By SudarshanTechLabs");
  fs.writeFileSync(path.join(metaIOS, "description.txt"),
    `${displayName} - a simple and useful utility app.`
  );
  fs.writeFileSync(path.join(metaIOS, "keywords.txt"), "utility, tools, free");
  fs.writeFileSync(path.join(metaIOS, "release_notes.txt"),
    "Bug fixes and performance improvements."
  );
  fs.writeFileSync(path.join(metaIOS, "privacy_url.txt"),
    `https://sudarshanchaudhari.github.io/${appId}-privacy-policy/`
  );

  // Screenshot script
  const scriptDir = path.join(ROOT, "scripts/screenshots");
  fs.mkdirSync(scriptDir, { recursive: true });
  const scriptPath = path.join(scriptDir, `${appId}-android.sh`);
  if (!fs.existsSync(scriptPath)) {
    fs.writeFileSync(scriptPath,
`#!/bin/bash
# Screenshot script for: ${displayName}
# Package: com.sudarshantechlabs.${pkgSuffix}
# TODO: Customize tap coordinates for your app's UI flow
set -e
OUTPUT_DIR="\${1:-/tmp/screenshots}"
PACKAGE="com.sudarshantechlabs.${pkgSuffix}"
mkdir -p "$OUTPUT_DIR"
adb shell am force-stop "$PACKAGE" 2>/dev/null || true
sleep 1
adb shell am start -n "$PACKAGE/.MainActivity"
sleep 4
adb exec-out screencap -p > "$OUTPUT_DIR/screen1.png"
echo "[Screenshot] Done: $OUTPUT_DIR"
`
    );
    fs.chmodSync(scriptPath, 0o755);
  }

  // Registry entry
  registryEntries.push({
    id: appId,
    configPath: `apps/${appId}/config.json`,
    enabled: true,
    platforms: ["android"]
  });

  console.log(`✓ ${appId} (${config.android.package})`);
}

// Write registry.json
const registry = {
  _comment: "Master registry of all apps. Add each app here.",
  apps: registryEntries,
  defaults: {
    android: {
      track: "production",
      keystorePassword: "${KEYSTORE_PASSWORD}",
      keystoreKeyPassword: "${KEYSTORE_KEY_PASSWORD}"
    },
    ios: {
      submitForReview: false,
      skipBinaryUpload: false
    }
  }
};

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

console.log(`\n✓ Registry written: ${registryEntries.length} apps`);
console.log(`✓ Config files, metadata, and screenshot scripts generated`);
console.log(`\nNext: run "appwhoosh config validate <app-id>" for any app`);
