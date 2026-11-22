# RepairRelay working instructions

Read docs/STATUS.md, docs/IMPLEMENTATION.md and docs/ENGINEERING.md before work. Inspect git status and existing branches/PRs; do not overwrite another run. One active writer per repository. Use actual commit dates. No invented users, metrics or test results.

Commands: npm ci; npm run check; npm test; npm run build; npm run test:e2e. Unit-test absence is allowed only for this empty setup; add meaningful tests with product logic. Never claim the setup smoke test validates product behavior. Keep secrets out of source and logs. Do not upgrade paid resources.

After each coherent change, update docs/STATUS.md with tested revision, actual checks, next task and blockers. Follow the implementation milestone order. Do not create scheduled tasks; the owner will configure them.
