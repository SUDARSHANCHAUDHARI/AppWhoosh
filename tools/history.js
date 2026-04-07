"use strict";

const fs   = require("fs");
const path = require("path");

const HISTORY_DIR  = path.join(process.env.HOME || "~", ".appwhoosh");
const HISTORY_FILE = path.join(HISTORY_DIR, "history.json");

function load() {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")); } catch (_) { return []; }
}

function save(entries) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries.slice(-1000), null, 2));
}

function record(appId, toolName, success, durationMs = 0, error = null) {
  const entries = load();
  entries.push({ timestamp: new Date().toISOString(), app_id: appId, tool_name: toolName, success, duration_ms: durationMs, error: error || null });
  save(entries);
}

function getHistory(appId, limit = 10) {
  return load().filter(e => e.app_id === appId).slice(-limit).reverse();
}

function getLastRelease(appId) {
  return load().filter(e => e.app_id === appId && e.success && ["release_app","batch_release","deploy_android","deploy_ios"].includes(e.tool_name)).pop() || null;
}

function getLastScreenshot(appId) {
  return load().filter(e => e.app_id === appId && e.success && e.tool_name.includes("screenshot")).pop() || null;
}

function printHistory(appId) {
  const entries = getHistory(appId, 20);
  if (!entries.length) { console.log(`No history for ${appId}`); return; }
  console.log(`\nHistory: ${appId}\n`);
  for (const e of entries) {
    const icon = e.success ? "✓" : "✗";
    const dur  = e.duration_ms ? ` (${Math.round(e.duration_ms/1000)}s)` : "";
    console.log(`  ${icon} ${e.tool_name}${dur}  —  ${new Date(e.timestamp).toLocaleString()}`);
    if (e.error) console.log(`    Error: ${e.error}`);
  }
  console.log();
}

module.exports = { record, getHistory, getLastRelease, getLastScreenshot, printHistory };
