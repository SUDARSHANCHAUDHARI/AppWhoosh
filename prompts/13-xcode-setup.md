# PROMPT 13 — SwiftUI Menu Bar App: Xcode Setup

## Context
The full SwiftUI menu bar app is in `AppWhooshMenuBar/AppWhooshApp-Full.swift`.
This prompt gets it running in Xcode from scratch.

## Steps Claude Code should follow

1. Read `AppWhooshMenuBar/AppWhooshApp-Full.swift` fully.

2. Create a new Xcode project checklist (print this for the user):
   ```
   In Xcode:
   1. File → New → Project → macOS → App
   2. Product Name: AppWhooshMenuBar
   3. Bundle ID: com.sudarshantechlabs.appwhooshreleasetool
   4. Interface: SwiftUI
   5. Language: Swift
   6. Uncheck: Include Tests (for now)
   7. Save next to appwhoosh-release-tool/ folder
   ```

3. After project is created, update `Info.plist`:
   Add these keys:
   ```xml
   <key>LSUIElement</key>
   <true/>
   <key>NSUserNotificationsUsageDescription</key>
   <string>AppWhoosh notifies you when app releases complete.</string>
   ```

4. Replace the default `ContentView.swift` and `{AppName}App.swift` with
   the contents of `AppWhooshMenuBar/AppWhooshApp-Full.swift`.

5. In Signing & Capabilities:
   - Team: your Apple Developer account
   - Bundle ID: com.sudarshantechlabs.appwhooshreleasetool
   - Add capability: User Notifications

6. Build and run (Cmd+R). The app should appear in the menu bar as a bolt icon.

7. Fix any Swift compilation errors:
   - If `@EnvironmentObject` errors appear, ensure `AppWhooshState.shared` is
     passed via `.environmentObject(AppWhooshState.shared)` in AppDelegate's
     `NSHostingController` init.
   - If `UNUserNotificationCenter` errors appear, add `import UserNotifications`.

8. In Settings panel, set CLI path to:
   `/path/to/appwhoosh-release-tool/cli/index.js`
   Then click "Test CLI Connection" — should show "✓ CLI connected."

9. Test flow:
   - Click bolt icon in menu bar → panel opens
   - Switch to AI tab → type "list all apps" → press Run
   - Log tab should show output from the CLI

## Common issues and fixes

Issue: "No apps" shown even after setting CLI path
Fix: The CLI path must point to `cli/index.js` exactly. Run in Terminal:
`node /your/path/cli/index.js list`
If that works, the app will too.

Issue: Notifications don't appear
Fix: System Settings → Notifications → AppWhooshMenuBar → Allow

Issue: App appears in Dock as well as menu bar
Fix: Verify `LSUIElement = YES` is in Info.plist, not just in code.

Issue: Shell commands can't find `node` or `adb`
Fix: The shell() function sources .zshrc and .zprofile.
If node is installed via nvm, add to .zprofile:
`export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`

## Done when
- App launches menu-bar-only (no Dock icon)
- Bolt icon visible in menu bar
- Panel opens on click
- "Test CLI Connection" returns success
- App list loads from CLI
- Release button triggers CLI and shows progress
