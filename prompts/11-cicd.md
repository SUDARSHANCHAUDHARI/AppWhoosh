# PROMPT 11 — CI/CD with GitHub Actions

## Context
AppWhoosh Release Tool itself needs a CI pipeline so pushes to main don't break the tool.
Also: optional GitHub Actions workflows that trigger AppWhoosh remotely.

## Your tasks

1. Create `.github/workflows/test.yml`:
   - Trigger: push to main, pull_request
   - OS: macos-latest (required for xcodebuild + ADB)
   - Steps:
     - Checkout
     - Setup Node.js 20
     - `pnpm install`
     - `pnpm test`
     - Upload test results as artifact

2. Create `.github/workflows/lint.yml`:
   - Trigger: push, pull_request
   - Run: `pnpm exec eslint tools/ mcp/ cli/ --ext .js`
   - Fail PR if any lint errors

3. Create `.eslintrc.json`:
   - Rules: no-unused-vars, no-console (warn), prefer-const, eqeqeq
   - Ignore: `node_modules/`, `tests/fixtures/`

4. Create `.github/workflows/release-app.yml`:
   - Trigger: `workflow_dispatch` (manual trigger from GitHub UI)
   - Inputs:
     - `app_id` (string, required)
     - `platform` (choice: android / ios / both)
     - `skip_screenshots` (boolean, default false)
   - Steps:
     - Checkout
     - Setup Node
     - Install deps
     - Run: `node cli/index.js release ${{ inputs.app_id }} --${{ inputs.platform }}-only`
   - Secrets required: all env vars from .env.example
   - Note: This workflow needs a self-hosted macOS runner for real builds

5. Create `.github/workflows/release-all.yml`:
   - Trigger: schedule (`cron: '0 2 * * 1'` — every Monday 2am)
   - Also: `workflow_dispatch` for manual trigger
   - Runs: `node cli/index.js release-all --android-only --skip-screenshots`
   - Posts result summary as GitHub Actions step summary

6. Create `docs/ci-setup.md`:
   - How to set up GitHub Secrets for each env var
   - How to set up a self-hosted macOS runner
   - How to trigger a release from GitHub UI

## Done when
- `test.yml` runs `pnpm test` on push
- `release-app.yml` appears in GitHub Actions "Run workflow" dropdown
- ESLint config is in place and `pnpm exec eslint tools/` runs clean
