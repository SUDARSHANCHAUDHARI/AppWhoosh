const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs     = require("fs");
const path   = require("path");
const os     = require("os");

// Use temp dir for history in tests
process.env.HOME = os.tmpdir();

const history = require("../tools/history");

describe("history module", () => {
  const TEST_APP = "test-history-app-" + Date.now();

  after(() => {
    // Clean up test entries
    const file = path.join(os.tmpdir(), ".blitz", "history.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });

  test("record writes an entry", () => {
    history.record(TEST_APP, "build_android", true, 5000);
    const entries = history.getHistory(TEST_APP, 10);
    assert.ok(entries.length >= 1);
    assert.equal(entries[0].app_id, TEST_APP);
    assert.equal(entries[0].tool_name, "build_android");
    assert.equal(entries[0].success, true);
  });

  test("record captures failure with error message", () => {
    history.record(TEST_APP, "deploy_android", false, 2000, "network timeout");
    const entries = history.getHistory(TEST_APP, 10);
    const failed  = entries.find(e => !e.success);
    assert.ok(failed);
    assert.equal(failed.error, "network timeout");
  });

  test("getLastRelease returns most recent successful release", () => {
    history.record(TEST_APP, "release_app", true, 10000);
    const last = history.getLastRelease(TEST_APP);
    assert.ok(last !== null);
    assert.equal(last.success, true);
    assert.equal(last.app_id, TEST_APP);
  });

  test("getLastRelease returns null for app with no releases", () => {
    const last = history.getLastRelease("app-that-never-released-xyz");
    assert.equal(last, null);
  });

  test("getHistory returns most recent entries first", () => {
    const entries = history.getHistory(TEST_APP, 5);
    assert.ok(entries.length > 0);
    // Most recent first — first entry timestamp >= last entry timestamp
    if (entries.length > 1) {
      const first = new Date(entries[0].timestamp).getTime();
      const last_ = new Date(entries[entries.length-1].timestamp).getTime();
      assert.ok(first >= last_);
    }
  });
});
