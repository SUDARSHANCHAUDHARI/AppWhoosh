"use strict";

const logger  = require("./logger");
const { notifyBatchComplete } = require("./notify");
const { loadAllConfigs, listAppIds } = require("./config");
const { buildAndroid }   = require("./build-android");
const { buildIOS }       = require("./build-ios");
const { deployAndroid, deployIOS } = require("./deploy");
const { screenshotsAndroid, screenshotsIOS } = require("./screenshots");
const { validateAndroidMetadata, validateIOSMetadata } = require("./metadata");
const history = require("./history");
const path    = require("path");

const BUILD_OUT = process.env.BUILD_OUTPUT_DIR || "/tmp/appwhoosh-builds";

// ── Batch release ─────────────────────────────────────────────────────────────
async function batchRelease(options = {}) {
  const { platforms = ["android"], skipScreenshots = false } = options;
  const configs = loadAllConfigs();
  const results = {};

  logger.header(`Batch Release — ${configs.length} apps`);

  for (const config of configs) {
    const appId = config._id;
    const start = Date.now();
    logger.step(`[${configs.indexOf(config)+1}/${configs.length}] ${appId}`);

    try {
      for (const platform of platforms) {
        if (platform === "android" && config.android) {
          const aabPath = buildAndroid(config);
          if (!skipScreenshots) {
            screenshotsAndroid(config, path.join(BUILD_OUT, appId, "screenshots/android"));
          }
          deployAndroid(config, aabPath);
        }
        if (platform === "ios" && config.ios) {
          const ipaPath = buildIOS(config);
          if (!skipScreenshots) {
            screenshotsIOS(config, path.join(BUILD_OUT, appId, "screenshots/ios"));
          }
          deployIOS(config, ipaPath);
        }
      }
      const dur = Date.now() - start;
      results[appId] = { success: true, durationMs: dur };
      history.record(appId, "batch_release", true, dur);
      logger.success(`  ✓ ${appId} (${formatDur(dur)})`);

    } catch (err) {
      const dur = Date.now() - start;
      results[appId] = { success: false, error: err.message, durationMs: dur };
      history.record(appId, "batch_release", false, dur, err.message);
      logger.error(`  ✗ ${appId}: ${err.message}`);
    }
  }

  printBatchSummary(results);
  notifyBatchComplete(results);
  return results;
}

// ── Batch screenshots ─────────────────────────────────────────────────────────
async function batchScreenshots(platform = "android") {
  const configs = loadAllConfigs();
  const results = {};

  logger.header(`Batch Screenshots — ${configs.length} apps (${platform})`);

  for (const config of configs) {
    const appId = config._id;
    try {
      if (platform === "android" && config.android) {
        screenshotsAndroid(config, path.join(BUILD_OUT, appId, "screenshots/android"));
      }
      if (platform === "ios" && config.ios) {
        screenshotsIOS(config, path.join(BUILD_OUT, appId, "screenshots/ios"));
      }
      results[appId] = { success: true };
      logger.success(`  ✓ ${appId}`);
    } catch (err) {
      results[appId] = { success: false, error: err.message };
      logger.error(`  ✗ ${appId}: ${err.message}`);
    }
  }

  printBatchSummary(results);
  return results;
}

// ── Batch validate ────────────────────────────────────────────────────────────
function batchValidate() {
  const configs = loadAllConfigs();
  logger.header(`Metadata Validation — ${configs.length} apps`);

  const COL = { app: 22, android: 10, ios: 10, issues: 30 };
  const header =
    "APP".padEnd(COL.app) +
    "ANDROID".padEnd(COL.android) +
    "iOS".padEnd(COL.ios) +
    "ISSUES";
  logger.info(header);
  logger.info("─".repeat(header.length));

  for (const config of configs) {
    const appId   = config._id;
    const android = validateAndroidMetadata(appId);
    const ios     = validateIOSMetadata(appId);

    const aStatus = android.valid ? "✓ pass" : `✗ ${android.errors.length} err`;
    const iStatus = ios.valid     ? "✓ pass" : `✗ ${ios.errors.length} err`;
    const issues  = [...android.errors, ...ios.errors].slice(0,2).join("; ");

    const line =
      appId.padEnd(COL.app) +
      aStatus.padEnd(COL.android) +
      iStatus.padEnd(COL.ios) +
      (issues || "");
    logger.info(line);
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function printDashboard() {
  const ids = listAppIds();
  logger.header(`Blitz Dashboard — ${ids.length} apps`);

  const COL = { app: 24, platform: 12, release: 18, screenshots: 14 };
  const hdr =
    "APP".padEnd(COL.app) +
    "PLATFORM".padEnd(COL.platform) +
    "LAST RELEASE".padEnd(COL.release) +
    "SCREENSHOTS";
  logger.info(hdr);
  logger.info("─".repeat(hdr.length));

  for (const appId of ids) {
    const last    = history.getLastRelease(appId);
    const lastStr = last ? relativeTime(last.timestamp) : "never";
    const shots   = history.getLastScreenshot(appId);
    const shotStr = shots ? "✓" : "✗ missing";

    const line =
      appId.padEnd(COL.app) +
      "android".padEnd(COL.platform) +
      lastStr.padEnd(COL.release) +
      shotStr;
    logger.info(line);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function printBatchSummary(results) {
  const total  = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r.success).length;
  const failed = total - passed;

  logger.header("Batch Summary");
  logger.success(`Succeeded: ${passed}/${total}`);
  if (failed) {
    logger.error(`Failed: ${failed}`);
    Object.entries(results)
      .filter(([,r]) => !r.success)
      .forEach(([id, r]) => logger.error(`  ${id}: ${r.error}`));
  }
}

function formatDur(ms) {
  if (ms < 1000) return "<1s";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;
}

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

module.exports = { batchRelease, batchScreenshots, batchValidate, printDashboard };
