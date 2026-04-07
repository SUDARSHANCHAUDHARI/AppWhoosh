"use strict";

const fs        = require("fs");
const path      = require("path");
const Anthropic  = require("@anthropic-ai/sdk");
const logger    = require("./logger");
const { loadAppConfig, loadAllConfigs } = require("./config");

const ROOT   = path.resolve(__dirname, "..");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LOCALE_NAMES = {
  "en-US": "English (US)",
  "hi-IN": "Hindi (India)",
  "th-TH": "Thai (Thailand)",
};

const ANDROID_FILES = ["title.txt", "short_description.txt", "full_description.txt", "changelogs/default.txt"];
const IOS_FILES     = ["name.txt", "subtitle.txt", "description.txt", "keywords.txt", "release_notes.txt"];

async function translateText(text, fromLocale, toLocale, fieldName, limits) {
  const limitNote = limits ? ` Max ${limits} characters.` : "";
  const result = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content:
        `Translate this app store metadata field from ${LOCALE_NAMES[fromLocale] || fromLocale} to ${LOCALE_NAMES[toLocale] || toLocale}.\n` +
        `Field: ${fieldName}\n` +
        `Original:\n${text}\n\n` +
        `Rules: Use natural native phrasing. Keep brand names and app names in English.` +
        ` Preserve bullet points and line breaks.${limitNote}\n` +
        `Return ONLY the translated text.`,
    }],
  });
  return result.content[0].text.trim();
}

// ── Translate one app ─────────────────────────────────────────────────────────
async function translateMetadata(appId, toLocale, platform = "android", force = false) {
  const config     = loadAppConfig(appId);
  const fromLocale = "en-US";
  let   translated = 0;

  const files    = platform === "ios" ? IOS_FILES : ANDROID_FILES;
  const metaBase = platform === "ios"
    ? path.resolve(ROOT, config.ios?.metadataPath || "", fromLocale)
    : path.resolve(ROOT, config.android.metadataPath, fromLocale);
  const destBase = metaBase.replace(fromLocale, toLocale);

  fs.mkdirSync(destBase, { recursive: true });
  if (platform === "android") fs.mkdirSync(path.join(destBase, "changelogs"), { recursive: true });

  for (const file of files) {
    const srcPath  = path.join(metaBase, file);
    const destPath = path.join(destBase, file);

    if (!fs.existsSync(srcPath)) continue;
    if (fs.existsSync(destPath) && !force) {
      logger.info(`  Skipping ${file} (already exists, use --force to overwrite)`);
      continue;
    }

    const original = fs.readFileSync(srcPath, "utf8").trim();
    if (!original) continue;

    const limits = {
      "title.txt": 50, "name.txt": 30, "short_description.txt": 80,
      "subtitle.txt": 30, "keywords.txt": 100, "changelogs/default.txt": 500,
    }[file];

    try {
      const tx = await translateText(original, fromLocale, toLocale, file, limits);
      fs.writeFileSync(destPath, tx);
      logger.success(`  ${file} → ${toLocale}`);
      translated++;
    } catch (err) {
      logger.error(`  Failed to translate ${file}: ${err.message}`);
    }
  }

  return { appId, toLocale, translated };
}

// ── Translate all apps ────────────────────────────────────────────────────────
async function translateAllApps(toLocale, platform = "android", force = false) {
  const configs = loadAllConfigs();
  logger.header(`Translating ${configs.length} apps → ${toLocale}`);

  for (const [i, config] of configs.entries()) {
    logger.step(`[${i+1}/${configs.length}] ${config._id}`);
    try {
      await translateMetadata(config._id, toLocale, platform, force);
    } catch (err) {
      logger.error(`  ${config._id}: ${err.message}`);
    }
  }
  logger.success(`Done. All apps translated to ${toLocale}.`);
}

module.exports = { translateMetadata, translateAllApps };
