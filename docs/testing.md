# Product verification

25 November 2026, macOS / Node 24, working tree based on 6156643.

- `npm run check`, `npm test` (3 domain cases), `npm run build`: passed.
- `npm run test:e2e:local`: 10 passed across Chromium and WebKit.
- Storage tests use real browser IndexedDB: atomic snapshot/journal rollback,
  retry identity and mismatched payload rejection, competing local claims.
- Journey: intake, simulated claim, note, refresh, disconnect network, wait for
  part, close with explicit outcome and download/inspect JSON backup.
- Two tabs observe commits. Injected quota failure retains form text and does
  not acknowledge a save. Empty and whitespace-error states are covered.
- Chromium axe: empty and completed views have no automated violations. Keyboard skip
  target is checked. macOS WebKit's default Tab skips links: its first control
  is category; focus/Enter separately verifies the skip link target.
- Desktop (1365px) and mobile (360px) screenshots manually inspected; no
  horizontal overflow. System 16px body/inputs, descending headings, tabular
  ticket references and visible focus. No truncated repair text.

Local Firefox remains unrun due to documented startup failure. Required Linux
CI runs all three engines. No VoiceOver, NVDA, real-phone, 400% zoom or field
performance result is claimed. No benchmark or pilot result is fabricated.

The network-disconnected journey verifies local edits in an already loaded
app; offline cold loading is not implemented. Tests do not validate team RPCs,
RLS, server claim races, lost server responses or a team sync cursor.

Initial Linux CI: 12/15 passed. Firefox completed workflow assertions then
crashed in axe scanning; Linux WebKit rejected a macOS-specific Tab expectation.
Axe now runs in Chromium only (as scoped by ENGINEERING.md); all workflow and
storage tests still run in all three engines. The Tab exception is macOS-only.
Firefox/WebKit automated axe coverage is not claimed.

## Day 2 recovery verification

26 November 2026, macOS / Node 24, 44ab653 source.
Seven domain tests and 16 Chromium/WebKit browser tests passed; check/build
passed on the corresponding working tree. Initial local run was 15/16 because
the new disclosure changed the macOS first Tab target; the corrected suite
passed. Chromium axe checked the restore preview. Desktop 1280px and mobile
360px screenshots were inspected. Restore failure/rollback uses real IndexedDB
and an injected quota error, not a mocked persistence adapter.
The macOS first control is now the recovery disclosure; skip target is still
verified explicitly. Linux first Tab remains the skip link.
See decisions/003-demo-recovery.md for limits and exact coverage boundaries.

PR #14 initial Linux run 45860455443: 21/24, three recovery walkthroughs
stopped at a macOS-only screenshot path. Use Playwright testInfo.outputPath
for portable, test-isolated evidence. The corrected four affected local tests
and check passed before pushing the fix; required Linux rerun remains the gate.

## Demo outbox (27 November)

`tests/demo-sync.spec.ts` exercises real IndexedDB in each configured browser:
commit with lost acknowledgment, identity-preserving retry, concurrent sync
calls, per-case dependent blocking, progress for unrelated tickets, the 500
pending-write boundary, offline manual simulation, refresh and focus. Conflict
review has Chromium axe coverage. These are simulator tests; they do not prove
Postgres races, network reconnection or canonical server authorization.
Version 1 backups intentionally omit simulator state and replay as pending.

## Conflict resolution regression

`tests/demo-resolution.spec.ts` exercises the browser-only practice scenario,
full dependent local review, select-server/combine choices, stale reviews,
lost resolution acknowledgment, two-tab protection, atomic save rollback,
post-resolution dependency ordering and replay/restore of version 2 backups.
Run `npm run test:e2e:local` on this Mac; Linux CI includes Firefox as well.
The simulator is not evidence for real Postgres authorization or race behavior.
Backups with resolution history need this build or later; see decision 005.
