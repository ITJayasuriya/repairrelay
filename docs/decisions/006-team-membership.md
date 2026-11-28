# Team authority begins at the database

29 November 2026. This migration is local-tested backend groundwork, not team UI.
No hosted migration or authentication journey has been shipped yet.

## Permission contract

| Operation                                  | Owner           | Coordinator | Repairer    | Nonmember/anonymous |
| ------------------------------------------ | --------------- | ----------- | ----------- | ------------------- |
| Read event/roster                          | Yes             | Yes         | Yes         | No                  |
| Create own event                           | Signed in       | Signed in   | Signed in   | Anonymous: no       |
| Add/change/remove delegated member         | Yes, open event | No          | No          | No                  |
| Change owner/direct table writes           | No              | No          | No          | No                  |
| Intake/assign/close case (future RPC)      | Yes             | Yes         | No          | No                  |
| Claim unassigned case (future RPC)         | Yes             | Yes         | Online only | No                  |
| Note/update own assigned case (future RPC) | Yes             | Yes         | Yes         | No                  |

The last three rows are a contract for the next migration, not implemented gates.
Closed events reject membership changes; future case mutations must also reject
closed events under the event row lock. Owner/coordinator can manage any case.
Owner transfer and account deletion are not exposed in this increment.

## Direct model

`events.owner_id` is the single ownership record. `event_members` holds only
coordinator/repairer delegation; the owner is derived when resolving authority.
This removes an owner-membership row that could disagree with the event.
The private, stable role lookup bypasses recursive RLS, uses `auth.uid()` and
returns only the caller's role. It is not exposed in the REST API schemas.
Table reads use RLS; authenticated/anonymous table writes have no grant.
RPCs use an empty search path, qualified objects, explicit checks and revoked
public/anonymous execution, following [Supabase function guidance](https://supabase.com/docs/guides/database/functions).
The frontend never supplies an actor or an authoritative role.

`create_event` accepts a persisted client UUID, bounded title/date and recognised
PostgreSQL timezone. Exact retries return the event; changed payload/actor using
the same UUID fails. Membership management is online, separate from the future
repair command outbox: read `membership_version`, send it with the desired role
(null removes), then use the returned version. Matching desired state is a no-op;
a differing state with a stale version returns SQLSTATE 40001 for explicit
refresh/review. A role-only guard was rejected because remove/re-add can return
to the same role. The event row serializes these writes. Membership versions are
separate from the future repair-data cursor; clients refetch membership on
foreground entry/sync rather than treating it as repair-data changes.

## Review and evidence

Ponytail and Thermo-Nuclear review: no duplicate owner role, no generic permission
framework, no client permission engine and no dynamic SQL in production RPCs.
Local tests caught the reserved CURRENT_ROLE variable name before publication.
SQL regressions exercise actual database roles/JWT identity, two unrelated events,
no-auth denial, direct-write denial, role escalation, malformed arguments,
unknown accounts, stale retries including remove/re-add, revocation and closure.
A separate test uses two simultaneous PostgreSQL connections against the local
container; exactly one competing membership change succeeds. Synthetic fixtures
roll back or are removed. No hosted reset/data or credentials are used.

Next: hashed repair-command idempotency, atomic ticket allocation/claim, immutable
notes, consistent event cursor and tombstones; then real browser auth/push/pull,
reconnection/lost response tests. These are not proved by membership tests.
