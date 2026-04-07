const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");

/**
 * Capture screenshots for Android via ADB.
 * Runs the app-specific screenshot script if defined,
 * otherwise falls back to generic single-screenshot.
 * @param {object} config - app config
 * @param {string} outputDir - where to save PNGs
 */
function screenshotsAndroid(config, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  if (config.android.screenshotScript) {
    const scriptPath = path.resolve(ROOT, config.android.screenshotScript);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Screenshot script not found: ${scriptPath}`);
    }
    console.log(`[Android] Running screenshot script: ${scriptPath}`);
    execSync(`bash "${scriptPath}" "${outputDir}"`, { stdio: "inherit" });
  } else {
    // Generic fallback: launch app + capture one screenshot
    const pkg = config.android.package;
    console.log(`[Android] Launching ${pkg} and capturing screenshot...`);
    execSync(`adb shell am start -n ${pkg}/.MainActivity`, { stdio: "inherit" });
    sleep(3000);
    execSync(`adb exec-out screencap -p > "${path.join(outputDir, "screen1.png")}"`, {
      stdio: "inherit",
      shell: true,
    });
  }

  const shots = fs.readdirSync(outputDir).filter((f) => f.endsWith(".png"));
  console.log(`[Android] Captured ${shots.length} screenshot(s) → ${outputDir}`);
  return shots.map((f) => path.join(outputDir, f));
}

/**
 * Capture screenshots for iOS via xcrun simctl.
 * @param {object} config - app config
 * @param {string} outputDir - where to save PNGs
 */
function screenshotsIOS(config, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  if (config.ios.screenshotScript) {
    const scriptPath = path.resolve(ROOT, config.ios.screenshotScript);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Screenshot script not found: ${scriptPath}`);
    }
    console.log(`[iOS] Running screenshot script: ${scriptPath}`);
    execSync(`bash "${scriptPath}" "${outputDir}"`, { stdio: "inherit" });
  } else {
    // Generic fallback: boot simulator + launch + screenshot
    const devices = config.ios.devices || ["iPhone 15 Pro"];
    const bundleId = config.ios.bundleId;

    for (const device of devices) {
      console.log(`[iOS] Booting simulator: ${device}`);
      execSync(`xcrun simctl boot "${device}" 2>/dev/null || true`, { stdio: "inherit" });
      sleep(3000);

      execSync(`xcrun simctl launch booted "${bundleId}"`, { stdio: "inherit" });
      sleep(3000);

      const safeName = device.replace(/[\s()]/g, "_");
      const shotPath = path.join(outputDir, `${safeName}_screen1.png`);
      execSync(`xcrun simctl io booted screenshot "${shotPath}"`, { stdio: "inherit" });

      console.log(`[iOS] Screenshot saved: ${shotPath}`);
    }
  }

  const shots = fs.readdirSync(outputDir).filter((f) => f.endsWith(".png"));
  console.log(`[iOS] Captured ${shots.length} screenshot(s) → ${outputDir}`);
  return shots.map((f) => path.join(outputDir, f));
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

module.exports = { screenshotsAndroid, screenshotsIOS };
