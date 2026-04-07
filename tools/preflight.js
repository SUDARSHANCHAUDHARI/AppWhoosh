"use strict";

const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");
const logger = require("./logger");

function run(cmd) { return execSync(cmd, { stdio: "pipe" }).toString().trim(); }

function check(label, fn, hint) {
  try { return { ok: true, label, detail: fn() || "", hint }; }
  catch (err) { return { ok: false, label, detail: err.message || "", hint }; }
}

const CHECKS = [
  { label: "Node.js ≥ 18",
    hint:  "Install from https://nodejs.org",
    fn: () => { const v = process.version; if (parseInt(v.replace("v","")) < 18) throw new Error(`${v} — need ≥ 18`); return v; } },

  { label: ".env file present",
    hint:  "Run: cp .env.example .env",
    fn: () => { const p = path.resolve(__dirname, "../.env"); if (!fs.existsSync(p)) throw new Error("Not found"); return "found"; } },

  { label: "ANTHROPIC_API_KEY set",
    hint:  "Get from https://console.anthropic.com → add to .env",
    fn: () => { if (!process.env.ANTHROPIC_API_KEY) throw new Error("Not set"); return process.env.ANTHROPIC_API_KEY.slice(0,12) + "..."; } },

  { label: "GOOGLE_PLAY_JSON_KEY_PATH set + exists",
    hint:  "See infrastructure/google-play-setup.md",
    fn: () => { const p = process.env.GOOGLE_PLAY_JSON_KEY_PATH; if (!p) throw new Error("Not set"); if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`); return p; } },

  { label: "KEYSTORE_BASE_PATH set",
    hint:  "Set KEYSTORE_BASE_PATH in .env to your keystores folder",
    fn: () => { const p = process.env.KEYSTORE_BASE_PATH; if (!p) throw new Error("Not set"); return p; } },

  { label: "ADB available",
    hint:  "brew install android-platform-tools",
    fn: () => run("adb version").split("\n")[0] },

  { label: "ADB device connected",
    hint:  "Connect device, enable USB debugging, run: adb devices",
    fn: () => { const out = run("adb devices"); const lines = out.split("\n").slice(1).filter(l => l.includes("device")); if (!lines.length) throw new Error("No device"); return lines[0].split("\t")[0]; } },

  { label: "fastlane available",
    hint:  "gem install fastlane",
    fn: () => run("fastlane --version 2>/dev/null | head -1") },

  { label: "xcodebuild available (iOS)",
    hint:  "Install Xcode from Mac App Store",
    fn: () => run("xcodebuild -version 2>/dev/null | head -1") },

  { label: "Apps registered",
    hint:  "Run: appwhoosh config add",
    fn: () => { const { listAppIds } = require("./config"); const ids = listAppIds(); if (!ids.length) throw new Error("No apps registered"); return `${ids.length} app(s)`; } },
];

function checkAll() {
  require("dotenv").config();
  const results = CHECKS.map(c => check(c.label, c.fn, c.hint));
  return { ok: results.every(r => r.ok), issues: results.filter(r => !r.ok).length, results };
}

function printDoctor() {
  logger.header("AppWhoosh Doctor");
  const report = checkAll();
  for (const r of report.results) {
    if (r.ok) {
      logger.success(`${r.label}${r.detail ? "  →  " + r.detail : ""}`);
    } else {
      logger.error(r.label);
      if (r.detail) logger.warn(`  Detail: ${r.detail}`);
      if (r.hint)   logger.warn(`  Fix:    ${r.hint}`);
    }
  }
  logger.info("");
  report.ok
    ? logger.success("All checks passed — ready to release. ⚡")
    : logger.error(`${report.issues} issue(s) found. Fix them before releasing.`);
  return report;
}

module.exports = { checkAll, printDoctor };
