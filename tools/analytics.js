"use strict";

const fs     = require("fs");
const path   = require("path");
const https  = require("https");
const logger = require("./logger");
const { loadAppConfig, listAppIds } = require("./config");

const CACHE_DIR  = path.join(process.env.HOME || "~", ".appwhoosh");
const CACHE_FILE = path.join(CACHE_DIR, "stats-cache.json");
const CACHE_TTL  = 6 * 60 * 60 * 1000; // 6 hours

// ── Cache helpers ─────────────────────────────────────────────
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (_) { return {}; }
}

function saveCache(data) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

function getCached(appId) {
  const cache = loadCache();
  const entry = cache[appId];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) return null;
  return entry.data;
}

function setCached(appId, data) {
  const cache = loadCache();
  cache[appId] = { fetchedAt: Date.now(), data };
  saveCache(cache);
}

// ── Google Play stats (via googleapis) ───────────────────────
// NOTE: Full implementation requires google-auth-library npm package
// and proper OAuth2 setup. This is a working skeleton.
async function getPlayStoreStats(appId) {
  const cached = getCached(appId);
  if (cached) { logger.info(`[Analytics] Using cached stats for ${appId}`); return cached; }

  const config  = loadAppConfig(appId);
  const pkg     = config.android.package;

  // Placeholder stats — replace with real Google Play Developer API call
  // Real endpoint: GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}/reviews
  // Requires: google-auth-library, service account JSON
  logger.warn(`[Analytics] Real Play Console API not yet configured for ${appId}`);
  logger.warn(`  See: https://developers.google.com/android-publisher`);

  const stats = {
    appId,
    package:       pkg,
    installs:      null,
    activeInstalls: null,
    rating:        null,
    reviews:       null,
    lastUpdated:   new Date().toISOString(),
    source:        "placeholder — configure Play Console API",
  };

  setCached(appId, stats);
  return stats;
}

// ── Print dashboard table ─────────────────────────────────────
async function printStatsDashboard() {
  const ids = listAppIds();
  logger.header(`AppWhoosh Analytics — ${ids.length} apps`);

  const COL = { app: 24, installs: 10, rating: 8, reviews: 10, updated: 16 };
  const hdr =
    "APP".padEnd(COL.app) +
    "INSTALLS".padEnd(COL.installs) +
    "RATING".padEnd(COL.rating) +
    "REVIEWS".padEnd(COL.reviews) +
    "LAST UPDATED";
  logger.info(hdr);
  logger.info("─".repeat(hdr.length));

  for (const appId of ids) {
    try {
      const stats = await getPlayStoreStats(appId);
      const line =
        appId.padEnd(COL.app) +
        (stats.installs != null ? String(stats.installs) : "—").padEnd(COL.installs) +
        (stats.rating   != null ? stats.rating + "★"     : "—").padEnd(COL.rating) +
        (stats.reviews  != null ? String(stats.reviews)  : "—").padEnd(COL.reviews) +
        (stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : "—");
      logger.info(line);
    } catch (err) {
      logger.error(`  ${appId}: ${err.message}`);
    }
  }

  logger.info("");
  logger.info("To enable real stats: see infrastructure/google-play-setup.md");
}

// ── Export to CSV ─────────────────────────────────────────────
async function exportToCSV(outputPath) {
  const ids  = listAppIds();
  const rows = ["App ID,Package,Installs,Active,Rating,Reviews,Last Updated"];

  for (const appId of ids) {
    const stats = await getPlayStoreStats(appId);
    rows.push([
      stats.appId, stats.package,
      stats.installs ?? "", stats.activeInstalls ?? "",
      stats.rating   ?? "", stats.reviews       ?? "",
      stats.lastUpdated ?? "",
    ].join(","));
  }

  const out = outputPath || path.join(CACHE_DIR, `appwhoosh-stats-${Date.now()}.csv`);
  fs.writeFileSync(out, rows.join("\n"));
  logger.success(`Stats exported: ${out}`);
  return out;
}

module.exports = { getPlayStoreStats, printStatsDashboard, exportToCSV };
