"use strict";

/**
 * Base error for all Blitz errors.
 * Includes a `hint` property with a plain-English fix suggestion.
 */
class BlitzError extends Error {
  constructor(message, hint = "") {
    super(message);
    this.name  = "BlitzError";
    this.hint  = hint;
  }
}

class ConfigError extends BlitzError {
  constructor(message, hint = "Check your config.json and config/registry.json.") {
    super(message, hint);
    this.name = "ConfigError";
  }
}

class BuildError extends BlitzError {
  constructor(message, hint = "Check Gradle / Xcode output above for the root cause.") {
    super(message, hint);
    this.name = "BuildError";
  }
}

class SigningError extends BlitzError {
  constructor(message, hint = "Run: blitz android keystore verify <app-id>  or  blitz ios certs sync <app-id>") {
    super(message, hint);
    this.name = "SigningError";
  }
}

class DeployError extends BlitzError {
  constructor(message, hint = "Check fastlane output above. Common fixes: verify store credentials in .env.") {
    super(message, hint);
    this.name = "DeployError";
  }
}

class ScreenshotError extends BlitzError {
  constructor(message, hint = "Ensure a device is connected (adb devices) or a simulator is booted.") {
    super(message, hint);
    this.name = "ScreenshotError";
  }
}

class MetadataError extends BlitzError {
  constructor(message, hint = "Run: blitz metadata scaffold <app-id>  to create missing files.") {
    super(message, hint);
    this.name = "MetadataError";
  }
}

class PreflightError extends BlitzError {
  constructor(message, hint = "Run: blitz doctor  for a full preflight report.") {
    super(message, hint);
    this.name = "PreflightError";
  }
}

/**
 * Format any error for terminal display, including hint if available.
 */
function formatError(err) {
  const lines = [`${err.name || "Error"}: ${err.message}`];
  if (err.hint) lines.push(`  Hint: ${err.hint}`);
  return lines.join("\n");
}

module.exports = {
  BlitzError,
  ConfigError,
  BuildError,
  SigningError,
  DeployError,
  ScreenshotError,
  MetadataError,
  PreflightError,
  formatError,
};
