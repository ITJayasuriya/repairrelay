# Demo outbox: journal plus acknowledgments

27 November 2026. Independent demo only; no Supabase/team authorization claims.

The immutable command journal already records each case's dependency order via
baseVersion. A second mutable queue would duplicate that order and complicate
version 1 backup recovery. Instead, pending work is journal minus acknowledged
command IDs. New writes and the queue-cap check share the snapshot/journal
transaction; new writes stop at 500 pending commands. Existing larger journals
and recoveries remain exportable/restorable. Each manual pass handles at most
500 commands sequentially. A conflict blocks only its case's later versions.

A separate IndexedDB simulator stores snapshots and original-command receipts
atomically. Client acknowledgment happens afterward. Losing that acknowledgment
retries the original immutable identity; the receipt prevents a second mutation.
Transactions serialize competing tabs; a production network sender still needs
the planned lease/authentication/timeout protocol and real Postgres idempotency.

Conflict review derives base/local from the retained journal and shows the
current simulator snapshot. It never overwrites either version. Reloading keeps
the queue and original intent; rerunning the simulator reopens review. Resolution
editing is unfinished. Backup exports the complete local journal, including
blocked later notes, but does not include simulator receipts/acknowledgments;
restored backups are deliberately pending for replay.

Thermo-Nuclear self-review: removed a proposed duplicate pending-row model;
kept simulation out of DemoApp, reused command validation/projection and version
ordering, and made pending-count reads transactional after finding a possible
mixed count across concurrent acknowledgment. Retained import capacity instead
of imposing the new-write limit on recovery. No dependency additions. Native
review disclosures use existing ticket-paper tokens, system type, bounded text
measure, wrapping columns and retained keyboard focus. No independent review is
claimed. Explicit resolution, scripted competing-device scenario and team mode
remain the next product work; M1 and v1 are not complete.
