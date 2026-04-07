"use strict";
require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const { getToolDefinitions, executeTool } = require("./tools");
const logger  = require("../tools/logger");
const history = require("../tools/history");
const { formatError } = require("../tools/errors");
const fs   = require("fs");
const path = require("path");

const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CRASH_DIR = path.join(process.env.HOME || "~", ".appwhoosh");

const SYSTEM_PROMPT = `You are AppWhoosh, an AI-powered release agent for macOS.
Your tagline: "Ship your apps. Whoosh."
You help Sudarshan (SudarshanTechLabs, Bangkok, Thailand) build, screenshot, and deploy Android and iOS apps to Google Play and App Store Connect.

Developer context:
- Package prefix: com.sudarshantechlabs
- GitHub: SUDARSHANCHAUDHARI
- 20+ Android utility apps on Google Play
- macOS only tool

You have 15 tools: list apps, build Android/iOS, capture screenshots, deploy to stores, full release pipeline, version bumping, metadata validation, ASO, batch operations, and more.

Rules:
- When asked to "release all" always confirm before calling release_all.
- Keep responses concise. Use bullet points for multi-step summaries.
- After each tool call summarize what happened in plain English.
- When a tool fails read the error and suggest a specific fix.
- Never expose raw stack traces — summarize the issue clearly.
- You are AppWhoosh — never refer to yourself as Blitz or Claude.`;

const conversationHistory = [];
const MAX_HISTORY = 20;

async function withRetry(fn, retries = 3, delayMs = 10000) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      const isRate = err.status === 429 || (err.message || "").includes("rate_limit");
      if (isRate && i < retries - 1) {
        logger.warn(`Rate limit — retrying in ${delayMs/1000}s (${i+1}/${retries})`);
        await new Promise(r => setTimeout(r, delayMs));
      } else throw err;
    }
  }
}

async function runAgent(userMessage, onUpdate = (msg) => process.stdout.write(msg + "\n")) {
  const tools = getToolDefinitions();
  conversationHistory.push({ role: "user", content: userMessage });
  const messages = conversationHistory.slice(-MAX_HISTORY);

  onUpdate(`\n⚡ AppWhoosh: "${userMessage}"\n`);

  try {
    while (true) {
      const response = await withRetry(() =>
        client.messages.create({
          model: "claude-opus-4-5", max_tokens: 4096,
          system: SYSTEM_PROMPT, tools, messages,
        })
      );

      const textBlocks = response.content.filter(b => b.type === "text");
      const toolBlocks = response.content.filter(b => b.type === "tool_use");

      for (const block of textBlocks) onUpdate(`\n${block.text}`);

      if (response.stop_reason === "end_turn" || toolBlocks.length === 0) {
        if (textBlocks.length) conversationHistory.push({ role: "assistant", content: textBlocks.map(b => b.text).join("\n") });
        break;
      }

      const toolResults = [];
      for (const toolCall of toolBlocks) {
        onUpdate(`\n[Tool] ${toolCall.name}(${JSON.stringify(toolCall.input)})`);
        const start = Date.now();
        let result;
        try {
          result = await executeTool(toolCall.name, toolCall.input);
          const dur = Date.now() - start;
          onUpdate(`[Tool] ✓ ${toolCall.name} (${Math.round(dur/1000)}s)`);
          history.record(toolCall.input.app_id || "—", toolCall.name, true, dur);
        } catch (err) {
          result = { error: err.message, hint: err.hint || "" };
          onUpdate(`[Tool] ✗ ${toolCall.name}: ${err.message}`);
          history.record(toolCall.input.app_id || "—", toolCall.name, false, Date.now() - start, err.message);
        }
        toolResults.push({ type: "tool_result", tool_use_id: toolCall.id, content: JSON.stringify(result) });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }
  } catch (err) {
    const crashPath = path.join(CRASH_DIR, `crash-${Date.now()}.log`);
    fs.mkdirSync(CRASH_DIR, { recursive: true });
    fs.writeFileSync(crashPath, `${new Date().toISOString()}\n${userMessage}\n\n${err.stack || err.message}`);
    logger.error(`AppWhoosh error: ${err.message}`);
    logger.warn(`Crash log saved: ${crashPath}`);
  }
}

module.exports = { runAgent };
