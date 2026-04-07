const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { resolveKeystorePath } = require("./config");

const ROOT = path.resolve(__dirname, "..");

/**
 * Build Android AAB (release) for a given app config.
 * @param {object} config - app config
 * @returns {string} path to built .aab file
 */
function buildAndroid(config) {
  const androidPath = path.resolve(ROOT, config.android.path);

  if (!fs.existsSync(androidPath)) {
    throw new Error(`Android project not found: ${androidPath}`);
  }

  const keystorePath = resolveKeystorePath(config);
  const alias = config.android.keystoreAlias;
  const keystorePass = process.env.KEYSTORE_PASSWORD;
  const keyPass = process.env.KEYSTORE_KEY_PASSWORD;

  const flavor = config.android.flavor ? config.android.flavor : "";
  const buildTask = flavor
    ? `bundle${capitalize(flavor)}Release`
    : "bundleRelease";

  console.log(`[Android] Building ${config.name} → ${buildTask}`);

  execSync(
    `./gradlew clean ${buildTask} \
      -Pandroid.injected.signing.store.file=${keystorePath} \
      -Pandroid.injected.signing.store.password=${keystorePass} \
      -Pandroid.injected.signing.key.alias=${alias} \
      -Pandroid.injected.signing.key.password=${keyPass}`,
    { cwd: androidPath, stdio: "inherit" }
  );

  // Locate the .aab output
  const aabDir = path.join(
    androidPath,
    "app/build/outputs/bundle",
    flavor ? `${flavor}Release` : "release"
  );
  const aabFile = fs.readdirSync(aabDir).find((f) => f.endsWith(".aab"));
  if (!aabFile) throw new Error(`AAB not found in ${aabDir}`);

  const aabPath = path.join(aabDir, aabFile);
  console.log(`[Android] Build complete: ${aabPath}`);
  return aabPath;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { buildAndroid };
