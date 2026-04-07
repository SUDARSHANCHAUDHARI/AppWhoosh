#!/bin/bash
# ──────────────────────────────────────────────────────────────
# AppWhoosh — One-shot setup script
# Run once after cloning / unzipping the project.
# Usage: bash scripts/setup.sh
# ──────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "  ⚡  AppWhoosh — Setup"
echo "  ─────────────────────"
echo "  Ship your apps. Whoosh."
echo ""

# ── Node version check ────────────────────────────────────────
NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "  ✗  Node.js $NODE_MAJOR found — need ≥ 18"
  echo "     Install from https://nodejs.org"
  exit 1
fi
echo "  ✓  Node.js $(node -v)"

# ── npm install ───────────────────────────────────────────────
echo "  →  Installing dependencies..."
npm install --silent
echo "  ✓  npm install complete"

# ── .env setup ───────────────────────────────────────────────
if [ ! -f "$ROOT/.env" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "  ✓  .env created from .env.example"
  echo "  !  Fill in your credentials in .env before releasing"
else
  echo "  ✓  .env already exists"
fi

# ── Create ~/.appwhoosh directories ──────────────────────────
mkdir -p "$HOME/.appwhoosh/logs"
mkdir -p "$HOME/.appwhoosh/credentials"
mkdir -p "$HOME/.appwhoosh/keystores"
echo "  ✓  ~/.appwhoosh/ directories created"

# ── Make scripts executable ───────────────────────────────────
chmod +x "$ROOT/scripts/"*.sh 2>/dev/null || true
chmod +x "$ROOT/scripts/screenshots/"*.sh 2>/dev/null || true
echo "  ✓  Script permissions set"

# ── npm link (global CLI) ─────────────────────────────────────
echo "  →  Linking appwhoosh CLI globally..."
npm link --silent 2>/dev/null || echo "  !  npm link failed — try: sudo npm link"
echo "  ✓  appwhoosh CLI linked"

# ── Check optional tools ──────────────────────────────────────
echo ""
echo "  Optional tools:"
command -v adb        >/dev/null 2>&1 && echo "  ✓  adb"        || echo "  -  adb not found  →  brew install android-platform-tools"
command -v fastlane   >/dev/null 2>&1 && echo "  ✓  fastlane"   || echo "  -  fastlane not found  →  gem install fastlane"
command -v xcodebuild >/dev/null 2>&1 && echo "  ✓  xcodebuild" || echo "  -  xcodebuild not found  →  install Xcode from App Store"

echo ""
echo "  ✓  Setup complete!"
echo ""
echo "  Next steps:"
echo "    1. Fill credentials:  nano .env"
echo "    2. Health check:      appwhoosh doctor"
echo "    3. Add your apps:     appwhoosh config add"
echo "    4. First release:     appwhoosh ask \"list all apps\""
echo ""
