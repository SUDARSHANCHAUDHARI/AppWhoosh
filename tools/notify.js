"use strict";

const { execFileSync } = require("child_process");
const https        = require("https");
const logger       = require("./logger");

// ── macOS notification via osascript ─────────────────────────────────────────
function notifyMac(title, message, options = {}) {
  const sound    = options.sound    || "Glass";
  const subtitle = options.subtitle || "";
  // Values go in as argv, never into the script text, so quotes can't inject AppleScript or shell.
  const script   = [
    "on run argv",
    "display notification (item 2 of argv) with title (item 1 of argv) subtitle (item 3 of argv) sound name (item 4 of argv)",
    "end run",
  ];
  try {
    execFileSync("osascript", [...script.flatMap(l => ["-e", l]), String(title), String(message), subtitle, sound], { stdio: "ignore" });
  } catch (_) {
    // Silent — notifications are optional
  }
}

// ── Telegram via Bot API ──────────────────────────────────────────────────────
function notifyTelegram(message) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;          // silently skip if not configured

  const body = JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" });
  const opts = {
    hostname: "api.telegram.org",
    path:     `/bot${token}/sendMessage`,
    method:   "POST",
    headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
  };

  const req = https.request(opts, (res) => {
    if (res.statusCode !== 200) {
      logger.warn(`Telegram notification failed (HTTP ${res.statusCode})`);
    }
  });
  req.on("error", (e) => logger.warn(`Telegram error: ${e.message}`));
  req.write(body);
  req.end();
}

// ── High-level helpers ────────────────────────────────────────────────────────
function notifySuccess(appId, platform, durationMs) {
  const dur = formatDuration(durationMs);
  const platformLabel = platform === "android" ? "Play Store" : "App Store";
  const storeUrl = platform === "android"
    ? `https://play.google.com/store/apps/details?id=com.sudarshantechlabs.${appId.replace(/-/g, "")}`
    : "https://appstoreconnect.apple.com";

  notifyMac(`Blitz ✓ ${appId}`, `Released to ${platformLabel} in ${dur}`, { sound: "Glass" });

  notifyTelegram(
    `✅ *Blitz Release Complete*\n` +
    `App: \`${appId}\`\n` +
    `Platform: ${platform}\n` +
    `Duration: ${dur}\n` +
    `Store: ${storeUrl}`
  );
}

function notifyError(appId, platform, err) {
  const msg = err && err.message ? err.message.slice(0, 120) : String(err);
  notifyMac(`Blitz ✗ ${appId}`, `Release failed: ${msg}`, { sound: "Basso" });

  notifyTelegram(
    `❌ *Blitz Release Failed*\n` +
    `App: \`${appId}\`\n` +
    `Platform: ${platform}\n` +
    `Error: ${msg}`
  );
}

function notifyBatchComplete(results) {
  const total   = Object.keys(results).length;
  const passed  = Object.values(results).filter(r => r.success).length;
  const failed  = total - passed;
  const failIds = Object.entries(results).filter(([,r]) => !r.success).map(([id]) => id).join(", ");

  notifyMac(
    `Blitz Batch Complete`,
    `${passed}/${total} apps released${failed ? ` · ${failed} failed` : ""}`,
    { sound: failed ? "Basso" : "Glass" }
  );

  let tgMsg = `📊 *Blitz Batch Complete*\n✅ ${passed} released · ❌ ${failed} failed`;
  if (failIds) tgMsg += `\nFailed: \`${failIds}\``;
  notifyTelegram(tgMsg);
}

function notifyTest() {
  notifyMac("Blitz", "Notification test successful ✓", { sound: "Glass" });
  notifyTelegram("🔔 *Blitz notification test* — working correctly.");
  logger.success("Test notification sent (macOS + Telegram if configured)");
}

// ── Util ──────────────────────────────────────────────────────────────────────
function formatDuration(ms) {
  if (!ms || ms < 1000) return "<1s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

module.exports = { notifyMac, notifyTelegram, notifySuccess, notifyError, notifyBatchComplete, notifyTest };
