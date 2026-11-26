# RepairRelay

A mobile-first repair-event handoff tool in development. Try the independent
[local demo](https://isuru-repairrelay.pages.dev/demo): register a synthetic item,
claim it as the demo repairer, leave notes and record an explicit outcome.

The demo persists cases and its command journal transactionally in this browser.
It needs no cloud account. Download a JSON backup before clearing browser data;
storage can be evicted. Restore a version 1 backup through “Restore a demo
backup” in an empty browser profile, review the counts, then confirm. Restore
never replaces existing tickets. Limits: 5 MiB, 1,000 tickets, 10,000 journal
entries. Keep the original backup file. The backup is not an Open Repair Data
Standard export.
Team mode, service-worker offline loading and sync/conflicts are not shipped yet.
Do not enter visitor personal information. No pilot results are claimed.

## Develop

Node 24 (`.nvmrc`), then `npm ci` and `npm run dev`. No Docker or Supabase
credentials are needed for the demo. For tests install browser binaries with
`npx playwright install chromium firefox webkit`.

Run `npm run check`, `npm test`, `npm run build`, `npm run test:e2e:local`
(Chromium/WebKit on this Mac) or `npm run test:e2e` (all engines in Linux CI).
See [verification](docs/testing.md), [status](docs/STATUS.md),
[implementation](docs/IMPLEMENTATION.md) and [operations](docs/OPERATIONS.md).

MIT licensed. Contributions: read CONTRIBUTING.md and choose an open issue;
please discuss protocol changes first.
