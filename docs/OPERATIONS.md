# Operations

Live setup URL: https://isuru-repairrelay.pages.dev

Build with npm run build. Deploy the checked revision using npm run deploy -- --project-name isuru-repairrelay --branch main. Wrangler uses the owner-approved limited Pages OAuth sign-in in the Mac keychain. This local sign-in is not available to GitHub-hosted CI. No cloud token is committed.

Cloudflare account: 88caf19a7dd4ee5d8d2fbfeb8906f86b.

Supabase hosted project: jyyxkyeqlajigabqcqoj (Tokyo). Local stack: npx supabase start; npx supabase stop. Hosted database is initially empty. Never run local reset commands against hosted data. Google provider is enabled; exact callback URLs are configured. Hosted migration CLI credentials remain a release prerequisite. npm account scope is @isurutj. See SETUP-RESULT.md.

The public page is a setup marker, not an implemented application. Read docs/STATUS.md before continuing.
