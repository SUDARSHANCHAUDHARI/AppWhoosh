"use strict";

const { loadAppConfig, loadAllConfigs, listAppIds } = require("../tools/config");
const { buildAndroid }   = require("../tools/build-android");
const { buildIOS }       = require("../tools/build-ios");
const { deployAndroid, deployIOS } = require("../tools/deploy");
const { screenshotsAndroid, screenshotsIOS } = require("../tools/screenshots");
const { validateAndroidMetadata, scaffoldMetadata, updateChangelog } = require("../tools/metadata");
const { batchRelease, batchScreenshots, batchValidate, printDashboard } = require("../tools/batch");
const { notifySuccess, notifyError } = require("../tools/notify");
const { getCurrentVersion, bumpVersion } = require("../tools/version");
const { printASOReport, researchKeywords } = require("../tools/aso");
const history = require("../tools/history");
const path    = require("path");
const { execSync } = require("child_process");

const BUILD_OUT = process.env.BUILD_OUTPUT_DIR || "/tmp/appwhoosh-builds";

const TOOLS = [

  {
    name: "list_apps",
    description: "List all registered app IDs.",
    input_schema: { type: "object", properties: {}, required: [] },
    handler: async () => ({ apps: listAppIds(), count: listAppIds().length }),
  },

  {
    name: "build_android",
    description: "Build a signed release AAB for an Android app.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const config  = loadAppConfig(app_id);
      const aabPath = buildAndroid(config);
      return { success: true, aab_path: aabPath, app_id };
    },
  },

  {
    name: "build_ios",
    description: "Build a signed IPA for an iOS app.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const config  = loadAppConfig(app_id);
      const ipaPath = buildIOS(config);
      return { success: true, ipa_path: ipaPath, app_id };
    },
  },

  {
    name: "deploy_android",
    description: "Deploy Android AAB to Google Play Store.",
    input_schema: {
      type: "object",
      properties: {
        app_id:   { type: "string" },
        aab_path: { type: "string" },
        track:    { type: "string", enum: ["internal","alpha","beta","production"] },
      },
      required: ["app_id", "aab_path"],
    },
    handler: async ({ app_id, aab_path, track }) => {
      const config = loadAppConfig(app_id);
      if (track) config.android.track = track;
      deployAndroid(config, aab_path);
      const url = `https://play.google.com/store/apps/details?id=${config.android.package}`;
      return { success: true, app_id, store: "google_play", url };
    },
  },

  {
    name: "deploy_ios",
    description: "Deploy iOS IPA to App Store Connect.",
    input_schema: {
      type: "object",
      properties: {
        app_id:   { type: "string" },
        ipa_path: { type: "string" },
      },
      required: ["app_id", "ipa_path"],
    },
    handler: async ({ app_id, ipa_path }) => {
      const config = loadAppConfig(app_id);
      deployIOS(config, ipa_path);
      return { success: true, app_id, store: "app_store_connect" };
    },
  },

  {
    name: "screenshots_android",
    description: "Capture Play Store screenshots for an Android app via ADB.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const config  = loadAppConfig(app_id);
      const outDir  = path.join(BUILD_OUT, app_id, "screenshots/android");
      const shots   = screenshotsAndroid(config, outDir);
      return { success: true, app_id, screenshots: shots, output_dir: outDir };
    },
  },

  {
    name: "screenshots_ios",
    description: "Capture App Store screenshots for an iOS app via Simulator.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const config  = loadAppConfig(app_id);
      const outDir  = path.join(BUILD_OUT, app_id, "screenshots/ios");
      const shots   = screenshotsIOS(config, outDir);
      return { success: true, app_id, screenshots: shots, output_dir: outDir };
    },
  },

  {
    name: "release_app",
    description: "Full release pipeline for one app: build → screenshots → deploy.",
    input_schema: {
      type: "object",
      properties: {
        app_id:           { type: "string" },
        platforms:        { type: "array", items: { type: "string", enum: ["android","ios"] } },
        skip_screenshots: { type: "boolean" },
      },
      required: ["app_id"],
    },
    handler: async ({ app_id, platforms, skip_screenshots = false }) => {
      const config  = loadAppConfig(app_id);
      const targets = platforms || config._platforms || ["android"];
      const results = {};
      const start   = Date.now();

      for (const platform of targets) {
        if (platform === "android" && config.android) {
          const aab = buildAndroid(config);
          if (!skip_screenshots) screenshotsAndroid(config, path.join(BUILD_OUT, app_id, "screenshots/android"));
          deployAndroid(config, aab);
          results.android = { success: true };
        }
        if (platform === "ios" && config.ios) {
          const ipa = buildIOS(config);
          if (!skip_screenshots) screenshotsIOS(config, path.join(BUILD_OUT, app_id, "screenshots/ios"));
          deployIOS(config, ipa);
          results.ios = { success: true };
        }
      }

      notifySuccess(app_id, targets[0], Date.now() - start);
      return { success: true, app_id, results };
    },
  },

  {
    name: "release_all",
    description: "Release ALL registered apps. Use only after user confirms.",
    input_schema: {
      type: "object",
      properties: {
        platforms:        { type: "array", items: { type: "string" } },
        skip_screenshots: { type: "boolean" },
      },
      required: [],
    },
    handler: async ({ platforms, skip_screenshots = false }) => {
      const results = await batchRelease({ platforms: platforms || ["android"], skipScreenshots: skip_screenshots });
      return { success: true, results };
    },
  },

  {
    name: "get_app_status",
    description: "Get the last release date, last screenshot date, and current version for an app.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const lastRelease    = history.getLastRelease(app_id);
      const lastScreenshot = history.getLastScreenshot(app_id);
      let version = null;
      try { version = getCurrentVersion(app_id); } catch (_) {}
      return {
        app_id,
        last_release:    lastRelease    ? lastRelease.timestamp    : null,
        last_screenshot: lastScreenshot ? lastScreenshot.timestamp : null,
        version,
      };
    },
  },

  {
    name: "update_whatsnew",
    description: "Update the changelog/release notes for an app on both platforms.",
    input_schema: {
      type: "object",
      properties: {
        app_id: { type: "string" },
        text:   { type: "string" },
      },
      required: ["app_id", "text"],
    },
    handler: async ({ app_id, text }) => {
      updateChangelog(app_id, text, "both");
      return { success: true, app_id, text };
    },
  },

  {
    name: "validate_metadata",
    description: "Validate Play Store / App Store metadata for an app.",
    input_schema: {
      type: "object",
      properties: { app_id: { type: "string" } },
      required: ["app_id"],
    },
    handler: async ({ app_id }) => {
      const android = validateAndroidMetadata(app_id);
      return { app_id, android };
    },
  },

  {
    name: "get_dashboard",
    description: "Get release status for all apps.",
    input_schema: { type: "object", properties: {}, required: [] },
    handler: async () => {
      const ids = listAppIds();
      return ids.map(appId => ({
        appId,
        lastRelease:    history.getLastRelease(appId)?.timestamp    || null,
        lastScreenshot: history.getLastScreenshot(appId)?.timestamp || null,
      }));
    },
  },

  {
    name: "bump_version",
    description: "Bump Android versionCode + versionName before release.",
    input_schema: {
      type: "object",
      properties: {
        app_id: { type: "string" },
        type:   { type: "string", enum: ["patch","minor","major","code-only"] },
      },
      required: ["app_id"],
    },
    handler: async ({ app_id, type = "patch" }) => {
      const result = bumpVersion(app_id, type);
      return { success: true, app_id, ...result };
    },
  },

  {
    name: "open_store_listing",
    description: "Open the Play Store or App Store listing in the browser.",
    input_schema: {
      type: "object",
      properties: {
        app_id:   { type: "string" },
        platform: { type: "string", enum: ["android","ios"] },
      },
      required: ["app_id"],
    },
    handler: async ({ app_id, platform = "android" }) => {
      const config = loadAppConfig(app_id);
      let url;
      if (platform === "android") {
        url = `https://play.google.com/store/apps/details?id=${config.android.package}`;
      } else {
        url = "https://appstoreconnect.apple.com";
      }
      try { execSync(`open "${url}"`); } catch (_) {}
      return { success: true, url };
    },
  },

];

function getToolDefinitions() {
  return TOOLS.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
}

async function executeTool(name, input) {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return await tool.handler(input);
}

module.exports = { TOOLS, getToolDefinitions, executeTool };
