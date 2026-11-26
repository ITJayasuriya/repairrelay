# Status

25 November 2026 — Day 1 local demo slice implemented on build/local-alpha.
Not full M1 or v1. Daily target: four substantive commits; five delivered after a genuine CI portability fix.

Delivered: anonymous intake, queue/filter, detail, simulated ownership, handoff
notes, wait/resume, explicit outcome and JSON backup. IndexedDB commits cases
and command journal atomically; reads validate schemas. Stale local writes fail.
Demo never contacts Supabase. No visitor data, attachments or added packages.

Validation on 6156643 plus browser-test working tree: check/build passed,
3 domain tests and 10 Chromium/WebKit tests passed. Real IndexedDB rollback,
retry deduplication, competing local claims, two-tab visibility, storage failure,
refresh, disconnected edits, backup contents, keyboard and axe covered.
Desktop/mobile screenshots inspected. See testing.md and decisions/002-day-one-review.md.
PR #13: initial Linux CI 12/15 passed; Firefox axe crashed and Linux WebKit
exposed a macOS-only Tab assumption. Test portability fixes awaiting CI.
Axe is Chromium-only; workflow/storage tests remain in all three engines.
Corrected Linux CI passed all 15 browser tests. PR #13 merged as 27a7789.
Deployed https://isuru-repairrelay.pages.dev/demo and verified its revision, intake,
simulated claim, disconnected note, refresh persistence, outcome and backup.
Main check, 3 domain tests and build passed. No hosted database was mutated.

Day 1 is completed. Local final checkpoint/status evidence intentionally remains
uncommitted for the next implementation commit; earlier progress/review records
are committed in PR #13. Skip duplicate work today. Source commits: 5bc18b7,
94284f1, 6156643, f93801f, 9acb798; squash integration: 27a7789.
Local Firefox remains unavailable. No device/pilot/performance claims.

Next: simulated dependent outbox and lossless conflict walkthrough, bounded
journal and backup restore; then event/member API contracts and local Supabase
RLS/RPC tests. Independent demo is deliberately separate from team authority.

Remaining v1: organiser event/member management; OAuth/account-switch recovery;
canonical server authorization, atomic tickets/claims, hashed idempotency,
commit-consistent cursor/tombstones; transactional team outbox/dependencies,
push/pull/conflict UI, real-database races/lost responses; PWA caching/update
safety, storage recovery, ORDS version/mapping export, close-event checklist;
accessibility/device/load audits, clean checkout, release/rollback and feedback.

Blockers: organiser/volunteer validation unavailable (issue #4); missing evidence
is documented, not treated as software completion. Existing external PR #12
contains placeholders and is not integrated. Deadline remains 5 January 2027.

26 November — Day 2 in progress on build/demo-recovery. Retained Day 1 final
evidence above. Daily target: four coherent commits. Backup version 1 parsing
now bounds file/record sizes and verifies snapshots against domain-command replay.
Seven domain tests pass in the working tree. Next: atomic empty-store restore,
preview/confirmation and actual IndexedDB/browser recovery coverage.

Day 2 storage increment: backup export validates journal integrity; restore checks
both tables are empty inside the same IndexedDB transaction as bulk import.
Four Chromium/WebKit storage tests passed, including injected journal-write
failure rolling back snapshots, competing imports and original-ID retry after
restore. Initial sandbox localhost denial resolved with authorized execution.
Next: verify UI preview/cancel/import and complete browser regression suite.

Day 2 UI increment: recovery disclosure, file-size gate, validated preview,
cancel and explicit confirmation; existing tickets disable restore. Focus
returns to the disclosure on cancel/success. Full local suite: 16/16 in
Chromium/WebKit, seven domain tests, check and build passed (8cbdb89 plus UI).
Chromium axe preview passed; 360px/1280px screenshots inspected.
Review caught and removed restore limits from the backup export path: existing
large stores must remain exportable. Fixed macOS first-tab expectation for the
new disclosure. Next: publish review/limits and obtain required Linux CI.

Day 2 review recorded in decisions/003-demo-recovery.md; source 44ab653.
Completed acceptance: bounded versioned backup validation, replay consistency,
atomic empty-store import with retry identities, preview/cancel/confirmation,
no replacement and visible errors. Four-commit daily goal is recovery safety;
dependent outbox/conflict walkthrough was not implemented and remains next.
No quota-related delivery time lost. All team/PWA/ORDS/pilot scope above remains.
Next: required Linux CI, merge/deploy verified source; then bounded dependent
outbox and conflict preservation, followed by local Supabase team contracts.
