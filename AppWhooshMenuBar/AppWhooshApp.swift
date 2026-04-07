// AppWhooshApp.swift — macOS Menu Bar App
// AppWhoosh ⚡ — Ship your apps. Whoosh.
// SudarshanTechLabs · Bangkok, Thailand
// macOS 13+, SwiftUI
//
// Info.plist required:
//   LSUIElement = YES
//   NSUserNotificationsUsageDescription = "AppWhoosh notifies you when releases complete."
//   CFBundleIdentifier = com.sudarshantechlabs.appwhoosh

import SwiftUI
import AppKit
import UserNotifications

// ─────────────────────────────────────────────────────────────
// MARK: - App Entry
// ─────────────────────────────────────────────────────────────

@main
struct AppWhooshApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    var body: some Scene {
        Settings { SettingsView().environmentObject(AppWhooshState.shared) }
    }
}

// ─────────────────────────────────────────────────────────────
// MARK: - App Delegate
// ─────────────────────────────────────────────────────────────

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var popover = NSPopover()

    func applicationDidFinishLaunching(_ notification: Notification) {
        requestNotificationPermission()
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        updateIcon(.idle)
        statusItem?.button?.action = #selector(togglePopover)
        statusItem?.button?.target = self

        popover.contentSize    = NSSize(width: 380, height: 560)
        popover.behavior       = .transient
        popover.animates       = true
        popover.contentViewController = NSHostingController(
            rootView: AppWhooshPanel().environmentObject(AppWhooshState.shared)
        )
    }

    @objc func togglePopover() {
        guard let button = statusItem?.button else { return }
        if popover.isShown { popover.performClose(nil) }
        else { popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY) }
    }

    func updateIcon(_ state: WhooshIconState) {
        guard let button = statusItem?.button else { return }
        DispatchQueue.main.async {
            switch state {
            case .idle:
                button.image = NSImage(systemSymbolName: "bolt.fill", accessibilityDescription: "AppWhoosh")
                button.image?.isTemplate = true
                button.contentTintColor  = nil
            case .running:
                button.image = NSImage(systemSymbolName: "bolt.circle.fill", accessibilityDescription: "Running")
                button.image?.isTemplate = false
                button.contentTintColor  = .systemYellow
            case .success:
                button.image = NSImage(systemSymbolName: "bolt.circle.fill", accessibilityDescription: "Success")
                button.image?.isTemplate = false
                button.contentTintColor  = .systemGreen
                DispatchQueue.main.asyncAfter(deadline: .now() + 5) { self.updateIcon(.idle) }
            case .error:
                button.image = NSImage(systemSymbolName: "bolt.circle.fill", accessibilityDescription: "Error")
                button.image?.isTemplate = false
                button.contentTintColor  = .systemRed
                DispatchQueue.main.asyncAfter(deadline: .now() + 8) { self.updateIcon(.idle) }
            }
        }
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }
}

enum WhooshIconState { case idle, running, success, error }

// ─────────────────────────────────────────────────────────────
// MARK: - Shared State
// ─────────────────────────────────────────────────────────────

class AppWhooshState: ObservableObject {
    static let shared = AppWhooshState()

    @Published var apps: [AppEntry]      = []
    @Published var isRunning: Bool       = false
    @Published var runningAppId: String? = nil
    @Published var currentStep: WhooshStep = .idle
    @Published var log: String           = ""
    @Published var lastError: String?    = nil

    var cliPath: String {
        get { UserDefaults.standard.string(forKey: "appwhoosh.cli.path") ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: "appwhoosh.cli.path") }
    }
    var defaultPlatform: String {
        get { UserDefaults.standard.string(forKey: "appwhoosh.platform") ?? "android" }
        set { UserDefaults.standard.set(newValue, forKey: "appwhoosh.platform") }
    }
    var confirmBeforeRelease: Bool {
        get { UserDefaults.standard.bool(forKey: "appwhoosh.confirm") }
        set { UserDefaults.standard.set(newValue, forKey: "appwhoosh.confirm") }
    }
    var skipScreenshots: Bool {
        get { UserDefaults.standard.bool(forKey: "appwhoosh.skipshots") }
        set { UserDefaults.standard.set(newValue, forKey: "appwhoosh.skipshots") }
    }

    func appendLog(_ text: String) {
        DispatchQueue.main.async { self.log += "[\(Self.ts())] \(text)\n" }
    }
    func clearLog() { log = "" }
    private static func ts() -> String {
        let f = DateFormatter(); f.dateFormat = "HH:mm:ss"; return f.string(from: Date())
    }
}

struct AppEntry: Identifiable, Hashable {
    let id: String
    var lastRelease: String?
    var platforms: [String]
}

enum WhooshStep: String {
    case idle = "", building = "Building", screenshots = "Screenshots",
         deploying = "Deploying", done = "Done ⚡", failed = "Failed"
}

// ─────────────────────────────────────────────────────────────
// MARK: - Main Panel
// ─────────────────────────────────────────────────────────────

struct AppWhooshPanel: View {
    @EnvironmentObject var state: AppWhooshState
    @StateObject private var vm = AppWhooshViewModel()
    @State private var showSettings = false
    @State private var aiCommand    = ""
    @State private var selectedTab: WhooshTab = .apps

    var body: some View {
        VStack(spacing: 0) {
            headerView
            Divider()
            tabBar
            Divider()
            switch selectedTab {
            case .apps: appsTab
            case .ai:   aiTab
            case .log:  logTab
            }
            Divider()
            footerView
        }
        .frame(width: 380)
        .onAppear { vm.loadApps() }
        .sheet(isPresented: $showSettings) { SettingsView().environmentObject(state) }
    }

    // Header
    var headerView: some View {
        HStack(spacing: 8) {
            Image(systemName: "bolt.fill").foregroundColor(.yellow).font(.system(size: 14, weight: .bold))
            Text("AppWhoosh").font(.system(size: 14, weight: .semibold))
            Text("SudarshanTechLabs").font(.system(size: 11)).foregroundColor(.secondary)
            Spacer()
            Button { showSettings = true } label: { Image(systemName: "gearshape").font(.system(size: 13)) }
                .buttonStyle(.plain).foregroundColor(.secondary)
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
    }

    // Tab bar
    var tabBar: some View {
        HStack(spacing: 0) {
            ForEach(WhooshTab.allCases, id: \.self) { tab in
                Button { selectedTab = tab } label: {
                    HStack(spacing: 4) {
                        Image(systemName: tab.icon).font(.system(size: 11))
                        Text(tab.label).font(.system(size: 12))
                    }
                    .padding(.vertical, 7).frame(maxWidth: .infinity)
                    .background(selectedTab == tab ? Color(NSColor.selectedControlColor).opacity(0.3) : .clear)
                    .foregroundColor(selectedTab == tab ? .primary : .secondary)
                }
                .buttonStyle(.plain)
                if tab != WhooshTab.allCases.last { Divider().frame(height: 20) }
            }
        }
    }

    // Apps tab
    var appsTab: some View {
        VStack(spacing: 0) {
            if state.apps.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "tray").font(.system(size: 28)).foregroundColor(.secondary)
                    Text("No apps registered").font(.system(size: 13)).foregroundColor(.secondary)
                    Text("Set CLI path in Settings → appwhoosh config add")
                        .font(.system(size: 11)).foregroundColor(.tertiary).multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity).padding(40)
            } else {
                ScrollView {
                    LazyVStack(spacing: 1) {
                        ForEach(state.apps) { app in AppRowView(app: app, vm: vm) }
                    }.padding(.vertical, 4)
                }.frame(maxHeight: 340)
            }
            if state.isRunning { Divider(); WhooshProgressBar() }
        }
    }

    // AI tab
    var aiTab: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                TextField("e.g. release all apps on android", text: $aiCommand)
                    .textFieldStyle(.roundedBorder).font(.system(size: 13))
                    .onSubmit { vm.runAI(aiCommand); aiCommand = "" }
                Button("Run") { vm.runAI(aiCommand); aiCommand = "" }
                    .disabled(state.isRunning || aiCommand.trimmingCharacters(in: .whitespaces).isEmpty)
            }.padding(12)
            Divider()
            Text("Quick commands").font(.system(size: 11)).foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 12).padding(.top, 8)
            VStack(spacing: 4) {
                ForEach(["list all apps", "release all apps on android", "take screenshots for all apps", "validate all metadata", "show dashboard"], id: \.self) { cmd in
                    Button { vm.runAI(cmd) } label: {
                        Text(cmd).font(.system(size: 12, design: .monospaced))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 10).padding(.vertical, 5)
                            .background(Color(NSColor.controlBackgroundColor)).cornerRadius(6)
                    }.buttonStyle(.plain).disabled(state.isRunning)
                }
            }.padding(.horizontal, 12).padding(.bottom, 12)
            Spacer()
        }.frame(maxHeight: 360)
    }

    // Log tab
    var logTab: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Output log").font(.system(size: 11)).foregroundColor(.secondary)
                Spacer()
                Button("Copy") { NSPasteboard.general.clearContents(); NSPasteboard.general.setString(state.log, forType: .string) }.controlSize(.mini).disabled(state.log.isEmpty)
                Button("Clear") { state.clearLog() }.controlSize(.mini).disabled(state.log.isEmpty)
            }.padding(.horizontal, 12).padding(.top, 8).padding(.bottom, 4)
            Divider()
            WhooshLogView()
        }.frame(maxHeight: 360)
    }

    // Footer
    var footerView: some View {
        HStack {
            Button("Quit AppWhoosh") { NSApp.terminate(nil) }
                .foregroundColor(.red).controlSize(.small).buttonStyle(.plain).font(.system(size: 11))
            Spacer()
            if state.isRunning {
                HStack(spacing: 6) {
                    ProgressView().scaleEffect(0.55).frame(width: 14, height: 14)
                    Text(state.currentStep.rawValue + "...").font(.system(size: 11)).foregroundColor(.secondary)
                }
            }
        }.padding(.horizontal, 14).padding(.vertical, 8)
    }
}

enum WhooshTab: CaseIterable {
    case apps, ai, log
    var label: String { switch self { case .apps: "Apps"; case .ai: "AI"; case .log: "Log" } }
    var icon:  String { switch self { case .apps: "square.stack"; case .ai: "bolt.fill"; case .log: "text.alignleft" } }
}

// ─────────────────────────────────────────────────────────────
// MARK: - App Row
// ─────────────────────────────────────────────────────────────

struct AppRowView: View {
    let app: AppEntry
    @ObservedObject var vm: AppWhooshViewModel
    @EnvironmentObject var state: AppWhooshState
    @State private var showConfirm = false
    @State private var pendingCmd: String? = nil

    var isRunning: Bool { state.runningAppId == app.id }

    var body: some View {
        HStack(spacing: 10) {
            Circle().fill(isRunning ? Color.yellow : Color.green).frame(width: 7, height: 7)
            VStack(alignment: .leading, spacing: 2) {
                Text(app.id).font(.system(size: 13, weight: .medium))
                HStack(spacing: 6) {
                    ForEach(app.platforms, id: \.self) { p in Text(p == "android" ? "🤖" : "🍎").font(.system(size: 10)) }
                    if let last = app.lastRelease { Text(last).font(.system(size: 11)).foregroundColor(.secondary) }
                }
            }
            Spacer()
            Menu {
                Button("Release Android") { confirm("release \(app.id) --android-only") }
                Button("Release iOS")     { confirm("release \(app.id) --ios-only") }
                Button("Release Both")    { confirm("release \(app.id)") }
                Divider()
                Button("Screenshots")     { vm.runCLI("screenshots \(app.id) --android-only") }
                Button("Validate Metadata") { vm.runCLI("metadata validate \(app.id)") }
                Button("ASO Audit")       { vm.runCLI("aso audit \(app.id)") }
                Divider()
                Button("View on Play Store") {
                    NSWorkspace.shared.open(URL(string: "https://play.google.com/store/apps/details?id=com.sudarshantechlabs.\(app.id.replacingOccurrences(of: "-", with: ""))")!)
                }
            } label: { Image(systemName: "ellipsis.circle").font(.system(size: 14)).foregroundColor(.secondary) }
            .menuStyle(.borderlessButton).frame(width: 24).disabled(state.isRunning)

            Button("Release") { confirm("release \(app.id) --\(state.defaultPlatform)-only") }
                .controlSize(.small).disabled(state.isRunning)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(isRunning ? Color.yellow.opacity(0.06) : .clear)
        .alert("Confirm Release", isPresented: $showConfirm) {
            Button("Release ⚡", role: .destructive) { if let c = pendingCmd { vm.runCLI(c) } }
            Button("Cancel", role: .cancel) {}
        } message: { Text("Release \(app.id) to the store?") }
    }

    func confirm(_ cmd: String) {
        if state.confirmBeforeRelease { pendingCmd = cmd; showConfirm = true }
        else { vm.runCLI(cmd) }
    }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Progress Bar + Log
// ─────────────────────────────────────────────────────────────

struct WhooshProgressBar: View {
    @EnvironmentObject var state: AppWhooshState
    let steps: [WhooshStep] = [.building, .screenshots, .deploying, .done]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(steps, id: \.self) { step in
                HStack(spacing: 4) {
                    stepIcon(step)
                    Text(step.rawValue).font(.system(size: 11)).foregroundColor(stepColor(step))
                }.frame(maxWidth: .infinity)
                if step != .done { Rectangle().fill(Color.secondary.opacity(0.2)).frame(width: 1, height: 16) }
            }
        }.padding(.horizontal, 12).padding(.vertical, 8).background(Color(NSColor.controlBackgroundColor))
    }

    func stepIcon(_ step: WhooshStep) -> some View {
        let cur = state.currentStep
        if step == cur { return Image(systemName: "circle.fill").foregroundColor(.yellow).font(.system(size: 8)) }
        if stepIdx(step) < stepIdx(cur) { return Image(systemName: "checkmark.circle.fill").foregroundColor(.green).font(.system(size: 8)) }
        return Image(systemName: "circle").foregroundColor(.secondary).font(.system(size: 8))
    }
    func stepColor(_ step: WhooshStep) -> Color {
        let cur = state.currentStep
        if step == cur { return .primary }
        if stepIdx(step) < stepIdx(cur) { return .green }
        return .secondary
    }
    func stepIdx(_ s: WhooshStep) -> Int { steps.firstIndex(of: s) ?? 0 }
}

struct WhooshLogView: View {
    @EnvironmentObject var state: AppWhooshState
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                Text(state.log.isEmpty ? "No output yet." : state.log)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(state.log.isEmpty ? .secondary : .primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10).id("end")
            }
            .background(Color(NSColor.textBackgroundColor)).frame(maxHeight: 300)
            .onChange(of: state.log) { _ in withAnimation { proxy.scrollTo("end", anchor: .bottom) } }
        }
    }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Settings
// ─────────────────────────────────────────────────────────────

struct SettingsView: View {
    @EnvironmentObject var state: AppWhooshState
    @State private var testResult: String? = nil
    @State private var isTesting = false
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack { Image(systemName: "bolt.fill").foregroundColor(.yellow); Text("AppWhoosh Settings").font(.title2).fontWeight(.semibold) }

            GroupBox("CLI Path") {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        TextField("Path to appwhoosh/cli/index.js", text: Binding(get: { state.cliPath }, set: { state.cliPath = $0 })).textFieldStyle(.roundedBorder)
                        Button("Browse") {
                            let p = NSOpenPanel(); p.canChooseFiles = true
                            if p.runModal() == .OK { state.cliPath = p.url?.path ?? "" }
                        }.controlSize(.small)
                    }
                    Text("Absolute path to cli/index.js in your AppWhoosh folder.").font(.system(size: 11)).foregroundColor(.secondary)
                }.padding(8)
            }

            GroupBox("Release Options") {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Default platform")
                        Spacer()
                        Picker("", selection: Binding(get: { state.defaultPlatform }, set: { state.defaultPlatform = $0 })) {
                            Text("Android").tag("android"); Text("iOS").tag("ios"); Text("Both").tag("both")
                        }.pickerStyle(.menu).frame(width: 100)
                    }
                    Toggle("Confirm before release", isOn: Binding(get: { state.confirmBeforeRelease }, set: { state.confirmBeforeRelease = $0 }))
                    Toggle("Skip screenshots",       isOn: Binding(get: { state.skipScreenshots },      set: { state.skipScreenshots = $0 }))
                }.padding(8)
            }

            GroupBox("Connection Test") {
                VStack(alignment: .leading, spacing: 8) {
                    Button(isTesting ? "Testing..." : "Test CLI Connection") { testCLI() }.disabled(isTesting || state.cliPath.isEmpty)
                    if let r = testResult { Text(r).font(.system(size: 11, design: .monospaced)).foregroundColor(r.contains("✓") ? .green : .red) }
                }.padding(8)
            }

            HStack { Spacer(); Button("Done") { dismiss() }.keyboardShortcut(.defaultAction) }
        }
        .padding(24).frame(width: 480)
    }

    func testCLI() {
        isTesting = true; testResult = nil
        DispatchQueue.global().async {
            let out = shell("node \(state.cliPath) list 2>&1")
            DispatchQueue.main.async {
                isTesting = false
                testResult = out.contains("•") ? "✓ CLI connected. Apps found." : "✗ Error: \(out.prefix(120))"
            }
        }
    }

    func shell(_ cmd: String) -> String {
        let t = Process(); let p = Pipe()
        t.standardOutput = p; t.standardError = p
        t.launchPath = "/bin/zsh"; t.arguments = ["-c", cmd]
        t.launch()
        return String(data: p.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
    }
}

// ─────────────────────────────────────────────────────────────
// MARK: - ViewModel
// ─────────────────────────────────────────────────────────────

@MainActor
class AppWhooshViewModel: ObservableObject {
    private let state = AppWhooshState.shared

    func loadApps() {
        guard !state.cliPath.isEmpty else { return }
        Task {
            let out  = shell("node \(state.cliPath) list 2>&1")
            let ids  = out.components(separatedBy: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { $0.hasPrefix("•") }.map { $0.replacingOccurrences(of: "• ", with: "") }
            state.apps = ids.map { AppEntry(id: $0, lastRelease: lastRelease($0), platforms: ["android"]) }
        }
    }

    func runCLI(_ args: String) {
        guard !state.isRunning else { return }
        state.isRunning = true; state.lastError = nil; state.clearLog()
        state.runningAppId = args.split(separator: " ").dropFirst().first.map(String.init)
        updateIcon(.running)
        if args.contains("build") { state.currentStep = .building }
        else if args.contains("screenshots") { state.currentStep = .screenshots }
        else if args.contains("release") || args.contains("deploy") { state.currentStep = .building }

        Task {
            state.appendLog("$ appwhoosh \(args)")
            let result = await Task.detached(priority: .userInitiated) { self.shell("node \(self.state.cliPath) \(args) 2>&1") }.value
            state.appendLog(result)
            let ok = !result.lowercased().contains("error") && !result.lowercased().contains("failed")
            state.currentStep = ok ? .done : .failed
            state.isRunning = false; state.runningAppId = nil
            updateIcon(ok ? .success : .error)
            if !ok { state.lastError = "Release failed" }
            sendNotification(ok ? "⚡ Release Complete" : "AppWhoosh Error", ok ? "appwhoosh \(args) finished." : "appwhoosh \(args) failed.")
            loadApps()
        }
    }

    func runAI(_ message: String) {
        guard !message.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        runCLI("ask \"\(message)\"")
    }

    private func lastRelease(_ appId: String) -> String? {
        let p = NSHomeDirectory() + "/.appwhoosh/history.json"
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: p)),
              let json = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]],
              let last = json.filter({ ($0["app_id"] as? String) == appId && ($0["success"] as? Bool) == true }).last,
              let ts   = last["timestamp"] as? String,
              let date = ISO8601DateFormatter().date(from: ts)
        else { return nil }
        let f = RelativeDateTimeFormatter(); f.unitsStyle = .abbreviated
        return f.localizedString(for: date, relativeTo: Date())
    }

    private func updateIcon(_ s: WhooshIconState) {
        DispatchQueue.main.async { (NSApp.delegate as? AppDelegate)?.updateIcon(s) }
    }

    private func sendNotification(_ title: String, _ body: String) {
        let c = UNMutableNotificationContent(); c.title = title; c.body = body; c.sound = .default
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: UUID().uuidString, content: c, trigger: nil))
    }

    func shell(_ cmd: String) -> String {
        let t = Process(); let p = Pipe()
        t.standardOutput = p; t.standardError = p
        t.launchPath = "/bin/zsh"; t.arguments = ["-c", ". ~/.zshrc 2>/dev/null; . ~/.zprofile 2>/dev/null; \(cmd)"]
        t.launch()
        return String(data: p.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
    }
}
