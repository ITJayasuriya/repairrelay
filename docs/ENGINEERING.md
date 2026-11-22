# Shared engineering, free infrastructure and public contribution plan

Applies to all four implementation plans. Research date: 22 November 2026. Proposed commands and file paths below are contracts to implement in the future repositories, not files already present.

## 1. Engineering principles and stack policy

Use the tool capabilities that improve the product, delivery or contributor experience. Enabling every available feature would add cost, attack surface and maintenance without demonstrating better judgment. Keep a small capabilities ledger in each repository: feature, user benefit, enabled/deferred, reason.

- TypeScript with strict mode, explicit boundary schemas and no unchecked JSON casts. Enable `noUncheckedIndexedAccess`; introduce stricter flags while establishing the initial model, not halfway through delivery.
- React and semantic HTML; CSS Modules plus CSS custom properties for design tokens. Native controls first; use React Aria Components for difficult combobox/dialog behavior where native controls are insufficient. Avoid writing a new accessibility primitive library.
- Vite for browser applications; FormPath additionally includes a Next.js consumer to verify server rendering/hydration. Do not add SSR to a private file-processing tool without a user need.
- npm workspaces where a real reusable package and consuming app exist; otherwise one application package. One lockfile per repository. Select current stable compatible versions and an actively supported Node LTS at project kickoff, record exact versions and pin the CI/runtime. Do not copy historical package versions merely to simulate age.
- Vitest and Testing Library for domain/component tests; Playwright for browser journeys and screenshot regression; axe-core for automated checks; manual assistive-technology testing for behavior automation cannot assess.
- Zod or an equivalently established runtime schema library at imported data and network boundaries. Keep domain rules pure; UI components should not own parsing or authorization rules.
- Prefer narrow modules around product capabilities over generic `utils`, service registries or a universal repository abstraction. Extraction requires a concrete second use. No microservices, Kubernetes or custom authentication in baseline scope.

## 2. Repository shape and local setup

Each repository must contain `README.md`, `LICENSE` (MIT recommended for original code), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/architecture.md`, `docs/decisions/`, `docs/testing.md`, `docs/accessibility.md`, `docs/performance.md`, `docs/operations.md`, and `docs/research/`. Preserve licenses and notices for dependencies, icons, fonts and copied code. MIT licensing does not grant rights to third-party data or trademarks.

Keep `.env.example` with public placeholders, `.gitignore`, a runtime version file and a clean lockfile. A fresh contributor must run:

```sh
npm ci
npm run dev
npm run check
npm run test
npm run build
npm run test:e2e
```

Document Playwright browser installation separately. `check` means lint, formatting and type checks. Tests use deterministic fixtures and no paid service. RepairRelay adds a documented local Supabase start/reset/stop path; its UI sample mode must work without Docker. Pin tooling through project scripts, not a contributor's globally installed versions.

## 3. Git and GitHub features to use

| Feature                     | Concrete use                                                                                                              | When                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Issues and issue forms      | Bug reproduction, feature problem statement, accessibility report; ask for sanitized fixtures                             | Repository launch                                                          |
| Labels                      | `bug`, `accessibility`, `performance`, `docs`, `good first issue`, `help wanted`, `needs reproduction`, `breaking change` | Launch                                                                     |
| Milestones                  | Alpha, beta, v1; each milestone has exit criteria from the project plan                                                   | Launch                                                                     |
| GitHub Project              | Views by status and milestone; fields: priority, size, area, acceptance criteria                                          | Launch; one board per repo                                                 |
| Draft PRs and linked issues | Explain user problem, approach, screenshots, test evidence and limitations                                                | Every nontrivial change                                                    |
| Branch ruleset              | Require PR and passing CI, resolve review conversations, block force-push/deletion on main                                | After first working CI                                                     |
| Review policy               | Contributor PRs reviewed by maintainer; solo maintainer uses self-check and green CI                                      | Initially; require one independent approval once another maintainer exists |
| CODEOWNERS                  | Real maintainers for package/API, migrations and workflows                                                                | When owners actually exist; no fictitious reviewers                        |
| Discussions                 | Q&A and design proposals; move reproducible defects to Issues                                                             | Beta                                                                       |
| Releases and tags           | Real-date SemVer releases, migration notes, checksums for downloadable artifacts                                          | Alpha onward                                                               |
| Actions                     | Quality checks, browser tests, build artifacts, security analysis, approved deployment                                    | First vertical slice                                                       |
| Dependabot                  | Weekly grouped dependency updates, security alerts; manual review of breaking upgrades                                    | Launch                                                                     |
| CodeQL and secret scanning  | Enable supported free public-repo checks and push protection; test setup                                                  | Launch                                                                     |
| Security advisories         | Private reporting path for vulnerabilities; document response target                                                      | Before public release                                                      |
| Wiki                        | Leave off; keep versioned docs beside code                                                                                | Deliberate choice                                                          |
| Packages/npm                | Publish only the FormPath packages and ReleaseProof CLI once APIs stabilize                                               | Beta/v1                                                                    |
| Badges                      | Live CI, published version where relevant, license, linked accessibility report                                           | Once the linked evidence exists                                            |

Use short-lived branches and small coherent commits. Squash merge application work by default; preserve explanatory PR history. Use worktrees for concurrent fixes when needed, `git bisect` to locate a regression, and `git revert` for a safe published-code rollback. Tag release commits and protect release tags. Signed commits are useful when configured, but not a gate that prevents first-time contributions. Do not turn on a required-approval rule that deadlocks a sole maintainer.

### Open-source contribution contract

Document prerequisites, the first ten-minute task, directory ownership, test commands, API stability policy and how to propose a feature. Each starter issue must include a reproduction/fixture, expected behavior, affected files, acceptance test and approximate size. Maintain six genuinely independent starter tasks per project, listed in its plan. Public discussion and design notes must be understandable without access to this chat.

Target acknowledgment within seven days; describe it as a maintainer target, not a support SLA. Triage weekly. Respect contributor attribution and credit reused work. Require tests for behavior changes, and a migration note for breaking APIs. AI-assisted contributions are welcome when the author can explain the code, verify it and preserve license provenance. Review generated code with the same standards as hand-written code. Do not upload real user files to AI services as part of debugging.

## 4. CI/CD and fork security

Create `.github/workflows/ci.yml` on `pull_request` and pushes to main. Give it `contents: read` by default; pin external actions to reviewed commit SHAs and update them through Dependabot. Cache downloaded packages by lockfile; do not rely on cached `node_modules`. Cancel superseded runs on the same PR and set explicit timeouts.

Jobs: (1) check/unit tests, (2) production build and package consumer smoke test if applicable, (3) Chromium critical journeys and axe, (4) browser smoke matrix for Firefox/WebKit, (5) deterministic visual diffs. Full browser/large dataset tests can run on main and scheduled weekly if PR feedback becomes too slow. Publish traces/screenshots only on failure, sanitized and with seven-day retention. Keep a final always-running aggregate required check so path filters cannot leave a PR blocked indefinitely.

Untrusted fork PRs get no deployment or publishing secrets. Never execute fork code with privileged `pull_request_target` or an unsafe `workflow_run` handoff. Preview an external contribution only after review, from trusted code in a separate secret-free demo environment; never attach a production database to a fork preview. Use GitHub-hosted ephemeral runners, not a personal machine runner for public contributions. Validate artifacts before privileged consumption. See references T3–T6 in RESEARCH.md.

Deploy only a checked commit from main or a release tag. Keep build output and SHA together. A smoke test opens the deployed app, runs the sample journey and checks the revision marker. Rollback restores the previous tested artifact; browser storage migrations must remain readable across the rollback window. Ship additive database migrations before removing fields; test restore before destructive changes.

For npm packages, use trusted publishing with OIDC and provenance where supported, from protected release workflows on GitHub-hosted runners. Initial package registration may require a maintainer setup step. Keep publish permissions out of ordinary PR jobs. Changesets records package change intent; publish a preview tag before stable. See T7.

## 5. Zero-cost baseline and limits

| Resource                    | Allocation                                                                                           | Limits/operational consequence                                                                                                                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Pages Free       | Four static demos/docs using provider subdomains                                                     | Documentation lists 500 managed builds/month, one concurrent managed build, 20-minute build timeout, 20,000 files/site and 25 MiB/file. Use GitHub Actions + Direct Upload and an internal budget of 200 deployment attempts/month across the four projects; see SETUP.md |
| Browser IndexedDB           | ImportDesk sessions, RepairRelay queue, ReleaseProof imported packets; FormPath opt-in draft adapter | No hosted DB cost; data can be evicted or cleared. Provide export and honest persistence messaging                                                                                                                                                                        |
| Supabase Free               | One project for RepairRelay collaboration only; keep second free slot available                      | Published allowance includes 500 MB DB/project, 1 GB file storage and 5 GB egress; up to two active free projects, with inactivity pausing. Verify dashboard allowances before launch                                                                                     |
| GitHub public repos/Actions | Source, issues, standard-runner CI, static reports/releases                                          | Standard hosted runners are free for public repos; artifact storage, larger runners and other features have separate constraints. Cap retention and avoid large fixtures in Git                                                                                           |
| npm public packages         | FormPath and optionally ReleaseProof CLI                                                             | Check names and current publishing requirements before registration; no paid private registry                                                                                                                                                                             |
| Local tooling               | Supabase local stack, browser devtools, Lighthouse, axe, Playwright                                  | No hosted subscription; local disk/RAM requirements documented                                                                                                                                                                                                            |

Service limits are a dated planning snapshot, not a guarantee. Review monthly during maintenance. Stop or degrade gracefully before a quota is exhausted; do not automatically upgrade to paid resources. No keep-alive scheme to evade inactivity rules. The RepairRelay public sample remains independent of Supabase availability. Its pilot accepts only bounded non-sensitive data and provides manual export. Production service guarantees are outside the free demo promise.

## 6. Quality, accessibility and measurement

All targets in the plans are proposed gates. Record actual hardware, browser, revision, dataset, methodology, sample count and results. Keep raw evidence with a short interpretation. A lab Lighthouse result is not field INP or proof of passing real-user Core Web Vitals. Capture field metrics only with consent, sufficient traffic and data minimization; otherwise label them unavailable.

Use WCAG 2.2 AA as the evaluation target. Test keyboard-only operation, visible focus, labels, error relationships, text contrast, 200%/400% zoom, reduced motion and forced colors. Prefer 44px touch controls for usability; WCAG 2.2 AA's target-size criterion is 24 CSS px with exceptions, not a universal 44px AA rule. Test VoiceOver/Safari and NVDA/Firefox where equipment is available; document an untested combination explicitly. Automated axe passes are not accessibility certification.

At 360px mobile width and a desktop viewport, inspect all meaningful states: loading, empty, success, validation error, offline, permissions failure and unexpected failure. Avoid focus loss when content refreshes. Charts need a table/text equivalent. No color-only status. Respect locale/date/number formatting and avoid imposing US formats on imported data.

## 7. Operations, adoption and release gate

Each release has an owner, changelog, rollback step, storage/schema migration test and a known-limitations section. Track errors as bounded codes and timings, never file contents, form answers or repair notes. Start with local diagnostic exports and CI evidence; add hosted observability only when usage justifies it and consent/storage rules are defined.

Before calling v1 application-ready: clean-machine setup succeeds; a stranger can complete the main sample journey; required CI is green; license/notices are correct; no placeholder screenshots or credentials; documented accessibility issues have severity and next action; the free hosted demo survives backend unavailability; at least one feedback session has been documented or the lack of pilot evidence is disclosed. Ask for real contributions only after the README and starter issues make participation feasible.

Evidence of senior judgment is the decision trail: the alternative rejected, why the product needed the chosen complexity, what was measured, how failures are handled, and what user feedback changed. A high badge count is not a release criterion.
