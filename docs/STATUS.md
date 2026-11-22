# Status

Stage: verified development foundation, not an implemented product.

Completed: repository skeleton, pinned dependencies, application setup marker, TypeScript/lint/format configuration, production build, Chromium smoke and axe check, three-browser CI configuration, contribution/security documents and implementation plans.

Local Firefox startup currently fails before page load with “Could not find profile folder.” Chromium and WebKit are the local readiness checks via `npm run test:e2e:local`; full `npm run test:e2e` includes Firefox and is required in Linux CI. Do not claim local Firefox passed.

Next: M0 discovery and first vertical slice from IMPLEMENTATION.md. No product unit tests exist yet; add meaningful domain tests with product logic.

Deferred tool integrations: unused Storybook (FormPath) and PWA tooling (RepairRelay) were removed after moderate transitive advisories. Select secure compatible versions when those milestones start.

Read OPERATIONS.md for deployed setup marker and provider configuration. Do not create scheduled tasks: the owner will create them after readiness review.
