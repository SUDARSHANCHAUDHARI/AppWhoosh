"use strict";

const fs       = require("fs");
const path     = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const logger   = require("./logger");
const { loadAppConfig } = require("./config");

const ROOT   = path.resolve(__dirname, "..");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function ask(prompt) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].text.trim();
}

// ── Score existing metadata ───────────────────────────────────────────────────
function scoreMetadata(appId, platform = "android") {
  const config = loadAppConfig(appId);
  const base   = path.resolve(ROOT, config.android.metadataPath, "en-US");
  const errors = [], warnings = [], suggestions = [];
  let score = 100;

  const titlePath = path.join(base, "title.txt");
  const shortPath = path.join(base, "short_description.txt");
  const fullPath  = path.join(base, "full_description.txt");

  if (!fs.existsSync(titlePath)) { errors.push("title.txt missing"); score -= 20; }
  else {
    const t = fs.readFileSync(titlePath, "utf8").trim();
    if (t.length < 10)  { warnings.push("Title very short"); score -= 5; }
    if (t.length > 50)  { errors.push("Title too long (>50)"); score -= 15; }
    if (t.length >= 25) suggestions.push("Good title length");
  }

  if (!fs.existsSync(shortPath)) { errors.push("short_description.txt missing"); score -= 15; }
  else {
    const s = fs.readFileSync(shortPath, "utf8").trim();
    if (s.length < 30) { warnings.push("Short description too brief"); score -= 5; }
    if (s.length > 80) { errors.push("Short description too long (>80)"); score -= 10; }
  }

  if (!fs.existsSync(fullPath)) { errors.push("full_description.txt missing"); score -= 15; }
  else {
    const f = fs.readFileSync(fullPath, "utf8").trim();
    if (f.length < 500)  { warnings.push("Description too short (aim for 1500+)"); score -= 10; }
    if (f.length < 1500) { suggestions.push("Expand description to 1500+ chars for better ranking"); }
    if (!f.includes("•") && !f.includes("-")) { suggestions.push("Add bullet points for readability"); score -= 3; }
  }

  const shotDir = path.join(base, "phoneScreenshots");
  const shots = fs.existsSync(shotDir)
    ? fs.readdirSync(shotDir).filter(f => /\.(png|jpg)$/i.test(f)).length
    : 0;
  if (shots === 0) { errors.push("No screenshots"); score -= 20; }
  else if (shots < 4) { warnings.push(`Only ${shots} screenshot(s) — aim for 5+`); score -= 5; }

  return { score: Math.max(0, score), errors, warnings, suggestions };
}

// ── AI optimize title ─────────────────────────────────────────────────────────
async function optimizeTitle(appId, keywords = []) {
  const config  = loadAppConfig(appId);
  const display = config.displayName || appId;
  const base    = path.resolve(ROOT, config.android.metadataPath, "en-US");
  const current = fs.existsSync(path.join(base, "title.txt"))
    ? fs.readFileSync(path.join(base, "title.txt"), "utf8").trim()
    : display;

  const kwStr = keywords.length ? keywords.join(", ") : "utility, tools, free";
  const result = await ask(
    `You are an ASO expert for Google Play Store.\n` +
    `App: "${current}"\nTarget keywords: ${kwStr}\n` +
    `Rules: max 30 chars, include primary keyword, no special chars, no pipes.\n` +
    `Return ONLY the optimized title text, nothing else.`
  );

  logger.info(`Title: "${current}" → "${result}"`);
  return result;
}

// ── AI optimize description ───────────────────────────────────────────────────
async function optimizeDescription(appId, keywords = []) {
  const config  = loadAppConfig(appId);
  const base    = path.resolve(ROOT, config.android.metadataPath, "en-US");
  const current = fs.existsSync(path.join(base, "full_description.txt"))
    ? fs.readFileSync(path.join(base, "full_description.txt"), "utf8").trim()
    : config.displayName;

  const kwStr = keywords.length ? keywords.join(", ") : "utility, tools";
  const result = await ask(
    `You are an ASO expert. Rewrite this Play Store full description.\n` +
    `Current:\n${current}\n\nKeywords to include: ${kwStr}\n` +
    `Rules: 1500-3500 chars, keyword in first 167 chars, use bullet points,\n` +
    `include call to action, no keyword spam. Return ONLY the description text.`
  );

  return result;
}

// ── AI keyword research ───────────────────────────────────────────────────────
async function researchKeywords(appId) {
  const config  = loadAppConfig(appId);
  const display = config.displayName || appId;
  const result  = await ask(
    `Suggest 20 high-value keywords for a Android utility app called "${display}".\n` +
    `Focus on: long-tail keywords, high intent, English language.\n` +
    `Return as a JSON array of strings only. No explanation.`
  );

  try {
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (_) {
    return result.split("\n").map(l => l.replace(/^[-•"\d.]+\s*/, "").trim()).filter(Boolean);
  }
}

// ── Print ASO audit report ────────────────────────────────────────────────────
function printASOReport(appId) {
  const report = scoreMetadata(appId);
  logger.header(`ASO Audit: ${appId}`);
  logger.info(`Score: ${report.score}/100\n`);
  report.errors.forEach(e   => logger.error(e));
  report.warnings.forEach(w => logger.warn(w));
  report.suggestions.forEach(s => logger.info(`  ↳ ${s}`));
  return report;
}

module.exports = { scoreMetadata, optimizeTitle, optimizeDescription, researchKeywords, printASOReport };
