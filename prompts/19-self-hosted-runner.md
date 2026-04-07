# PROMPT 19 — Self-Hosted GitHub Actions Runner (macOS)

## Context
The GitHub Actions release workflows require a macOS runner because:
- xcodebuild only runs on macOS
- ADB needs USB access to a real device
- Fastlane match needs Keychain access

GitHub's hosted macOS runners are expensive and limited.
Your MacBook IS the runner.

## Setup steps Claude Code should print for the user

1. Go to: your GitHub repo → Settings → Actions → Runners → New self-hosted runner
2. Select: macOS, x64 (or ARM64 for M-series Mac)
3. Follow the download + configure commands GitHub shows
4. When prompted for runner name: use `sudarshan-macbook`
5. When prompted for labels: use `macos,appwhoosh,self-hosted`

## Create a launchd service so the runner starts on boot

Create `tools/setup-runner.sh`:

```bash
#!/bin/bash
# Run this once to install the GitHub Actions runner as a macOS service
# Must be run from the actions-runner directory

RUNNER_DIR="$HOME/actions-runner"
PLIST_PATH="$HOME/Library/LaunchAgents/com.github.actions.runner.plist"

if [ ! -d "$RUNNER_DIR" ]; then
  echo "Error: $RUNNER_DIR not found. Download the runner first."
  exit 1
fi

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.github.actions.runner</string>
  <key>ProgramArguments</key>
  <array>
    <string>$RUNNER_DIR/run.sh</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$RUNNER_DIR</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$HOME/.appwhoosh/logs/runner.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/.appwhoosh/logs/runner-error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
  </dict>
</dict>
</plist>
EOF

launchctl load "$PLIST_PATH"
echo "Runner installed as launchd service."
echo "Check status: launchctl list | grep github"
echo "View logs: tail -f $HOME/.appwhoosh/logs/runner.log"
```

## Add CLI command: `appwhoosh runner setup`
- Checks if `~/actions-runner/` exists
- Runs the launchd install script above
- Prints status

## Add CLI command: `appwhoosh runner status`
- Runs: `launchctl list | grep github.actions`
- Prints: running / stopped

## Add CLI command: `appwhoosh runner restart`
- `launchctl unload ~/Library/LaunchAgents/com.github.actions.runner.plist`
- `launchctl load ~/Library/LaunchAgents/com.github.actions.runner.plist`

## Done when
- Runner appears as "Idle" in GitHub repo → Settings → Actions → Runners
- `appwhoosh runner status` prints running status
- Release workflow triggers and runs on self-hosted runner successfully
