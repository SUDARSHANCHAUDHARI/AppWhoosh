const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");

/**
 * Build iOS IPA via xcodebuild + fastlane match signing.
 * @param {object} config - app config
 * @returns {string} path to exported .ipa
 */
function buildIOS(config) {
  const workspace = path.resolve(ROOT, config.ios.workspace);
  const scheme = config.ios.scheme;
  const archivePath = path.join(
    process.env.BUILD_OUTPUT_DIR || "/tmp/blitz-builds",
    `${config._id}.xcarchive`
  );
  const exportPath = path.join(
    process.env.BUILD_OUTPUT_DIR || "/tmp/blitz-builds",
    `${config._id}-ipa`
  );

  if (!fs.existsSync(workspace)) {
    throw new Error(`iOS workspace not found: ${workspace}`);
  }

  // Ensure signing certs are available via fastlane match
  console.log(`[iOS] Syncing certificates via fastlane match...`);
  execSync(
    `fastlane match appstore \
      --app_identifier ${config.ios.bundleId} \
      --git_url $MATCH_GIT_URL \
      --readonly true`,
    { stdio: "inherit" }
  );

  console.log(`[iOS] Archiving ${config.name}...`);
  execSync(
    `xcodebuild \
      -workspace "${workspace}" \
      -scheme "${scheme}" \
      -configuration Release \
      -archivePath "${archivePath}" \
      -destination "generic/platform=iOS" \
      clean archive`,
    { stdio: "inherit" }
  );

  // Export archive to IPA
  const exportPlistPath = generateExportPlist(config, exportPath);
  console.log(`[iOS] Exporting IPA...`);
  execSync(
    `xcodebuild \
      -exportArchive \
      -archivePath "${archivePath}" \
      -exportOptionsPlist "${exportPlistPath}" \
      -exportPath "${exportPath}"`,
    { stdio: "inherit" }
  );

  const ipaFile = fs.readdirSync(exportPath).find((f) => f.endsWith(".ipa"));
  if (!ipaFile) throw new Error(`IPA not found in ${exportPath}`);

  const ipaPath = path.join(exportPath, ipaFile);
  console.log(`[iOS] Build complete: ${ipaPath}`);
  return ipaPath;
}

/**
 * Write a temporary ExportOptions.plist for xcodebuild export.
 */
function generateExportPlist(config, exportPath) {
  fs.mkdirSync(exportPath, { recursive: true });
  const plistPath = path.join(exportPath, "ExportOptions.plist");
  const teamId = config.ios.teamId || process.env.APPLE_TEAM_ID || "";

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>${teamId}</string>
  <key>uploadBitcode</key>
  <false/>
  <key>uploadSymbols</key>
  <true/>
  <key>compileBitcode</key>
  <false/>
</dict>
</plist>`;

  fs.writeFileSync(plistPath, plist);
  return plistPath;
}

module.exports = { buildIOS };
