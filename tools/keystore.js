"use strict";

const { execSync } = require("child_process");
const fs           = require("fs");
const path         = require("path");
const logger       = require("./logger");
const { SigningError } = require("./errors");
const { loadAppConfig } = require("./config");

function resolveKeystorePath(alias) {
  const base = process.env.KEYSTORE_BASE_PATH;
  if (!base) throw new SigningError("KEYSTORE_BASE_PATH not set in .env");
  return path.join(base, `${alias}.keystore`);
}

// ── Create a new keystore (SudarshanTechLabs convention) ─────────────────────
function createKeystore(appId) {
  const config   = loadAppConfig(appId);
  const alias    = config.android.keystoreAlias;
  const ksPath   = resolveKeystorePath(alias);
  const storePass = process.env.KEYSTORE_PASSWORD;
  const keyPass   = process.env.KEYSTORE_KEY_PASSWORD;

  if (!storePass || !keyPass) {
    throw new SigningError("KEYSTORE_PASSWORD / KEYSTORE_KEY_PASSWORD not set in .env");
  }
  if (fs.existsSync(ksPath)) {
    logger.warn(`Keystore already exists: ${ksPath}`);
    return ksPath;
  }

  fs.mkdirSync(path.dirname(ksPath), { recursive: true });

  const cmd = [
    "keytool -genkey -v",
    `-keystore "${ksPath}"`,
    `-alias "${alias}"`,
    `-keyalg RSA`,
    `-keysize 2048`,
    `-validity 10000`,
    `-storepass "${storePass}"`,
    `-keypass "${keyPass}"`,
    `-dname "CN=SudarshanTechLabs, OU=Bangkok, O=SudarshanTechLabs, L=Bangkok, ST=Bangkok, C=TH"`,
  ].join(" ");

  execSync(cmd, { stdio: "pipe" });
  logger.success(`Keystore created: ${ksPath}`);
  return ksPath;
}

// ── Verify a keystore exists and alias is valid ───────────────────────────────
function verifyKeystore(appId) {
  const config    = loadAppConfig(appId);
  const alias     = config.android.keystoreAlias;
  const ksPath    = resolveKeystorePath(alias);
  const storePass = process.env.KEYSTORE_PASSWORD;

  logger.info(`Checking keystore for ${appId} (alias: ${alias})...`);

  if (!fs.existsSync(ksPath)) {
    logger.error(`Keystore not found: ${ksPath}`);
    logger.warn(`Fix: blitz android keystore create ${appId}`);
    return false;
  }

  try {
    const out = execSync(
      `keytool -list -keystore "${ksPath}" -alias "${alias}" -storepass "${storePass}" 2>&1`,
      { stdio: "pipe" }
    ).toString();

    if (out.includes("does not exist")) {
      logger.error(`Alias "${alias}" not found in keystore`);
      return false;
    }

    logger.success(`Keystore valid: ${ksPath}`);
    logger.success(`Alias "${alias}" found`);
    return true;
  } catch (err) {
    logger.error(`Keystore verification failed: ${err.message}`);
    return false;
  }
}

// ── List all keystores ────────────────────────────────────────────────────────
function listKeystores() {
  const base = process.env.KEYSTORE_BASE_PATH;
  if (!base || !fs.existsSync(base)) {
    logger.warn("KEYSTORE_BASE_PATH not set or does not exist");
    return [];
  }
  const files = fs.readdirSync(base).filter(f => f.endsWith(".keystore"));
  if (!files.length) {
    logger.warn("No .keystore files found in KEYSTORE_BASE_PATH");
    return [];
  }
  logger.header(`Keystores in ${base}`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(base, f));
    logger.info(`  ${f}  (${(stat.size/1024).toFixed(1)} KB)`);
  });
  return files;
}

module.exports = { createKeystore, verifyKeystore, listKeystores, resolveKeystorePath };
