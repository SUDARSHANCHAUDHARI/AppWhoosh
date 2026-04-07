const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs     = require("fs");
const path   = require("path");
const os     = require("os");

// Redirect log dir to temp folder for tests
process.env.HOME = os.tmpdir();

const logger = require("../tools/logger");

describe("logger", () => {
  test("logger has all required methods", () => {
    assert.ok(typeof logger.info    === "function");
    assert.ok(typeof logger.success === "function");
    assert.ok(typeof logger.warn    === "function");
    assert.ok(typeof logger.error   === "function");
    assert.ok(typeof logger.step    === "function");
    assert.ok(typeof logger.header  === "function");
    assert.ok(typeof logger.table   === "function");
    assert.ok(typeof logger.logPath === "function");
  });

  test("logPath returns a string ending in .log", () => {
    const p = logger.logPath();
    assert.ok(typeof p === "string");
    assert.ok(p.endsWith(".log"));
  });

  test("calling logger.info writes to disk", () => {
    logger.info("test log entry from unit test");
    const logPath = logger.logPath();
    assert.ok(fs.existsSync(logPath));
    const content = fs.readFileSync(logPath, "utf8");
    assert.ok(content.includes("test log entry from unit test"));
  });

  test("logger.table accepts key-value pairs without throwing", () => {
    assert.doesNotThrow(() => {
      logger.table([["App", "example-app"], ["Version", "1.0.0"]]);
    });
  });

  test("logger.header does not throw", () => {
    assert.doesNotThrow(() => logger.header("Test Header"));
  });
});
