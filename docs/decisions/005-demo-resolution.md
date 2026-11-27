# Explicit simulator conflict resolution

28 November 2026. Applies only to the independent browser demo, not team authority.

A blocked command can have dependent local notes. Reviewing only its immediate
projection hides intent. Review therefore shows the base before the first blocked
command, the entire current local ticket, and the current simulator ticket.

Two explicit choices are supported: use the simulator ticket, or retain local
fields and combine notes by immutable note identity. Choosing simulator content
removes displaced notes from the active ticket but retains their original
commands in history. This is explained beside the actions. Arbitrary field-by-field
editing remains future team conflict work.

A resolution is another journal command containing the reviewed simulator
snapshot, choice and superseded pending command IDs. Local snapshot and journal
append commit in one IndexedDB transaction; original commands are never deleted
or edited. Pending work derives from journal minus acknowledgments and explicit
supersession. Supersession is not a fabricated server acknowledgment.

The local transaction compares the pending IDs and local version. A stale review
cannot absorb unseen local changes. The simulator transaction compares the entire
reviewed server snapshot, then saves the replayed resolution and receipt together.
A changed simulator snapshot requires another review; lost acknowledgment retries
the same command identity. Version advances beyond both local and simulator
versions, so it can skip numbers. Later commands retain dependency order.

Backups without resolution remain version 1. Resolution history exports version 2;
this build reads both and checks superseded identities belong to earlier commands
for the same ticket. Older builds cannot read version 2 or new resolution commands.
Do not roll back to a pre-resolution build against an affected profile. Preserve a
version 2 backup and roll forward with a compatibility fix instead. No IndexedDB
schema change or hosted database mutation is needed for this increment.

## Review and evidence

Ponytail and Thermo-Nuclear review: no additional mutable queue or resolution
side table; canonical projection handles replay; receipt and case write remain
atomic. Reused existing actions layout and conflict columns. Removed repeated
backup scans and duplicate export reads. No files approach 1,000 lines and no new
packages or privileges were added. Resolution logic is confined to demo domain,
storage and practice UI. Whole-project weekly audit remains due on delivery day 7.

Real IndexedDB Playwright coverage includes stale local reviews, simulator change
after selection, lost resolution acknowledgment and competing sync, competing tabs,
both choices, retained dependent notes, version 2 replay/restore, journal-write
rollback and a note queued after resolution. Domain tests include monotonic version
advancement, note union, version compatibility and invalid supersession references.
Local Firefox is not run; required Linux CI must test all three engines before merge.
Chromium axe and mobile/desktop screenshots cover the expanded review. No physical
device, assistive-technology, pilot or performance result is claimed.

Team mode still needs canonical server authorization, payload-hashed idempotency,
commit-consistent cursors/tombstones and real local Postgres races. The scripted
competing device deliberately uses browser-only simulator storage and cannot
substitute for those tests. The January 5 v1 deadline is unchanged.
