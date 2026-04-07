"use strict";

const fs   = require("fs");
const path = require("path");

const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  white:  "\x1b[37m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
};

const ICONS = { info: "ℹ", success: "✓", warn: "!", error: "✗", step: "→" };

const LOG_DIR = path.join(process.env.HOME || "~", ".appwhoosh", "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

function logFilePath() {
  const d    = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return path.join(LOG_DIR, `appwhoosh-${date}.log`);
}

function timestamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function writeToDisk(level, message) {
  try { fs.appendFileSync(logFilePath(), `[${timestamp()}] ${level.toUpperCase().padEnd(7)} ${message}\n`); } catch (_) {}
}

function print(color, icon, message) {
  process.stdout.write(`${C.gray}[${timestamp()}]${C.reset} ${color}${icon}${C.reset}  ${message}\n`);
}

const logger = {
  info(msg)    { print(C.white,  ICONS.info,    msg); writeToDisk("info",    msg); },
  success(msg) { print(C.green,  ICONS.success, msg); writeToDisk("success", msg); },
  warn(msg)    { print(C.yellow, ICONS.warn,    msg); writeToDisk("warn",    msg); },
  error(msg)   { print(C.red,    ICONS.error,   msg); writeToDisk("error",   msg); },
  step(msg)    { print(C.cyan,   ICONS.step,    msg); writeToDisk("step",    msg); },
  header(title) {
    const line = "─".repeat(50);
    process.stdout.write(`\n${C.bold}${line}\n  ${title}\n${line}${C.reset}\n\n`);
    writeToDisk("header", title);
  },
  table(rows) {
    const maxKey = Math.max(...rows.map(r => r[0].length));
    for (const [k, v] of rows) {
      process.stdout.write(`  ${C.gray}${k.padEnd(maxKey)}${C.reset}  ${v}\n`);
    }
    process.stdout.write("\n");
  },
  logPath() { return logFilePath(); },
};

module.exports = logger;
