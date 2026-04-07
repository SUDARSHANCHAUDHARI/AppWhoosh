const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// Do not actually send notifications in tests
process.env.TELEGRAM_BOT_TOKEN = "";
process.env.TELEGRAM_CHAT_ID   = "";

const { notifyMac, notifyTelegram, notifySuccess, notifyError, notifyBatchComplete, formatDuration } = (() => {
  const mod = require("../tools/notify");
  return { ...mod, formatDuration: mod._formatDuration };
})();

describe("notify module", () => {
  test("notifyMac does not throw without osascript (CI)", () => {
    assert.doesNotThrow(() => notifyMac("Test", "Message"));
  });

  test("notifyTelegram is silent when no credentials set", () => {
    assert.doesNotThrow(() => notifyTelegram("Test message"));
  });

  test("notifySuccess does not throw", () => {
    assert.doesNotThrow(() => notifySuccess("example-app", "android", 120000));
  });

  test("notifyError does not throw", () => {
    assert.doesNotThrow(() => notifyError("example-app", "android", new Error("build failed")));
  });

  test("notifyBatchComplete does not throw with mixed results", () => {
    const results = {
      "app-one": { success: true },
      "app-two": { success: false, error: "network error" },
    };
    assert.doesNotThrow(() => notifyBatchComplete(results));
  });
});
