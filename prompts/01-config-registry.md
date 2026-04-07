# PROMPT 01 — App Registry & Config System

## Context
I am building AppWhoosh Release Tool. The config system is the foundation — everything reads from it.
My company is SudarshanTechLabs. I have 20+ Android apps on Google Play.
Package prefix: `com.sudarshantechlabs`
GitHub username: `SUDARSHANCHAUDHARI`
Privacy policy URL pattern: `https://sudarshanchaudhari.github.io/{appname}-privacy-policy/`
Keystore pattern: alias = appname, password = from env, RSA 2048, CN=SudarshanTechLabs, C=TH

## Files to work with
- `config/registry.json` — master app list
- `apps/example-app/config.json` — template config
- `tools/config.js` — config loader

## Your tasks

1. Read `tools/config.js` fully. Then improve it:
   - Add validation: if a required field is missing from config.json, throw a clear error with the field name
   - Add a `getAndroidApps()` function that returns only apps with android config
   - Add a `getIOSApps()` function that returns only apps with ios config
   - Resolve all env variable placeholders in `config/registry.json` defaults (e.g. `${KEYSTORE_PASSWORD}`)

2. Update `apps/example-app/config.json`:
   - Set package to `com.sudarshantechlabs.exampleapp`
   - Set keystoreAlias to `exampleapp`
   - Set privacyPolicyUrl to `https://sudarshanchaudhari.github.io/exampleapp-privacy-policy/`
   - Keep ios section as a template (null values are fine)

3. Add a `appwhoosh config validate <app-id>` CLI command to `cli/index.js` that:
   - Loads the app config
   - Prints each field and whether it is set or missing
   - Warns if keystore file does not exist at the resolved path
   - Warns if screenshot script does not exist

4. Add a `appwhoosh config add` interactive command that:
   - Prompts for: app ID, package name, display name, platforms (android/ios/both)
   - Creates the config.json from a template
   - Creates the metadata folder structure
   - Adds the entry to registry.json
   - Prints what to do next

5. Write a test: `node tools/config.js` should self-test by loading `example-app` and printing its fields.

## Done when
- `appwhoosh config validate example-app` runs and prints field status
- `appwhoosh config add` walks through prompts and creates files
- Config loader throws useful errors for missing fields
