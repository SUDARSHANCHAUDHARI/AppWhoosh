# Release Memory: AppWhoosh
_Last updated: 2026-06-04_

## Current Status

AppWhoosh is a CLI release pipeline for Android and iOS apps with app-store deployment commands and a macOS-oriented workflow.

## Release Target

CLI/tool release after safe dry-run validation.

## Success Criteria

- Setup script works.
- Doctor command identifies missing local dependencies.
- Android build/deploy path works in dry-run mode.
- iOS archive path is verified separately.
- Store credentials are handled safely.
- One fixture-app release rehearsal succeeds without real submission.

## Ordered Plan

1. Run setup on a safe environment.
2. Run `appwhoosh doctor`.
3. Add/verify dry-run mode for store submission.
4. Test app config add/validate.
5. Test Android AAB build path on a fixture app.
6. Test iOS archive path if Xcode credentials are ready.
7. Write release runbook and safety notes.

## Risks

- Store submission credentials are sensitive.
- Accidental real submission must be impossible during tests.
- Android/iOS toolchain variance can break setup.

## First Task

Run setup and doctor, then verify dry-run protections.

## Latest Prep Notes

- Updated `.env.example` and credential-rotation docs to use `YOUR_*` placeholders for API keys, Apple/Google paths, match password, keystore values, Telegram values, and local username paths.
- Current release type remains POC/internal release tool until doctor, dry-run protections, fixture AAB flow, and store credential safety are verified.
- Polished README with POC/internal CLI status, technical decisions, setup, verification, known limits, and store-safety blockers.
