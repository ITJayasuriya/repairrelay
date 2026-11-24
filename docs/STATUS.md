# Status

25 November 2026 — Day 1 local demo slice implemented on build/local-alpha.
Not full M1 or v1. Daily target: four substantive commits.

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
Merge and deployment pending; see RUN-STATE.json.
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
