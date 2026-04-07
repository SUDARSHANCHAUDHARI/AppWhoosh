#!/usr/bin/env node
"use strict";
require("dotenv").config();

const { Command } = require("commander");
const program     = new Command();

program
  .name("appwhoosh")
  .description("⚡ AppWhoosh — Ship your apps. Whoosh.\nAI-powered release pipeline for Android + iOS on macOS.")
  .version("1.0.0");

// ── ask ───────────────────────────────────────────────────────
program
  .command("ask [message]")
  .description('AI release agent. No message = interactive REPL.')
  .action(async (message) => {
    const { runAgent } = require("../mcp/server");
    if (message) {
      await runAgent(message);
    } else {
      const readline = require("readline");
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const ask = () => rl.question("\nappwhoosh> ", async (input) => {
        if (!input || input.toLowerCase() === "exit") { rl.close(); return; }
        await runAgent(input);
        ask();
      });
      console.log('\n⚡ AppWhoosh interactive mode. Type "exit" to quit.\n');
      ask();
    }
  });

// ── list ──────────────────────────────────────────────────────
program
  .command("list")
  .description("List all registered apps")
  .action(() => {
    const { listAppIds } = require("../tools/config");
    const ids = listAppIds();
    console.log(`\n⚡ AppWhoosh — Registered apps (${ids.length}):\n`);
    ids.forEach(id => console.log(`  • ${id}`));
    console.log();
  });

// ── doctor ────────────────────────────────────────────────────
program
  .command("doctor")
  .description("Health check — verify all dependencies and credentials")
  .action(() => {
    const { printDoctor } = require("../tools/preflight");
    printDoctor();
  });

// ── dashboard ─────────────────────────────────────────────────
program
  .command("dashboard")
  .description("Status dashboard for all apps")
  .action(() => {
    const { printDashboard } = require("../tools/batch");
    printDashboard();
  });

// ── history ───────────────────────────────────────────────────
program
  .command("history <app-id>")
  .description("Show release history for an app")
  .action((appId) => {
    const { printHistory } = require("../tools/history");
    printHistory(appId);
  });

// ── notify ────────────────────────────────────────────────────
program
  .command("notify <subcommand>")
  .description("Notification commands (test)")
  .action((sub) => {
    if (sub === "test") {
      const { notifyTest } = require("../tools/notify");
      notifyTest();
    }
  });

// ── build ─────────────────────────────────────────────────────
program
  .command("build <app-id>")
  .option("--android-only").option("--ios-only")
  .description("Build Android AAB and/or iOS IPA")
  .action((appId, opts) => {
    const { loadAppConfig } = require("../tools/config");
    const { buildAndroid }  = require("../tools/build-android");
    const { buildIOS }      = require("../tools/build-ios");
    const config = loadAppConfig(appId);
    if (!opts.iosOnly && config.android)  buildAndroid(config);
    if (!opts.androidOnly && config.ios)  buildIOS(config);
  });

// ── screenshots ───────────────────────────────────────────────
program
  .command("screenshots <app-id>")
  .option("--android-only").option("--ios-only")
  .description("Capture Play Store / App Store screenshots")
  .action((appId, opts) => {
    const { loadAppConfig }  = require("../tools/config");
    const { screenshotsAndroid, screenshotsIOS } = require("../tools/screenshots");
    const config = loadAppConfig(appId);
    const base   = `/tmp/appwhoosh-builds/${appId}/screenshots`;
    if (!opts.iosOnly && config.android)  screenshotsAndroid(config, `${base}/android`);
    if (!opts.androidOnly && config.ios)  screenshotsIOS(config, `${base}/ios`);
  });

// ── deploy ────────────────────────────────────────────────────
program
  .command("deploy <app-id>")
  .option("--android-only").option("--ios-only")
  .option("--aab <path>").option("--ipa <path>")
  .option("--track <track>", "Play Store track", "production")
  .description("Deploy to Google Play and/or App Store Connect")
  .action((appId, opts) => {
    const { loadAppConfig }           = require("../tools/config");
    const { deployAndroid, deployIOS } = require("../tools/deploy");
    const config = loadAppConfig(appId);
    if (opts.track) config.android.track = opts.track;
    if (!opts.iosOnly && config.android && opts.aab) deployAndroid(config, opts.aab);
    if (!opts.androidOnly && config.ios && opts.ipa) deployIOS(config, opts.ipa);
  });

// ── release ───────────────────────────────────────────────────
program
  .command("release <app-id>")
  .option("--android-only").option("--ios-only").option("--skip-screenshots")
  .description("Full pipeline: build → screenshots → deploy")
  .action(async (appId, opts) => {
    const { loadAppConfig }           = require("../tools/config");
    const { buildAndroid }            = require("../tools/build-android");
    const { buildIOS }                = require("../tools/build-ios");
    const { deployAndroid, deployIOS } = require("../tools/deploy");
    const { screenshotsAndroid, screenshotsIOS } = require("../tools/screenshots");
    const { notifySuccess, notifyError } = require("../tools/notify");
    const logger = require("../tools/logger");
    const config = loadAppConfig(appId);
    const base   = `/tmp/appwhoosh-builds/${appId}/screenshots`;
    const start  = Date.now();

    try {
      if (!opts.iosOnly && config.android) {
        const aab = buildAndroid(config);
        if (!opts.skipScreenshots) screenshotsAndroid(config, `${base}/android`);
        deployAndroid(config, aab);
      }
      if (!opts.androidOnly && config.ios) {
        const ipa = buildIOS(config);
        if (!opts.skipScreenshots) screenshotsIOS(config, `${base}/ios`);
        deployIOS(config, ipa);
      }
      notifySuccess(appId, opts.androidOnly ? "android" : "both", Date.now() - start);
      logger.success(`⚡ Whoosh! ${appId} released.`);
    } catch (err) {
      notifyError(appId, "android", err);
      logger.error(`Release failed: ${err.message}`);
      if (err.hint) logger.warn(`Hint: ${err.hint}`);
      process.exit(1);
    }
  });

// ── release-all ───────────────────────────────────────────────
program
  .command("release-all")
  .option("--android-only").option("--ios-only").option("--skip-screenshots")
  .description("Release ALL registered apps")
  .action(async (opts) => {
    const { batchRelease } = require("../tools/batch");
    const platforms = opts.iosOnly ? ["ios"] : ["android"];
    await batchRelease({ platforms, skipScreenshots: opts.skipScreenshots });
  });

// ── config ────────────────────────────────────────────────────
const cfg = program.command("config").description("App config management");

cfg.command("validate <app-id>").action((appId) => {
  const { loadAppConfig }  = require("../tools/config");
  const { verifyKeystore } = require("../tools/keystore");
  const logger = require("../tools/logger");
  const fs = require("fs"); const path = require("path");
  try {
    const c = loadAppConfig(appId);
    logger.header(`Config: ${appId}`);
    logger.table([
      ["Package",  c.android?.package || "—"],
      ["Track",    c.android?.track || "—"],
      ["Alias",    c.android?.keystoreAlias || "—"],
      ["iOS",      c.ios ? "configured" : "not configured"],
      ["Privacy",  c.metadata?.privacyPolicyUrl || "—"],
    ]);
    const scriptPath = c.android?.screenshotScript;
    if (!scriptPath || !fs.existsSync(path.resolve(__dirname, "..", scriptPath))) {
      logger.warn(`Screenshot script missing — run: appwhoosh screenshots generate-script ${appId}`);
    }
    verifyKeystore(appId);
  } catch (err) {
    require("../tools/logger").error(err.message);
  }
});

cfg.command("add").description("Interactively add a new app").action(async () => {
  const readline = require("readline");
  const fs = require("fs"); const path = require("path");
  const logger = require("../tools/logger");
  const ROOT = path.resolve(__dirname, "..");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q  = (p) => new Promise(r => rl.question(p, r));

  const appId     = await q("App ID (e.g. my-new-app): ");
  const display   = await q("Display name: ");
  const pkgSuffix = await q("Package suffix (after com.sudarshantechlabs.): ");
  rl.close();

  const appDir = path.join(ROOT, "apps", appId);
  fs.mkdirSync(path.join(appDir, "metadata/android/en-US/changelogs"),     { recursive: true });
  fs.mkdirSync(path.join(appDir, "metadata/android/en-US/phoneScreenshots"),{ recursive: true });
  fs.mkdirSync(path.join(appDir, "metadata/ios/en-US"),                    { recursive: true });

  const c = {
    name: appId, displayName: display,
    android: { package: `com.sudarshantechlabs.${pkgSuffix}`, path: `apps/${appId}/android`, keystoreAlias: pkgSuffix, buildType: "release", flavor: null, screenshotScript: `scripts/screenshots/${appId}-android.sh`, metadataPath: `apps/${appId}/metadata/android`, track: "production" },
    ios: null,
    metadata: { locales: ["en-US"], privacyPolicyUrl: `https://sudarshanchaudhari.github.io/${appId}-privacy-policy/` },
    release: { autoSubmit: false, screenshotsBeforeUpload: true, whatsnew: "Bug fixes and performance improvements." },
  };
  fs.writeFileSync(path.join(appDir, "config.json"), JSON.stringify(c, null, 2));

  const regPath  = path.join(ROOT, "config/registry.json");
  const registry = JSON.parse(fs.readFileSync(regPath, "utf8"));
  if (!registry.apps.find(a => a.id === appId)) {
    registry.apps.push({ id: appId, configPath: `apps/${appId}/config.json`, enabled: true, platforms: ["android"] });
    fs.writeFileSync(regPath, JSON.stringify(registry, null, 2));
  }
  logger.success(`⚡ App added: ${appId}`);
  logger.info(`Next: appwhoosh config validate ${appId}`);
});

// ── metadata ──────────────────────────────────────────────────
const meta = program.command("metadata").description("Metadata management");
meta.command("validate <app-id>").action((appId) => { require("../tools/metadata").printValidationReport(appId); });
meta.command("scaffold <app-id>").action((appId) => { require("../tools/metadata").scaffoldMetadata(appId, "both"); });
meta.command("changelog <app-id> [text]").option("--ai").action(async (appId, text, opts) => {
  const { updateChangelog } = require("../tools/metadata");
  const logger = require("../tools/logger");
  if (opts.ai) {
    const Anthropic = require("@anthropic-ai/sdk");
    const { execSync } = require("child_process");
    const { loadAppConfig } = require("../tools/config");
    const cfg = loadAppConfig(appId);
    let commits = "";
    try { commits = execSync("git log --oneline -10", { cwd: require("path").resolve(__dirname, "..", cfg.android.path), stdio: "pipe" }).toString(); } catch (_) { commits = "Bug fixes"; }
    const msg = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({ model: "claude-sonnet-4-6", max_tokens: 200, messages: [{ role: "user", content: `Write a concise Play Store changelog (max 490 chars) from:\n${commits}\nReturn only the text.` }] });
    text = msg.content[0].text.trim();
    logger.info(`Generated: ${text}`);
  }
  if (!text) { console.error("Provide text or use --ai"); process.exit(1); }
  updateChangelog(appId, text);
});

// ── android ───────────────────────────────────────────────────
const droid = program.command("android").description("Android-specific commands");
const ks    = droid.command("keystore").description("Keystore management");
ks.command("create <app-id>").action((id) => require("../tools/keystore").createKeystore(id));
ks.command("verify <app-id>").action((id) => require("../tools/keystore").verifyKeystore(id));
ks.command("list").action(() => require("../tools/keystore").listKeystores());

// ── version ───────────────────────────────────────────────────
const ver = program.command("version").description("Version management");
ver.command("show <app-id>").action((id) => { const v = require("../tools/version").getCurrentVersion(id); console.log(`${id}: ${v.versionName} (${v.versionCode})`); });
ver.command("bump <app-id> [type]").description("patch (default), minor, major, code-only").action((id, t = "patch") => require("../tools/version").bumpVersion(id, t));
ver.command("table").action(() => require("../tools/version").printVersionTable());

// ── aso ───────────────────────────────────────────────────────
const aso = program.command("aso").description("App Store Optimization");
aso.command("audit <app-id>").action((id) => require("../tools/aso").printASOReport(id));
aso.command("keywords <app-id>").action(async (id) => {
  const kw = await require("../tools/aso").researchKeywords(id);
  require("../tools/logger").header(`Keywords: ${id}`);
  kw.forEach((k, i) => console.log(`  ${i+1}. ${k}`));
});
aso.command("optimize <app-id>").action(async (id) => {
  const { optimizeTitle, optimizeDescription } = require("../tools/aso");
  const { loadAppConfig } = require("../tools/config");
  const logger = require("../tools/logger");
  const fs = require("fs"); const path = require("path");
  const ROOT = path.resolve(__dirname, "..");
  const cfg  = loadAppConfig(id);
  const base = path.resolve(ROOT, cfg.android.metadataPath, "en-US");
  logger.step("Optimizing title...");
  fs.writeFileSync(path.join(base, "title.txt"), await optimizeTitle(id));
  logger.step("Optimizing description...");
  fs.writeFileSync(path.join(base, "full_description.txt"), await optimizeDescription(id));
  logger.success(`⚡ ASO optimization complete: ${id}`);
});

// ── translate ─────────────────────────────────────────────────
const trans = program.command("translate").description("AI metadata translation");
trans.command("app <app-id>").option("--to <locale>", "Target locale", "hi-IN").option("--force").action(async (id, opts) => { await require("../tools/translate").translateMetadata(id, opts.to, "android", opts.force); });
trans.command("all").option("--to <locale>", "Target locale", "hi-IN").option("--force").action(async (opts) => { await require("../tools/translate").translateAllApps(opts.to, "android", opts.force); });

// ── batch ─────────────────────────────────────────────────────
const bat = program.command("batch").description("Batch operations for all apps");
bat.command("release").option("--android-only").option("--skip-screenshots").action(async (opts) => {
  const readline = require("readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Release ALL apps to stores? (y/N) ", async (ans) => {
    rl.close();
    if (ans.toLowerCase() !== "y") { console.log("Cancelled."); return; }
    await require("../tools/batch").batchRelease({ platforms: ["android"], skipScreenshots: opts.skipScreenshots });
  });
});
bat.command("validate").action(() => require("../tools/batch").batchValidate());
bat.command("screenshots").option("--android-only").option("--ios-only").action(async (opts) => {
  await require("../tools/batch").batchScreenshots(opts.iosOnly ? "ios" : "android");
});

program.parse(process.argv);

// ── reviews ───────────────────────────────────────────────────
const rev = program.command("reviews").description("AI-powered review responder");
rev.command("respond <app-id>").option("--rating <n>", "Max star rating to respond to", "3").action(async (id, opts) => {
  const { interactiveResponder } = require("../tools/reviews");
  await interactiveResponder(id, { maxRating: parseInt(opts.rating) });
});
rev.command("draft-all <app-id>").option("--rating <n>", "Max star rating", "3").action(async (id, opts) => {
  const { draftAllReplies } = require("../tools/reviews");
  await draftAllReplies(id, { maxRating: parseInt(opts.rating) });
});

// ── stats ─────────────────────────────────────────────────────
const stats = program.command("stats").description("App analytics");
stats.command("all").action(async () => {
  const { printStatsDashboard } = require("../tools/analytics");
  await printStatsDashboard();
});
stats.command("export").option("--csv").action(async (opts) => {
  const { exportToCSV } = require("../tools/analytics");
  if (opts.csv) await exportToCSV();
});
