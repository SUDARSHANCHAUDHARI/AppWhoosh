"use strict";

const fs     = require("fs");
const path   = require("path");
const logger = require("./logger");
const { loadAppConfig } = require("./config");
const { BuildError }    = require("./errors");

const ROOT         = path.resolve(__dirname, "..");
const VERSIONS_FILE = path.join(process.env.HOME || "~", ".blitz", "versions.json");

// ── Read current version from build.gradle ────────────────────────────────────
function getCurrentVersion(appId) {
  const config      = loadAppConfig(appId);
  const gradlePath  = path.resolve(ROOT, config.android.path, "app/build.gradle");

  if (!fs.existsSync(gradlePath)) {
    throw new BuildError(`build.gradle not found: ${gradlePath}`, "Check android.path in config.json");
  }

  const content     = fs.readFileSync(gradlePath, "utf8");
  const codeMatch   = content.match(/versionCode\s+(\d+)/);
  const nameMatch   = content.match(/versionName\s+"([\d.]+)"/);

  if (!codeMatch || !nameMatch) {
    throw new BuildError("Could not parse versionCode/versionName from build.gradle");
  }

  return {
    versionCode: parseInt(codeMatch[1], 10),
    versionName: nameMatch[1],
  };
}

// ── Bump version ──────────────────────────────────────────────────────────────
function bumpVersion(appId, type = "patch") {
  const config      = loadAppConfig(appId);
  const gradlePath  = path.resolve(ROOT, config.android.path, "app/build.gradle");
  const current     = getCurrentVersion(appId);

  const newCode = current.versionCode + 1;
  const parts   = current.versionName.split(".").map(Number);

  let newName;
  if (type === "major") {
    newName = `${parts[0]+1}.0.0`;
  } else if (type === "minor") {
    newName = `${parts[0]}.${parts[1]+1}.0`;
  } else if (type === "code-only") {
    newName = current.versionName;
  } else {
    // patch (default)
    newName = `${parts[0]}.${parts[1]}.${(parts[2]||0)+1}`;
  }

  let content = fs.readFileSync(gradlePath, "utf8");
  content = content
    .replace(/versionCode\s+\d+/, `versionCode ${newCode}`)
    .replace(/versionName\s+"[\d.]+"/, `versionName "${newName}"`);
  fs.writeFileSync(gradlePath, content);

  const result = { old: current, new: { versionCode: newCode, versionName: newName } };
  recordVersion(appId, result);

  logger.success(`${appId}: ${current.versionName} (${current.versionCode}) → ${newName} (${newCode})`);
  return result;
}

// ── Print version table ───────────────────────────────────────────────────────
function printVersionTable(appIds) {
  const { listAppIds } = require("./config");
  const ids = appIds || listAppIds();

  logger.header("Version Table");
  const COL = { app: 24, version: 12, code: 8, bumped: 18 };
  const hdr = "APP".padEnd(COL.app) + "VERSION".padEnd(COL.version) + "CODE".padEnd(COL.code) + "LAST BUMPED";
  logger.info(hdr);
  logger.info("─".repeat(hdr.length));

  for (const appId of ids) {
    try {
      const v    = getCurrentVersion(appId);
      const last = getLastBump(appId);
      const ts   = last ? new Date(last.timestamp).toLocaleDateString() : "never";
      logger.info(appId.padEnd(COL.app) + v.versionName.padEnd(COL.version) + String(v.versionCode).padEnd(COL.code) + ts);
    } catch (_) {
      logger.info(appId.padEnd(COL.app) + "n/a".padEnd(COL.version) + "n/a".padEnd(COL.code) + "—");
    }
  }
}

// ── Version history persistence ───────────────────────────────────────────────
function recordVersion(appId, result) {
  fs.mkdirSync(path.dirname(VERSIONS_FILE), { recursive: true });
  let entries = [];
  if (fs.existsSync(VERSIONS_FILE)) {
    try { entries = JSON.parse(fs.readFileSync(VERSIONS_FILE, "utf8")); } catch (_) {}
  }
  entries.push({ appId, timestamp: new Date().toISOString(), ...result });
  fs.writeFileSync(VERSIONS_FILE, JSON.stringify(entries.slice(-500), null, 2));
}

function getLastBump(appId) {
  if (!fs.existsSync(VERSIONS_FILE)) return null;
  try {
    const entries = JSON.parse(fs.readFileSync(VERSIONS_FILE, "utf8"));
    return entries.filter(e => e.appId === appId).pop() || null;
  } catch (_) { return null; }
}

module.exports = { getCurrentVersion, bumpVersion, printVersionTable };
