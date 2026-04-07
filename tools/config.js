const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/**
 * Load and validate a single app config by app ID.
 * @param {string} appId
 * @returns {object} config
 */
function loadAppConfig(appId) {
  const registry = loadRegistry();
  const entry = registry.apps.find((a) => a.id === appId);
  if (!entry) throw new Error(`App "${appId}" not found in registry.`);
  if (!entry.enabled) throw new Error(`App "${appId}" is disabled.`);

  const configPath = path.resolve(ROOT, entry.configPath);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found at: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config._platforms = entry.platforms;
  config._id = appId;
  return config;
}

/**
 * Load all enabled apps from registry.
 * @returns {object[]} array of configs
 */
function loadAllConfigs() {
  const registry = loadRegistry();
  return registry.apps
    .filter((a) => a.enabled)
    .map((a) => loadAppConfig(a.id));
}

/**
 * Load registry.json
 */
function loadRegistry() {
  const registryPath = path.resolve(ROOT, "config/registry.json");
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

/**
 * List all app IDs from registry.
 */
function listAppIds() {
  const registry = loadRegistry();
  return registry.apps.filter((a) => a.enabled).map((a) => a.id);
}

/**
 * Resolve keystorePath for an Android app.
 */
function resolveKeystorePath(config) {
  const base = process.env.KEYSTORE_BASE_PATH || "";
  const alias = config.android.keystoreAlias;
  return path.join(base, `${alias}.keystore`);
}

module.exports = { loadAppConfig, loadAllConfigs, loadRegistry, listAppIds, resolveKeystorePath };
