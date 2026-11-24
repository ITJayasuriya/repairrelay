# 001 — independent demo authority

The first vertical slice runs without Supabase or login. Its IndexedDB database is
named `repairrelay-demo-v1`; no demo record or command is sent to a server. All
references begin D- and are provisional, never official event ticket numbers.
The only simulated identity is `demo-repairer`. This is not team authorization.

Pure domain transitions validate bounded inputs, require ownership for work and
an explicit outcome for completion. Immutable notes retain handoff intent.
The demo store serializes read/validate/write in one IndexedDB transaction and
journals the command alongside the snapshot. A stale version fails instead of
overwriting another tab. UI acknowledges only committed writes.

This journal is local demo history, not the team delivery outbox. Team work must
implement the specified event-scoped command envelope, dependencies, server
payload-hash idempotency, roles, change cursor and conflict protocol before
reusing any sync behavior. No fake network success or offline team assignment.
