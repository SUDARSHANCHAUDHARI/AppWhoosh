# Architecture Decisions — AppWhoosh Release Tool

## ADR-001: Node.js over Python for the tool layer

**Decision**: Use Node.js for all tool orchestration scripts.

**Reason**: The existing ecosystem (fastlane, ADB, xcodebuild) is invoked via shell.
Node.js `execSync` + Commander.js gives a clean CLI with minimal ceremony.
The Anthropic SDK is first-class in Node.js. No virtual environments needed.

**Trade-off**: Shell spawning is less portable, but this is macOS-only by design.

---

## ADR-002: macOS-only, no Docker

**Decision**: AppWhoosh runs natively on macOS. No containerization.

**Reason**: Xcode and iOS Simulator cannot run in Docker.
ADB requires USB access to physical devices.
macOS Keychain is used for secure credential storage in production.
Docker would add complexity with zero benefit.

---

## ADR-003: Fastlane for store uploads (not direct API)

**Decision**: Use fastlane supply (Android) and fastlane deliver (iOS).

**Reason**: Fastlane handles authentication, retry logic, metadata formatting,
screenshot upload, and API versioning for both stores.
Direct Play Publisher API or App Store Connect API would require 2000+ lines
of custom code to match fastlane's reliability.

**Trade-off**: Ruby + Gemfile dependency. Mitigated by pinning exact gem versions.

---

## ADR-004: Per-app config.json + central registry

**Decision**: Each app has its own `config.json`. A `registry.json` lists all apps.

**Reason**: 20+ apps need different package names, keystore aliases, screenshot flows.
Centralizing everything in one file becomes unmaintainable.
The registry pattern allows enabling/disabling apps without deleting configs.

---

## ADR-005: Claude API with tool_use for the AI agent

**Decision**: Use Claude's tool_use (function calling) for the MCP layer.

**Reason**: Tool use gives Claude structured access to build/deploy functions
without free-form shell execution. The agentic loop pattern allows multi-step
orchestration (build → screenshot → deploy) from a single natural language command.

**Model**: `claude-opus-4-5` for the agent (best reasoning for complex pipelines).

---

## ADR-006: Per-app bash screenshot scripts

**Decision**: Each app has its own `scripts/screenshots/{id}-android.sh`.

**Reason**: Every app has a different UI. Tap coordinates, navigation flows,
and wait times are app-specific. A generic solution would be too fragile.
Bash scripts are simple, editable, and work with ADB directly.

**Trade-off**: 20+ scripts to maintain. Mitigated by template generation (`appwhoosh screenshots generate-script`).

---

## ADR-007: History + version state in ~/.appwhoosh/

**Decision**: Store runtime state (history, versions, stats cache) in `~/.appwhoosh/`.

**Reason**: Keeps the project directory clean and deploy-safe.
`~/.appwhoosh/` persists across project updates and git pulls.
Multiple projects can share the same appwhoosh installation.

---

## ADR-008: SwiftUI menu bar app wraps the CLI

**Decision**: The macOS UI calls the CLI via `Process()`, not a shared library.

**Reason**: Keeps the UI and business logic completely decoupled.
The CLI can be used independently (terminal, CI, scripts).
Updating the Node.js tool layer doesn't require recompiling Swift.

**Trade-off**: IPC via shell is slower than in-process calls. Acceptable for a release tool.
