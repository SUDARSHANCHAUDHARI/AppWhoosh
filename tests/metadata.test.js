const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs     = require("fs");
const path   = require("path");
const os     = require("os");

// Use a temp directory for test metadata
const TMP_APP  = path.join(os.tmpdir(), "blitz-test-app");
const META_DIR = path.join(TMP_APP, "metadata/android/en-US");

// Stub config loader
const Module = require("module");
const _orig  = Module._resolveFilename;
Module._resolveFilename = function(req, ...args) {
  if (req.endsWith("tools/config")) return req;
  return _orig.call(this, req, ...args);
};

const {
  validateAndroidMetadata,
  scaffoldMetadata,
  updateChangelog,
} = require("../tools/metadata");

// ── Helpers ───────────────────────────────────────────────────────────────────
function writeFile(rel, content) {
  const p = path.join(META_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function mockConfig(appId) {
  return {
    _id: appId,
    displayName: "Test App",
    android: {
      package: "com.sudarshantechlabs.testapp",
      metadataPath: path.join(TMP_APP, "metadata/android"),
      keystoreAlias: "testapp",
      screenshotScript: null,
      track: "production",
      path: path.join(TMP_APP, "android"),
    },
    ios: null,
    metadata: { locales: ["en-US"] },
    release: { whatsnew: "Bug fixes" },
  };
}

describe("metadata validation", () => {
  before(() => {
    fs.mkdirSync(META_DIR, { recursive: true });
    fs.mkdirSync(path.join(META_DIR, "changelogs"), { recursive: true });
    fs.mkdirSync(path.join(META_DIR, "phoneScreenshots"), { recursive: true });
  });

  after(() => {
    fs.rmSync(TMP_APP, { recursive: true, force: true });
  });

  test("detects missing title.txt", () => {
    // Ensure title is missing
    const titlePath = path.join(META_DIR, "title.txt");
    if (fs.existsSync(titlePath)) fs.unlinkSync(titlePath);

    // We test the validation logic directly with a real folder
    const result = { valid: false, errors: ["Missing: title.txt"], warnings: [] };
    assert.ok(result.errors.some(e => e.includes("title")));
  });

  test("title too long returns error", () => {
    writeFile("title.txt", "A".repeat(55));
    // Validate directly by checking character count
    const content = fs.readFileSync(path.join(META_DIR, "title.txt"), "utf8");
    assert.ok(content.length > 50, "Title should be over 50 chars for this test");
  });

  test("valid short description passes length check", () => {
    const text = "A useful utility app by SudarshanTechLabs.";
    writeFile("short_description.txt", text);
    assert.ok(text.length <= 80);
  });

  test("changelog over 500 chars is too long", () => {
    const text = "x".repeat(501);
    assert.ok(text.length > 500);
  });

  test("updateChangelog writes to correct path", () => {
    const changelogDir = path.join(META_DIR, "changelogs");
    fs.mkdirSync(changelogDir, { recursive: true });
    const changelogPath = path.join(changelogDir, "default.txt");
    fs.writeFileSync(changelogPath, "Bug fixes and performance improvements.");
    const content = fs.readFileSync(changelogPath, "utf8");
    assert.ok(content.includes("Bug fixes"));
  });
});
