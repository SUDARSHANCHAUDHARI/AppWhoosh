#!/bin/bash
# AppWhoosh — Install GitHub Actions self-hosted runner as macOS launchd service
# Run once from your ~/actions-runner/ directory after downloading the runner
# Usage: bash scripts/setup-runner.sh
set -e

RUNNER_DIR="$HOME/actions-runner"
PLIST_PATH="$HOME/Library/LaunchAgents/com.github.actions.runner.plist"
LOG_DIR="$HOME/.appwhoosh/logs"

mkdir -p "$LOG_DIR"

if [ ! -d "$RUNNER_DIR" ]; then
  echo "Error: $RUNNER_DIR not found."
  echo "Download the runner first from your GitHub repo:"
  echo "  Settings → Actions → Runners → New self-hosted runner"
  exit 1
fi

echo "[AppWhoosh] Installing GitHub Actions runner as launchd service..."

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
  <string>$LOG_DIR/runner.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/runner-error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:/opt/homebrew/sbin</string>
  </dict>
</dict>
</plist>
EOF

launchctl load "$PLIST_PATH"

echo ""
echo "  ✓ Runner installed as launchd service"
echo "  ✓ Auto-starts on login"
echo ""
echo "  Check status:  launchctl list | grep github"
echo "  View logs:     tail -f $LOG_DIR/runner.log"
echo "  Stop runner:   launchctl unload $PLIST_PATH"
echo "  Start runner:  launchctl load $PLIST_PATH"
