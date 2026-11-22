# Development setup readiness

Verified 22 November 2026. No scheduled tasks have been created.

## Ready

- Four public GitHub repositories with real-date initial commits, pinned dependencies, contribution/security documentation and the full implementation plans.
- All four main-branch CI runs passed on Linux, including Chromium, Firefox and WebKit setup smoke tests. These validate the foundation only, not unimplemented product behavior.
- Local TypeScript, lint, formatting, production builds, Chromium/WebKit and automated axe checks passed. Local Firefox fails at startup before page load; use `npm run test:e2e:local` on this Mac. CI continues testing all three browsers.
- npm audit reported zero advisories for each installed lockfile on this date. Unused Storybook and PWA build integrations are deferred until secure compatible versions are selected.
- Issues, contribution templates, three milestones, labels, Dependabot, public-repository security scanning, private vulnerability reporting, and main-branch rules are configured. Main requires a PR and passing `quality` check; zero external approvals avoids deadlocking a sole maintainer.
- Shared public delivery board: https://github.com/users/ITJayasuriya/projects/2 — 24 implementation issues linked. This replaces four separate boards with one cross-project delivery view; each repository keeps its own issues/milestones.
- Four Cloudflare Pages setup sites deployed and verified in a browser. These are clearly marked as in development.
- Limited Wrangler OAuth (account/user read, Pages write, background access) is authorized and stored in the Mac keychain. Local deployment works; no Cloudflare credential is committed.
- Colima, Docker CLI/Compose and the local Supabase stack are installed. PostgreSQL accepts connections.
- Supabase Free organisation “Isuru Open Source”, RepairRelay project `jyyxkyeqlajigabqcqoj` (Tokyo), initially empty database.
- Google OAuth project `divine-tempo-515510-f9`; application identity configured, Google provider enabled in Supabase, hosted site URL and four exact callback URLs saved. Basic login remains in testing mode; the owner account is the intended first test identity. Full app login will be tested when its callback route exists.
- Owner reports npm registration, email verification and 2FA complete. npm username/scope: `isurutj` / `@isurutj`. No placeholder package has been published.

## Repositories, live URLs and local folders

| Project      | Repository                                   | Setup site                           | Folder                                                          |
| ------------ | -------------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| ImportDesk   | https://github.com/ITJayasuriya/importdesk   | https://isuru-importdesk.pages.dev   | /Users/isurujayasuriya/Downloads/frontend-projects/importdesk   |
| FormPath     | https://github.com/ITJayasuriya/formpath     | https://isuru-formpath.pages.dev     | /Users/isurujayasuriya/Downloads/frontend-projects/formpath     |
| RepairRelay  | https://github.com/ITJayasuriya/repairrelay  | https://isuru-repairrelay.pages.dev  | /Users/isurujayasuriya/Downloads/frontend-projects/repairrelay  |
| ReleaseProof | https://github.com/ITJayasuriya/releaseproof | https://isuru-releaseproof.pages.dev | /Users/isurujayasuriya/Downloads/frontend-projects/releaseproof |

## When creating the four scheduled tasks

Select the matching project folder above, not the whole Downloads directory. The current app project list contains “Job Search” at Downloads; these four folders still need to be added/selected in the app. Available tools cannot register local projects, and computer control of the Codex app is disallowed. The owner should select them in the app while creating tasks.

Read `AGENTS.md`, `docs/STATUS.md`, `docs/IMPLEMENTATION.md` and `docs/ENGINEERING.md` on every run. Keep one writer per repository, preserve an existing open branch/PR, and update durable status after work. Separate project ports are configured. Use an active-run guard and explicit worktree integration policy when scheduling; stagger runs to avoid resource contention.

Keep the Mac on and the app running. Verify the scheduled environment can use network access, browser processes and (RepairRelay only) Docker under its selected permissions; success in an approved interactive run does not itself grant unattended permissions. Run a first scheduled dry run before committing to six weeks of unattended operation.

## Later release prerequisites, not day-one coding blockers

- GitHub-hosted deployment jobs do not have the Mac keychain credential. Local scheduled runs can deploy with Wrangler. If cloud CI deployment is desired, the owner must provision a narrowly scoped Pages token in GitHub secrets; do not copy an OAuth refresh token from the Mac.
- Hosted Supabase migrations are not authenticated through the CLI. Local database development/tests are ready. Before remote schema deployment, choose project-scoped migration access and complete its owner credential setup. Do not give all coding runs a broad personal admin token by default.
- FormPath/ReleaseProof npm packages and trusted-publisher bindings are configured only once real package names and workflows exist. Proposed names: `@isurutj/formpath-core`, `@isurutj/formpath-react`, `@isurutj/releaseproof`; availability is not reserved or guaranteed. First publication may need an owner action.
- Add actual pilot identities to Google's testing audience before pilot login. Publish/verify the OAuth consent configuration only when the application branding/privacy information is ready. No broader Google scopes are required.
- Supabase application tables, RLS policies, RPCs, actual user flows, unit tests and product releases are implementation work. Account provisioning is not evidence those features are done.
- GitHub CLI's current token lacks Projects API scope. The shared board was created and populated through the authenticated browser. Issues/PRs work through CLI; automatic board administration would require separate authorization or browser use.

## Execution commands

`npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e:local` (Mac), `npm run test:e2e` (all three browsers). Unit tests intentionally have no product cases yet. Add tests with actual domain logic.

Deployment from a checked revision: `npm run deploy -- --project-name isuru-<project> --branch main`. For RepairRelay use `npx supabase start` / `npx supabase stop`; generated `.temp` and `.branches` data are ignored. Never publish local database credentials or reset the hosted database with local-test commands.
