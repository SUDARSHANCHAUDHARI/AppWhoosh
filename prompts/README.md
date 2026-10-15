# AppWhoosh Release Tool — Claude Code Prompts

Use these prompts with Claude Code (VS Code extension or terminal) to build out each layer of the project.

---

## Order to follow

| # | File | What it builds | Start when |
|---|------|----------------|------------|
| 00 | `00-setup.md` | Dependencies, env, CLI sanity check | First thing |
| 01 | `01-config-registry.md` | App config system, registry, validation | After 00 |
| 02 | `02-android-engine.md` | Android build + sign + deploy | After 01 |
| 03 | `03-ios-engine.md` | iOS build + certs + deploy | After 02 (or skip if no iOS apps yet) |
| 04 | `04-screenshots.md` | Screenshot automation (ADB + simctl) | After 02 |
| 05 | `05-ai-agent.md` | Claude API agentic loop, tool use, history | After 01 |
| 06 | `06-macos-menubar.md` | SwiftUI menu bar app | After 05 |
| 07 | `07-metadata.md` | Metadata management + AI changelog | After 01 |
| 08 | `08-batch-scale.md` | Batch ops for 20+ apps | After 02, 07 |
| 09 | `09-error-handling.md` | Logging, preflight checks, resilience | Last (or alongside others) |

---

## How to use with Claude Code

### Option A — VS Code Claude Code extension
1. Open `appwhoosh-release-tool/` as your workspace in VS Code
2. Open Claude Code panel
3. Paste the contents of the prompt file
4. Claude Code will read your project files and implement the tasks

### Option B — Terminal Claude Code
```bash
cd appwhoosh-release-tool/
claude "$(cat ../appwhoosh-prompts/00-setup.md)"
```

### Option C — Copy-paste
Open each `.md` file, copy the full contents, paste into Claude Code chat.

---

## Tips

- Do **one prompt at a time**. Complete it fully before moving to the next.
- After each prompt: run the "Done when" checklist at the bottom.
- If something fails mid-prompt, paste the error back into Claude Code and say "fix this".
- Prompts 02 and 03 require real Android/iOS project files to fully test.
  Use `--dry-run` flags where available to test logic without real builds.

---

## Recommended first session

```
1. Run prompt 00 → get pnpm install working, CLI runs
2. Run prompt 01 → add your real apps to the registry
3. Run prompt 09 → add doctor + logging early (makes debugging easier)
4. Run prompt 05 → get AI agent working
5. Test: appwhoosh ask "what apps do I have?"
```

Then build out the platform engines (02, 03) once the core is solid.
