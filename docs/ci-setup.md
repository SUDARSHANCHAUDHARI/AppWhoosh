# CI/CD Setup Guide

## GitHub Secrets required

Go to: your repo → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `GOOGLE_PLAY_JSON_KEY` | Contents of your service-account.json file |
| `APP_STORE_KEY_ID` | App Store Connect → Users → Keys |
| `APP_STORE_ISSUER_ID` | App Store Connect → Users → Keys |
| `APP_STORE_API_KEY` | Contents of your .p8 key file |
| `MATCH_GIT_URL` | SSH URL of your certs repo |
| `MATCH_PASSWORD` | Your fastlane match passphrase |
| `KEYSTORE_BASE_PATH` | Absolute path to keystore folder on runner machine |
| `KEYSTORE_PASSWORD` | Your keystore store password |
| `KEYSTORE_KEY_PASSWORD` | Your keystore key password |
| `TELEGRAM_BOT_TOKEN` | From @BotFather on Telegram |
| `TELEGRAM_CHAT_ID` | Your Telegram chat/channel ID |

## Setting up the self-hosted runner

See `prompts/19-self-hosted-runner.md` for full setup.

Quick summary:
1. GitHub repo → Settings → Actions → Runners → New self-hosted runner
2. Download + configure on your MacBook
3. Run `bash tools/setup-runner.sh` to install as a launchd service
4. Runner will auto-start on login and persist in background

## Triggering a release from GitHub UI

1. Go to: your repo → Actions → "Release App"
2. Click "Run workflow"
3. Fill in: App ID, Platform, Track
4. Click "Run workflow"
5. Watch the logs in real time

## Weekly auto-release schedule

The `batch-release.yml` workflow runs every Monday at 9:00 AM Bangkok time.
It releases all apps to Android production track, skipping screenshots.

To change the schedule, edit the cron in `.github/workflows/batch-release.yml`:
```yaml
- cron: '0 2 * * 1'   # UTC time — 2:00 AM UTC = 9:00 AM Bangkok (UTC+7)
```

## Branch protection rules (recommended)

Go to: repo → Settings → Branches → Add rule for `main`:
- Require status checks: `test`, `lint`
- Require branches to be up to date before merging
- Restrict pushes to main (PRs only)
