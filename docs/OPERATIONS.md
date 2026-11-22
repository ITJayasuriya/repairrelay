# Operations

Live setup URL: https://isuru-repairrelay.pages.dev

Build with npm run build. Deploy the checked revision using npm run deploy -- --project-name isuru-repairrelay --branch main. Wrangler uses the owner-approved limited Pages OAuth sign-in in the Mac keychain. This local sign-in is not available to GitHub-hosted CI. No cloud token is committed.

Cloudflare account: 88caf19a7dd4ee5d8d2fbfeb8906f86b.

Supabase hosted project: jyyxkyeqlajigabqcqoj (Tokyo). Local stack: npx supabase start; npx supabase stop. Hosted database is initially empty. Never run local reset commands against hosted data. Google provider and remote migration credentials are pending setup.

The public page is a setup marker, not an implemented application. Read docs/STATUS.md before continuing.
