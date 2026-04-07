"use strict";

const https    = require("https");
const fs       = require("fs");
const path     = require("path");
const readline = require("readline");
const Anthropic = require("@anthropic-ai/sdk");
const logger   = require("./logger");
const { loadAppConfig } = require("./config");

const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CACHE_DIR = path.join(process.env.HOME || "~", ".appwhoosh");

// ── Fetch reviews from Play Developer API ─────────────────────
// NOTE: Requires GOOGLE_PLAY_JSON_KEY_PATH + googleapis npm package
// This is a working skeleton — real API needs OAuth2 token
async function fetchReviews(appId, options = {}) {
  const config  = loadAppConfig(appId);
  const pkg     = config.android.package;
  const { maxRating = 3, limit = 20 } = options;

  logger.warn(`[Reviews] Fetching reviews for ${pkg}...`);
  logger.warn(`  Note: Real Play Console API requires googleapis npm package`);
  logger.warn(`  Install: npm install googleapis`);
  logger.warn(`  Then: see https://developers.google.com/android-publisher/api-ref/rest/v3/reviews`);

  // Return placeholder reviews for development/testing
  return [
    { reviewId: "r001", author: "John D.", rating: 2, text: "App crashes on startup.", date: "2025-01-01", replied: false },
    { reviewId: "r002", author: "Jane S.", rating: 1, text: "Doesn't work on my device.", date: "2025-01-02", replied: false },
    { reviewId: "r003", author: "Mike T.", rating: 3, text: "Good but needs more features.", date: "2025-01-03", replied: false },
  ].filter(r => r.rating <= maxRating).slice(0, limit);
}

// ── AI draft reply ────────────────────────────────────────────
async function draftReply(review, appName) {
  const msg = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [{
      role: "user",
      content:
        `You are a professional app developer responding to a Play Store review.\n` +
        `App: "${appName}" by SudarshanTechLabs\n` +
        `Review (${review.rating} stars): "${review.text}"\n` +
        `Rules:\n` +
        `- Be empathetic and professional\n` +
        `- Max 350 characters\n` +
        `- Acknowledge the issue specifically\n` +
        `- Offer a solution or ask for more info\n` +
        `- End with: "- SudarshanTechLabs Team"\n` +
        `Return ONLY the reply text.`,
    }],
  });
  return msg.content[0].text.trim();
}

// ── Publish reply to Play Store ───────────────────────────────
async function publishReply(appId, reviewId, replyText) {
  // Real implementation needs googleapis OAuth2
  // POST /androidpublisher/v3/applications/{pkg}/reviews/{reviewId}:reply
  logger.warn(`[Reviews] publishReply: Real API not yet wired (needs googleapis)`);
  logger.info(`  Would publish to review ${reviewId}: "${replyText.slice(0, 60)}..."`);

  // Save to local log
  const logPath = path.join(CACHE_DIR, "replies.json");
  const replies = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf8")) : [];
  replies.push({ appId, reviewId, replyText, sentAt: new Date().toISOString() });
  fs.writeFileSync(logPath, JSON.stringify(replies, null, 2));
  logger.success(`Reply saved to ~/.appwhoosh/replies.json`);
}

// ── Interactive review responder ──────────────────────────────
async function interactiveResponder(appId, options = {}) {
  const config  = loadAppConfig(appId);
  const reviews = await fetchReviews(appId, options);

  if (!reviews.length) {
    logger.info(`No unanswered reviews found (rating ≤ ${options.maxRating || 3})`);
    return;
  }

  logger.header(`AppWhoosh Review Responder — ${appId}`);
  logger.info(`Found ${reviews.length} unanswered review(s)\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q  = (p) => new Promise(r => rl.question(p, r));

  for (const review of reviews) {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    console.log(`\n${"─".repeat(50)}`);
    console.log(`${stars} ${review.author} — ${review.date}`);
    console.log(`"${review.text}"\n`);

    logger.step("Drafting reply...");
    const draft = await draftReply(review, config.displayName || appId);
    console.log(`\nDraft reply:\n"${draft}"\n`);
    console.log(`[S]end  [E]dit  [K]ip  [Q]uit`);

    const ans = await q("Choice: ");
    if (ans.toLowerCase() === "q") { rl.close(); return; }
    if (ans.toLowerCase() === "k") { logger.info("Skipped"); continue; }

    let finalReply = draft;
    if (ans.toLowerCase() === "e") {
      finalReply = await q("Enter your reply: ");
    }

    await publishReply(appId, review.reviewId, finalReply);
    logger.success(`Reply sent for review ${review.reviewId}`);
  }

  rl.close();
  logger.success(`\nDone. Replied to ${reviews.length} review(s).`);
}

// ── Draft all replies to file ─────────────────────────────────
async function draftAllReplies(appId, options = {}) {
  const config  = loadAppConfig(appId);
  const reviews = await fetchReviews(appId, options);
  const drafts  = [];

  logger.step(`Drafting replies for ${reviews.length} review(s)...`);
  for (const review of reviews) {
    const draft = await draftReply(review, config.displayName || appId);
    drafts.push({ review, draft });
    logger.success(`  ✓ Review ${review.reviewId} drafted`);
  }

  const outPath = path.join(CACHE_DIR, `drafts-${appId}-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(drafts, null, 2));
  logger.success(`\nAll drafts saved to: ${outPath}`);
  return drafts;
}

module.exports = { fetchReviews, draftReply, publishReply, interactiveResponder, draftAllReplies };
