const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/**
 * Deploy Android AAB to Google Play via fastlane supply.
 * @param {object} config - app config
 * @param {string} aabPath - path to signed .aab
 */
function deployAndroid(config, aabPath) {
  const metadataPath = path.resolve(ROOT, config.android.metadataPath);
  const track = config.android.track || "production";
  const jsonKeyPath = process.env.GOOGLE_PLAY_JSON_KEY_PATH;

  if (!jsonKeyPath) throw new Error("GOOGLE_PLAY_JSON_KEY_PATH not set in .env");

  console.log(`[Android] Deploying ${config.name} to Play Store (track: ${track})...`);

  execSync(
    `fastlane supply \
      --package_name "${config.android.package}" \
      --track "${track}" \
      --aab "${aabPath}" \
      --metadata_path "${metadataPath}" \
      --json_key "${jsonKeyPath}" \
      --skip_upload_apk true`,
    { stdio: "inherit" }
  );

  console.log(`[Android] Deploy complete: ${config.name}`);
}

/**
 * Deploy iOS IPA to App Store Connect via fastlane deliver.
 * @param {object} config - app config
 * @param {string} ipaPath - path to .ipa
 */
function deployIOS(config, ipaPath) {
  const metadataPath = path.resolve(ROOT, config.ios.metadataPath);
  const submitForReview = config.release?.autoSubmit ? "true" : "false";

  const keyId = process.env.APP_STORE_KEY_ID;
  const issuerId = process.env.APP_STORE_ISSUER_ID;
  const keyPath = process.env.APP_STORE_KEY_PATH;

  if (!keyId || !issuerId || !keyPath) {
    throw new Error("App Store Connect API credentials not set in .env");
  }

  console.log(`[iOS] Deploying ${config.name} to App Store Connect...`);

  execSync(
    `fastlane deliver \
      --ipa "${ipaPath}" \
      --app_identifier "${config.ios.bundleId}" \
      --metadata_path "${metadataPath}" \
      --api_key_path "${keyPath}" \
      --submit_for_review ${submitForReview} \
      --skip_binary_upload false \
      --force`,
    { stdio: "inherit" }
  );

  console.log(`[iOS] Deploy complete: ${config.name}`);
}

module.exports = { deployAndroid, deployIOS };
