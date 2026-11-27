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

PR #14 initial Linux CI: 21/24 passed. Recovery screenshot capture used a macOS
temporary path absent on Linux; switched to Playwright testInfo.outputPath.
This real CI fix is a fifth source commit beyond the retained target of four.
Next: rerun affected local journeys and required all-engine Linux CI.

Day 2 completed 2026-11-26T16:44:52.586889+00:00. PR #14 corrected Linux CI 45860908146
passed quality: seven domain tests and 24 browser tests across Chromium, Firefox,
WebKit. Reviewed head 6be4c9a merged with SHA-bound normal squash as b2ca7b2.
Main check (after checkpoint formatting), seven domain tests and build passed.
Deployed once: https://5c4d1f8c.isuru-repairrelay.pages.dev; production
https://isuru-repairrelay.pages.dev/demo serves b2ca7b2. Verified real backup
download, fresh-context preview/restore, focus return, refresh, offline new note
and refresh persistence. Requests only Pages host; mobile/desktop inspected.
Source commits c404598, 8cbdb89, 44ab653, 16d236b, 6be4c9a (target four,
actual five including CI portability repair). No hosted database mutations.
Final checkpoint/status evidence remains locally modified for the next meaningful
commit. Day 2 is complete; dependent outbox/conflicts remain next, not delivered.
No critical credential/CI blocker; external pilot evidence remains missing.

27 November — Day 3: dependent journal-derived demo outbox implemented; separate durable simulator receipts protect lost acknowledgments. New writes capped at 500 pending commands; original journals/backups retained. Nine domain tests and build passed before UI. Next: real IndexedDB failure/race tests, manual sync UI, required CI. Not team sync.

Day 3 verification: check, nine domain tests, build and 24 Chromium/WebKit tests passed. Actual IndexedDB lost acknowledgments, concurrent sync calls, dependent conflicts, unrelated progress and 500-command cap verified. Offline manual simulator sync/refresh/focus passed; Chromium axe conflict review passed. Mobile and desktop screenshots inspected. Review removed duplicate queue state, made counts transactional and preserved larger backup recovery capacity. Resolution editing, scripted competing-device scenario, real Postgres/team auth/PWA/ORDS remain unfinished. Target two source commits retained; core f1c0fd8 plus reviewed UI/tests pending commit. Open PRs #1/#2 contain major action upgrades with old green setup-only checks; compatibility review/current product CI still needed before merge. #3 is red; #12 has no CI and known placeholders, not integrated. No quota lost time. Next: required Linux CI then merge/deploy this bounded demo increment; explicit resolution and team contracts next.

Day 3 merged 2026-11-27T01:46:36.899348+00:00: PR #15 reviewed head f77354e passed required Linux CI 45887384294 (nine domain tests, 36 browser tests Chromium/Firefox/WebKit), then SHA-bound squash merged as b630b2258de541296eaa977b91bff43b6d486b42. Source commits f1c0fd8 and f77354e match target two. Main check, nine domain tests and build passed. Existing live b2ca7b2 synthetic intake verified. Wrangler publish failed fetch/connectivity; authenticated deployment-history read also failed, so no successful new deployment or production verification claimed. Generic Cloudflare API responded, but this did not establish authenticated Pages availability. Checkpoint blocked_other, not completed_day. Next recovery must inspect Pages history before retrying a single b630b22 deployment and its live journey. No quota failure; service/network troubleshooting consumed delivery time, deadline unchanged. No hosted database changes. Final checkpoint/status are intentionally locally modified for next meaningful work; own lock released. Explicit resolution, scripted conflict exercise, local Supabase/team/PWA/ORDS and external pilot evidence remain open.

Day 3 recovery completed 2026-11-27T16:01:06.639794+00:00. Retained target two and source commits f1c0fd8/f77354e; no extra source commit or deployment duplication. Confirmed PR #15 merge SHA b630b22 and unchanged open PRs #1/#2/#3/#12 (no newly ready necessary merge; prior setup-only checks do not validate current product). Existing Cloudflare login works with authorized execution outside network sandbox; history confirmed b630b22 absent before publishing once. Repeated main check, nine domain tests and build passed. Deployment https://45a2bc07.isuru-repairrelay.pages.dev now serves production /demo revision b630b22. Real Chromium production intake/claim/note/refresh/offline manual sync/keyboard focus/offline note/refresh/backup/fresh-context restore/replay passed; only Pages requests. Inspected 360px/1280px screenshots. Prior exact-head Linux CI remains 36/36 all-engine browser coverage; not rerun during recovery. No source changes or new structural review findings; recorded Day 3 review fixes remain applicable. No hosted database writes, quota failure or paid resources. Deployment blocker resolved; delayed delivery recovered within November 27. Final checkpoint/status stay locally modified for next meaningful source commit. Next: explicit conflict resolution/scripted competing device, then local Supabase contracts. Team mode, PWA, ORDS export and pilot evidence remain unfinished; v1 deadline January 5 unchanged.

28 November — Day 4 in progress: explicit lossless simulator resolution. Daily
random target five retained. Resolution appends a command, retains all superseded
journal entries, compares the reviewed simulator snapshot, and advances beyond
both versions. Review now includes dependent notes; choosing simulator content
keeps displaced local intent in history. Version 2 backups preserve resolution
history; version 1 remains readable. No team authority is claimed.
Local check/build and ten domain tests passed; 30 Chromium/WebKit browser tests
passed, including stale local/server reviews, lost resolution acknowledgment,
competing sync/tabs, combine/select-server and version 2 restore. Chromium axe
passed; 360px/1280px screenshots inspected. Review simplified backup validation
using prior command identities and removed duplicate export reads. Next: final
regressions, publish PR and required Linux all-engine CI, then merge/deploy.

Day 4 final local regression: 11 domain tests and 32 Chromium/WebKit tests pass,
including injected resolution journal-write rollback and a subsequent queued note.
Check/build pass. Core commit 387981a; UI/test working tree reviewed. No new
structural blockers. Open PRs #1/#2/#3/#12 unchanged from prior triage; old setup
checks do not validate the current product, so no unrelated merge performed.
