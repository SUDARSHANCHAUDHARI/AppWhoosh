"use strict";

const fs     = require("fs");
const path   = require("path");
const logger = require("./logger");
const { MetadataError } = require("./errors");
const { loadAppConfig }  = require("./config");

const ROOT = path.resolve(__dirname, "..");

// ── Character limits ──────────────────────────────────────────────────────────
const ANDROID_LIMITS = {
  "title.txt":             50,
  "short_description.txt": 80,
  "full_description.txt":  4000,
  "changelogs/default.txt":500,
};

const IOS_LIMITS = {
  "name.txt":          30,
  "subtitle.txt":      30,
  "keywords.txt":      100,
  "description.txt":   4000,
  "release_notes.txt": 4000,
};

// ── Validate ──────────────────────────────────────────────────────────────────
function validateAndroidMetadata(appId) {
  const config   = loadAppConfig(appId);
  const base     = path.resolve(ROOT, config.android.metadataPath, "en-US");
  const errors   = [];
  const warnings = [];

  for (const [file, limit] of Object.entries(ANDROID_LIMITS)) {
    const filePath = path.join(base, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing: ${file}`);
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8").trim();
    if (content.length === 0) {
      warnings.push(`Empty: ${file}`);
    } else if (content.length > limit) {
      errors.push(`${file} too long: ${content.length} chars (max ${limit})`);
    }
  }

  const shotDir = path.join(base, "phoneScreenshots");
  if (!fs.existsSync(shotDir) || fs.readdirSync(shotDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f)).length === 0) {
    warnings.push("No screenshots found in phoneScreenshots/");
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateIOSMetadata(appId) {
  const config = loadAppConfig(appId);
  if (!config.ios) return { valid: true, errors: [], warnings: ["No iOS config — skipped"] };

  const base   = path.resolve(ROOT, config.ios.metadataPath, "en-US");
  const errors = [];
  const warnings = [];

  for (const [file, limit] of Object.entries(IOS_LIMITS)) {
    const filePath = path.join(base, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing: ${file}`);
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8").trim();
    if (content.length === 0) {
      warnings.push(`Empty: ${file}`);
    } else if (content.length > limit) {
      errors.push(`${file} too long: ${content.length} chars (max ${limit})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Scaffold ──────────────────────────────────────────────────────────────────
function scaffoldMetadata(appId, platform = "android") {
  const config  = loadAppConfig(appId);
  const display = config.displayName || appId;

  if (platform === "android" || platform === "both") {
    const base = path.resolve(ROOT, config.android.metadataPath, "en-US");
    fs.mkdirSync(path.join(base, "changelogs"), { recursive: true });
    fs.mkdirSync(path.join(base, "phoneScreenshots"), { recursive: true });

    writeIfMissing(path.join(base, "title.txt"), display);
    writeIfMissing(path.join(base, "short_description.txt"), `${display} - free utility app by SudarshanTechLabs.`);
    writeIfMissing(path.join(base, "full_description.txt"),
      `${display}\n\nA useful utility app designed to make your life easier.\n\nFeatures:\n• Simple and intuitive interface\n• Fast and lightweight\n• Free to use\n\nDeveloped by SudarshanTechLabs.`
    );
    writeIfMissing(path.join(base, "changelogs/default.txt"), "Bug fixes and performance improvements.");
    logger.success(`Android metadata scaffolded → ${base}`);
  }

  if ((platform === "ios" || platform === "both") && config.ios) {
    const base = path.resolve(ROOT, config.ios.metadataPath, "en-US");
    fs.mkdirSync(base, { recursive: true });

    writeIfMissing(path.join(base, "name.txt"), display);
    writeIfMissing(path.join(base, "subtitle.txt"), "By SudarshanTechLabs");
    writeIfMissing(path.join(base, "description.txt"), `${display} - a simple utility app.`);
    writeIfMissing(path.join(base, "keywords.txt"), "utility, tools, free");
    writeIfMissing(path.join(base, "release_notes.txt"), "Bug fixes and performance improvements.");
    writeIfMissing(path.join(base, "privacy_url.txt"), config.metadata?.privacyPolicyUrl || "");
    logger.success(`iOS metadata scaffolded → ${base}`);
  }
}

// ── Changelog ─────────────────────────────────────────────────────────────────
function updateChangelog(appId, text, platform = "both") {
  const config = loadAppConfig(appId);

  if (platform === "android" || platform === "both") {
    const p = path.resolve(ROOT, config.android.metadataPath, "en-US/changelogs/default.txt");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text.slice(0, 500));
    logger.success(`Android changelog updated: ${p}`);
  }

  if ((platform === "ios" || platform === "both") && config.ios) {
    const p = path.resolve(ROOT, config.ios.metadataPath, "en-US/release_notes.txt");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text.slice(0, 4000));
    logger.success(`iOS release notes updated: ${p}`);
  }
}

// ── Print validation report ───────────────────────────────────────────────────
function printValidationReport(appId) {
  logger.header(`Metadata Validation — ${appId}`);

  const android = validateAndroidMetadata(appId);
  logger.info("Android:");
  if (android.errors.length)   android.errors.forEach(e   => logger.error(`  ${e}`));
  if (android.warnings.length) android.warnings.forEach(w => logger.warn(`  ${w}`));
  if (android.valid && !android.warnings.length) logger.success("  All checks passed");

  const ios = validateIOSMetadata(appId);
  logger.info("iOS:");
  if (ios.errors.length)   ios.errors.forEach(e   => logger.error(`  ${e}`));
  if (ios.warnings.length) ios.warnings.forEach(w => logger.warn(`  ${w}`));
  if (ios.valid && !ios.warnings.length) logger.success("  All checks passed");

  return { android, ios };
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
}

module.exports = {
  validateAndroidMetadata,
  validateIOSMetadata,
  scaffoldMetadata,
  updateChangelog,
  printValidationReport,
};
