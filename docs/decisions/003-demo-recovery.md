# Demo recovery: empty-store import and replay verification

26 November 2026. This extends the independent demo, not team synchronization.

Restore accepts the existing version 1 JSON export. It validates bounded schemas,
rejects duplicate identities, replays commands in case-version order and compares
every snapshot. Journal exports are ordered by UUID, not chronological time.
Timestamps are never used as ordering authority. The preview shows counts/time;
no imported text becomes markup. This consistency check is not authentication or
proof that a file is trustworthy: a person can construct a consistent synthetic
history. Do not import visitor data.

Restore is restricted to an empty store. The emptiness check and both table
writes occur under one IndexedDB write transaction. Another writer either wins
first (and restore fails) or sees the completed import. A journal-write failure
rolls back all imported snapshots. Original command IDs are retained so retries
do not duplicate acknowledged mutations. No clear/replace control is introduced.

Limits: 5 MiB UTF-8 JSON, 1,000 cases, 10,000 commands, existing 500-character
fault and 2,000-character note limits. Unsupported versions are rejected. Export
remains available beyond restore limits; retain the original file for manual
recovery tooling if it exceeds this UI's envelope. No restore merge, hosted
import, migration, encryption or tamper-authenticity claim. Demo stores are not
account partitions. Browser storage can still be evicted.

## Thermo-Nuclear self-review

Reviewed domain parser, store transaction, UI, callers and browser coverage.
No dependency or lockfile changes. New modules are 63 and 119 lines; no giant
file, generic import framework or parallel projection added. Existing domain
transition rules are the replay authority. Restore reuses the canonical Dexie
store and write lock; it has no separate persistence layer.

Resolved findings:

- Removed import limits from export: existing large stores must stay exportable.
- Returned focus to the disclosure after preview buttons disappear.
- Updated the macOS WebKit keyboard assertion for the new disclosure; Linux
  retains the actual skip-link tab-order assertion.

Local verification: check, seven domain cases, build and 16 Chromium/WebKit
browser cases passed. Real IndexedDB verifies abort rollback, concurrent imports
and original-command retries. Actual UI verifies preview/cancel/restore,
refresh, subsequent notes, malformed/inconsistent/oversized inputs and occupied
store disabling. Chromium axe and desktop/mobile screenshot review passed.
Concurrent-import test uses two operations in one page; existing two-tab tests
verify case visibility. No claim of a new separate-tab import race test.
Linux Firefox verification is delegated to required CI, not local execution.
