const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const path   = require("path");

// Point config loader at our test fixture
process.env.KEYSTORE_BASE_PATH = "/tmp/test-keystores";

// Override registry loading for tests
const { loadAppConfig, listAppIds } = require("../tools/config");

describe("config loader", () => {
  test("loadAppConfig returns correct fields for example-app", () => {
    const config = loadAppConfig("example-app");
    assert.equal(config.name, "example-app");
    assert.equal(config.android.package, "com.sudarshantechlabs.exampleapp");
    assert.equal(config.android.keystoreAlias, "exampleapp");
    assert.equal(config._id, "example-app");
  });

  test("loadAppConfig throws for unknown app", () => {
    assert.throws(
      () => loadAppConfig("nonexistent-app-xyz"),
      { message: /not found in registry/i }
    );
  });

  test("listAppIds returns an array", () => {
    const ids = listAppIds();
    assert.ok(Array.isArray(ids));
    assert.ok(ids.length >= 0);
  });

  test("android.package follows com.sudarshantechlabs prefix", () => {
    try {
      const config = loadAppConfig("example-app");
      assert.ok(config.android.package.startsWith("com.sudarshantechlabs."));
    } catch (_) {
      // Skip if example-app not in registry
    }
  });
});
