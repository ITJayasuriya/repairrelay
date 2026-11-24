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
