const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const {
  BlitzError, ConfigError, BuildError, SigningError,
  DeployError, ScreenshotError, MetadataError, PreflightError,
  formatError,
} = require("../tools/errors");

describe("custom error classes", () => {
  test("BlitzError has name and hint", () => {
    const e = new BlitzError("test message", "test hint");
    assert.equal(e.name, "BlitzError");
    assert.equal(e.message, "test message");
    assert.equal(e.hint, "test hint");
    assert.ok(e instanceof Error);
  });

  test("ConfigError has correct name", () => {
    const e = new ConfigError("bad config");
    assert.equal(e.name, "ConfigError");
    assert.ok(e instanceof BlitzError);
  });

  test("BuildError has correct name", () => {
    const e = new BuildError("gradle failed");
    assert.equal(e.name, "BuildError");
  });

  test("SigningError has correct name", () => {
    const e = new SigningError("no keystore");
    assert.equal(e.name, "SigningError");
  });

  test("DeployError has correct name", () => {
    const e = new DeployError("upload failed");
    assert.equal(e.name, "DeployError");
  });

  test("ScreenshotError has correct name", () => {
    const e = new ScreenshotError("no device");
    assert.equal(e.name, "ScreenshotError");
  });

  test("MetadataError has correct name", () => {
    const e = new MetadataError("missing title");
    assert.equal(e.name, "MetadataError");
  });

  test("PreflightError has correct name", () => {
    const e = new PreflightError("no adb");
    assert.equal(e.name, "PreflightError");
  });

  test("formatError includes name and message", () => {
    const e = new BuildError("gradle exploded", "check your build.gradle");
    const str = formatError(e);
    assert.ok(str.includes("BuildError"));
    assert.ok(str.includes("gradle exploded"));
    assert.ok(str.includes("check your build.gradle"));
  });

  test("formatError works on plain Error", () => {
    const e = new Error("plain error");
    const str = formatError(e);
    assert.ok(str.includes("plain error"));
  });
});
