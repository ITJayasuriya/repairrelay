# Free services, tools and scheduled-run readiness

Prepared 22 November 2026 for ImportDesk, FormPath, RepairRelay and ReleaseProof.

This is the setup inventory and checklist. No accounts, repositories, deployments, credentials or scheduled tasks were created by preparing this document. Account access remains to be verified. It supplements [the engineering plan](ENGINEERING.md), which remains the quality and contribution standard.

## 1. Account list: five accounts, plus the existing Codex account

| Service                                                                          | Required for                                                              | Setup to complete                                                                                                                                               | When needed                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [GitHub Free](https://github.com/)                                               | All four source repositories, issues, PRs, CI, releases and collaboration | Use ITJayasuriya; create four independent repositories; grant the connected GitHub app access; authenticate local Git/gh; configure CI and repository settings  | Before the first scheduled build                          |
| [Cloudflare Free](https://dash.cloudflare.com/sign-up)                           | Static demos and documentation                                            | Create four Pages projects in Direct Upload mode; record account ID, project names and provider URLs; configure a Pages deployment token in GitHub              | Before first automatic deployment; code can start earlier |
| [Supabase Free](https://supabase.com/dashboard)                                  | RepairRelay team mode: Postgres, authentication and authorization         | Create one free project; select a suitable region; record project reference/URL/publishable key; enable schema policies; configure local development separately | Before RepairRelay hosted integration                     |
| [Google Cloud Console](https://console.cloud.google.com/) / Google Auth Platform | RepairRelay “Continue with Google”                                        | Create an OAuth-only project, consent configuration and web client; configure the Supabase callback; add pilot identities as required                           | Before real team sign-in testing                          |
| [npm Free](https://www.npmjs.com/signup)                                         | Public FormPath packages and ReleaseProof CLI                             | Verify email, enable 2FA, choose a user scope; register packages when real code is ready; configure trusted publishing                                          | Account can be ready now; publication comes later         |

Use one account per provider, not one per application. Google is only an identity-provider configuration: no paid compute, Maps API or Google database is part of this design. Do not enable a billing-backed service as part of OAuth setup. npm is not needed to install public packages; an account is needed when publishing your own.

Public npm packages are available to free accounts. Trusted publishing uses short-lived CI identity instead of a permanent npm publishing token; initial package/account setup still needs the owner's involvement. [npm public packages](https://docs.npmjs.com/about-public-packages/), [trusted publishing](https://docs.npmjs.com/trusted-publishers/)

## 2. Per-project service map

| Project      | Source/CI | Live demo                                                 | Stored user data                                                      | Sign-in                 | Public package          |
| ------------ | --------- | --------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- | ----------------------- |
| ImportDesk   | GitHub    | Cloudflare Pages                                          | Memory; opt-in IndexedDB on user's device                             | None                    | None in v1              |
| FormPath     | GitHub    | Cloudflare Pages for docs, Storybook and browser examples | Example drafts on device; consuming applications own real submissions | None in public demo     | Core and React packages |
| RepairRelay  | GitHub    | Cloudflare Pages                                          | IndexedDB plus Supabase for team mode                                 | Supabase + Google OAuth | None in v1              |
| ReleaseProof | GitHub    | Cloudflare Pages                                          | Imported packets/annotations on device; generated CI artifacts        | None                    | CLI                     |

FormPath's dynamic Next.js integration example runs locally and in CI to prove SSR/hydration. Static Pages hosting does not run a Next.js application server. No Vercel subscription or separate live SSR host is required for the agreed baseline.

## 3. Free allowances and cost controls

- Cloudflare Pages lists 500 managed builds/month, one simultaneous managed build, a 20-minute timeout, 20,000 files/site and 25 MiB/file. Our recommended deployment builds in GitHub Actions and uploads the result through Wrangler. Keep an internal limit of 200 deployment attempts/month across all four apps, including previews, to control churn; that is our operating budget, not a provider deployment quota. Four daily deployments would be about 120 per 30 days. Use the free `pages.dev` addresses. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- Supabase Free currently allows two active projects and lists 500 MB database size, 50,000 monthly active users, 5 GB egress and 1 GB file storage. We need one project and no uploaded media in v1. Free projects can pause after one week of inactivity; RepairRelay's local demo must still work. Recheck the dashboard before launch. [Supabase pricing](https://supabase.com/pricing)
- Standard GitHub-hosted runners are free for public repositories. Larger runners, artifact storage and private-repository usage have separate constraints. Use standard Linux runners, seven-day failure-artifact retention and bounded test fixtures. Do not equate free compute with unlimited storage. [GitHub runner documentation](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- The applications need no paid AI API, transactional email service, paid domain, managed Redis or external analytics account. Start with built-in browser diagnostics, CI artifacts and user-controlled error reports.
- Codex is the execution layer, not part of the zero-cost third-party hosting promise. Runs use the available plan/credits and permissions. Four daily runs over six weeks means 168 scheduled attempts, not 168 guaranteed completed development sessions. Check account usage capacity before activation.

No paid upgrade is automatic. If a free limit blocks work, preserve a useful local demo and report the specific limit.

## 4. Local tools and observed machine state

Read-only inspection of the current environment on 22 November 2026 found:

| Tool                | Observed state     | Decision                                                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Git                 | Installed, 2.55.0  | Use for branches, commits, worktrees, tags and rollback                                          |
| GitHub CLI (`gh`)   | Installed, 2.101.0 | Verify account and repository write access separately; installation is not authentication        |
| Node.js             | Installed, 24.21.0 | Keep supported Node 24 LTS for initial compatibility; pin the selected patch in each repo and CI |
| npm                 | Installed, 11.19.0 | Use npm and workspaces; no extra package manager needed                                          |
| Homebrew            | Installed          | Use for missing macOS development tools during setup                                             |
| Docker CLI          | Not found on PATH  | Install for local Supabase                                                                       |
| Colima              | Not found on PATH  | Install as the free local container runtime on this Mac                                          |
| Supabase CLI        | Not found on PATH  | Add a pinned project-local dev dependency or supported local installation                        |
| Wrangler            | Not found on PATH  | Add a pinned dev dependency for deployment; global installation unnecessary                      |
| Playwright browsers | Not inspected      | Install Chromium, Firefox and WebKit for the project test versions; run a smoke test             |

Node 24 is still listed as LTS. There is no need to change a working runtime simply because a newer major exists. Pin exact library/runtime versions during scaffolding after compatibility checks. [Node release status](https://nodejs.org/en/about/previous-releases)

Choose Colima + Docker CLI, with the Compose plugin if required by the local setup, instead of depending on Docker Desktop licensing. Colima's Docker-compatible runtime runs the Supabase local stack. Confirm the selected Docker context and a healthy container before database tests. Only RepairRelay needs this runtime; other projects must keep working if it is stopped. Document start/stop instructions and actual RAM/disk needs after the first successful launch. [Colima](https://github.com/abiosoft/colima), [Supabase local development](https://supabase.com/docs/guides/local-development/cli/getting-started)

Native VoiceOver on macOS is available for manual accessibility review. NVDA is a useful later check on a Windows machine; it is not a blocker to configuring scheduled runs. Do not claim an NVDA check unless it actually happened.

## 5. Project dependencies: no additional accounts

These are the intended directly selected tools. Install only what the current implementation needs, through the repository lockfile. Revalidate licenses/version compatibility when scaffolding; transitive dependencies are recorded in that lockfile, not installed manually.

| Area                     | Tools                                                                                         | Used by                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| UI/runtime               | React, React DOM, TypeScript                                                                  | All                                                                    |
| Build and routing        | Vite; React Router for multi-route browser apps; Next.js for the FormPath integration example | As applicable                                                          |
| Styling and interaction  | CSS Modules, CSS custom properties; React Aria Components for difficult accessible controls   | All, only necessary primitives                                         |
| Runtime input validation | Zod                                                                                           | All                                                                    |
| Local persistence        | Dexie over native IndexedDB                                                                   | ImportDesk, RepairRelay, ReleaseProof; optional FormPath draft adapter |
| CSV                      | Papa Parse                                                                                    | ImportDesk                                                             |
| Forms                    | React Hook Form                                                                               | FormPath                                                               |
| Server state             | TanStack Query, Supabase JavaScript client                                                    | RepairRelay                                                            |
| Offline app shell        | vite-plugin-pwa and Workbox                                                                   | RepairRelay                                                            |
| Screenshot comparison    | pngjs + pixelmatch; JPEG decoding adapter such as jpeg-js only for supported JPEG imports     | ReleaseProof                                                           |
| Component documentation  | Storybook                                                                                     | FormPath; selected complex components elsewhere if useful              |
| Unit/component tests     | Vitest, Testing Library, user-event, jsdom, Vitest V8 coverage provider                       | All                                                                    |
| Browser/visual tests     | Playwright and its browser distributions                                                      | All                                                                    |
| Accessibility checks     | axe-core / @axe-core/playwright; manual keyboard and VoiceOver checks                         | All                                                                    |
| Performance checks       | Lighthouse, Lighthouse CI where useful, React Profiler, browser performance tools             | All; report adapters in ReleaseProof                                   |
| Network fixtures         | Mock Service Worker where UI tests need controlled API behavior                               | RepairRelay/FormPath adapter tests                                     |
| Database tests           | PostgreSQL and pgTAP through the local Supabase stack                                         | RepairRelay                                                            |
| Code hygiene             | ESLint, typescript-eslint, React hook rules, Prettier, npm audit                              | All                                                                    |
| Releases                 | Changesets, npm pack, npm trusted publishing                                                  | FormPath and ReleaseProof                                              |
| Deployment               | Wrangler, GitHub Actions                                                                      | All                                                                    |
| Badges                   | GitHub's workflow badges and Shields.io                                                       | Repository READMEs                                                     |

Web Workers, browser storage, service workers, Web Crypto and standard Node APIs are built into the platform; they are not third-party cloud subscriptions. Use built-in APIs for simple hashing, CLI argument parsing and file handling.

[React Aria](https://react-aria.adobe.com/), [Vite PWA](https://vite-pwa-org.netlify.app/), [pixelmatch](https://github.com/mapbox/pixelmatch) and [Shields.io](https://shields.io/) provide the documented capabilities selected above. Badges will link to actual passing workflows, package versions and licenses; no invented score or achievement is required.

## 6. GitHub setup and unattended delivery

Proposed repository names are `importdesk`, `formpath`, `repairrelay` and `releaseproof` under ITJayasuriya; check availability first. Use four dedicated project folders, not the entire Downloads directory as a Git repository. Add each repository as its own Codex project when configuring standalone runs. Copy its implementation plan plus the shared standards into versioned `docs/` so worktrees and later runs can read them.

For each repository, configure:

- Public visibility when the scaffold has been checked for credentials and licensing; MIT license for original code, contribution guide, security reporting and code of conduct.
- Issues, issue forms, labels, milestones, a Project board, PR template and real maintainer ownership.
- CI on PRs, a final required quality check, branch rules blocking force-push/deletion, and resolved review conversations. Do not require an independent approval before another maintainer exists.
- Dependabot, available public-repository CodeQL/secret scanning/push protection and private vulnerability reporting.
- Deployment from a trusted checked revision only; release notes and tags after acceptance tests.
- Short failure-artifact retention, pinned actions and no secrets for untrusted fork tests.

Authenticate the connected GitHub app for these exact repositories and verify the local CLI can clone, create a branch and push to a setup test branch. Connector access and CLI credentials are separate capabilities; both must be checked. The test should not expose authentication tokens or change existing repositories.

Prefer GitHub Actions to hold deployment/publishing credentials. Scheduled coding runs then need ordinary repository access; they do not need every cloud credential in their environment. Initial provider configuration and credential entry are owner actions. Once configured, an authorized trusted CI workflow can perform routine deployment.

## 7. Cloudflare Pages setup

Create four Direct Upload projects, one per repository, through the account dashboard or the supported CLI. Choose this mode deliberately: it is not interchangeable with Git integration on an existing project. We build once after checks in GitHub Actions and deploy the checked output. [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)

Create a custom API token with Account → Cloudflare Pages → Edit, restricted to the intended account. This is an account-level Pages capability, not a claim that the token is limited to one Pages project. Put it only in the chosen repositories' deployment environments. Add the account ID and exact project name as configuration. Use free provider URLs and record them in `docs/operations.md`. No domain purchase is needed. [Cloudflare CI deployment guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

Acceptance: a harmless initial build deploys after passing checks; its public URL loads the expected revision; the prior version can be restored; a fork PR cannot access the token. Configure SPA fallback/security headers and FormPath documentation base paths. Use a secret-free fixture mode for any contribution preview.

## 8. Supabase and Google OAuth setup

Use one RepairRelay Supabase project. Keep everyday development, migrations testing, race tests and RLS tests on the local disposable stack. Remote deployment applies versioned migrations through a dedicated trusted job; test it first on an empty local database. Never run reset/seed commands intended for tests against the hosted project.

Configure Google as described in the [Supabase provider guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google): web OAuth client, appropriate consent audience, basic identity scopes and exact Supabase callback URL copied from the dashboard. Store the Google client ID/secret in Supabase's provider configuration. Separately allow the application's actual local/hosted return URLs in Supabase Auth. These are two distinct redirect configurations.

Record consent/test-user status. Provider setup or publication checks may need a manual step; unattended runs cannot complete a human consent or account-verification process. Local fixtures and simulated sessions keep development unblocked while this is pending.

Acceptance: an allowed test user signs in; a user without event membership cannot read event data; two test users in different events remain isolated; a normal app client cannot bypass mutation rules. Database policies must be in place before any real pilot data is entered. Public demo mode uses synthetic local data and does not require sign-in.

## 9. Credential/configuration inventory

The names below are proposed configuration keys, not actual values. Enter secrets directly into the provider dashboard or GitHub secrets; do not paste them into this document, a chat, an issue or Git history. A `.env.example` contains names/placeholders only.

| Item                                                                                    | Secret?                     | Location/use                                                                                         |
| --------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Git/gh authentication                                                                   | Yes                         | OS credential storage/approved CLI login; not committed or printed                                   |
| `CLOUDFLARE_API_TOKEN`                                                                  | Yes                         | Each relevant GitHub deployment environment                                                          |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT`                                     | No                          | GitHub environment variables/build configuration                                                     |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`                                    | Public client configuration | RepairRelay build/local environment; RLS is the protection                                           |
| `SUPABASE_PROJECT_REF`                                                                  | No                          | RepairRelay migration workflow configuration                                                         |
| `SUPABASE_ACCESS_TOKEN` / database credential required by selected CLI migration method | Yes, administrative         | RepairRelay trusted migration environment only; scope/expiry verified at setup, never client-bundled |
| Google OAuth client secret                                                              | Yes                         | Supabase Google provider settings only                                                               |
| Google OAuth client ID                                                                  | Identifier                  | Supabase Google provider settings                                                                    |
| npm trusted publisher                                                                   | No static token             | npm package settings bound to repository/workflow/environment; CI gets a short-lived identity        |
| `GITHUB_TOKEN` in Actions                                                               | Temporary credential        | Supplied by GitHub; least permissions per job; no manual copy required                               |

No Supabase service-role/secret API key is required in the browser. Local database test credentials are disposable and distinct from hosted ones. Only variables deliberately intended for public exposure can use a client-bundled prefix such as `VITE_`.

For npm, register names under the actual account scope once chosen, such as a scoped FormPath core/react pair and ReleaseProof CLI. Test package contents with `npm pack` before publishing. Configure trusted publisher policy only for actual packages/workflows; do not reserve empty placeholder releases just to make a badge appear.

## 10. Readiness for four daily scheduled runs

The available scheduling tool supports local project jobs. Official guidance says the computer must be on and the app running for scheduled work using local files. Test the intended worktree/local mode before activation, including dependency setup and permissions. [Scheduled-task documentation](https://learn.chatgpt.com/docs/automations?surface=app)

For each project, prepare `AGENTS.md` with project-specific commands and limits, `docs/STATUS.md` with current milestone/next task/open branch, and a milestone backlog. A run must inspect existing changes and open PRs before starting; otherwise 42 separate runs could create 42 incompatible branches. End each run with the tested revision, what changed, remaining work and any blocked action in durable project files.

Use one active writer per repository. Worktrees isolate unfinished work but require an explicit integration policy and cleanup. Stagger four jobs to avoid competing browser/database processes; a schedule offset alone is not a lock, so add an active-run check. Allocate distinct app/test ports or discover available ports. Stop test servers on exit. RepairRelay owns the single local Supabase stack and must not reset a database another run is using.

Record Asia/Colombo as the scheduling timezone, start/end dates and a six-week stop condition when the schedules are created. Do not activate them until the following gates pass:

- [ ] Four repository folders are registered as the intended local projects.
- [ ] GitHub authentication and new-repository access work without repeated login prompts.
- [ ] A fresh checkout/worktree installs locked dependencies and runs a production build.
- [ ] Playwright launches successfully under the scheduled execution environment.
- [ ] RepairRelay's local database starts and its isolated tests pass.
- [ ] Provider setup is complete for the first hosted milestone, or the run has an explicit local-only fallback.
- [ ] One manual dry run per project writes progress and resumes correctly on a second run.
- [ ] Required file/network permissions have been tested; scheduled runs cannot assume interactive approvals will be available.
- [ ] The source-push, merge, deployment and package-release policy is recorded so jobs know which actions are authorized.
- [ ] A missed run, quota error, failed test or overlapping run preserves progress and reports the blockage.
- [ ] The six-week milestone plan identifies what must ship and what is deferred; account setup alone cannot guarantee the full original scope in that period.

The ready-to-code gate does not require npm publication or Google production approval on day one. Local fixtures and package-consumer tests can run while those release prerequisites are completed. Human user trials, screen-reader review and release decisions still need scheduled attention from the owner; they are not satisfied by creating a recurring job.

## 11. Recommended setup order

1. Confirm GitHub access and create the four clean repository/project folders with their plans.
2. Install Colima/Docker tooling and project-local CLI/testing dependencies; verify local runs.
3. Create Cloudflare account/projects and verify one controlled deployment per app.
4. Create the one Supabase project, secure schema and migration path.
5. Configure Google sign-in and two non-sensitive pilot identities for authorization tests.
6. Prepare npm account/2FA; configure package publishing once packages exist.
7. Run the four manual smoke/resume tests, review usage capacity and then create the four schedules.

Accounts requiring login, 2FA, recovery codes or consent should be completed by the account owner. Repository scaffolding, configuration files, tests and automation prompts can be prepared without asking for those secrets in chat. This document is ready for the setup phase; it does not mark those steps as completed.
