# Day-one maintainability and UI review

Applied Ponytail, Thermo-Nuclear Code Quality Review, Interface Design and Better
Typography on 25 November 2026. This is a self-review, not independent approval.

Intent: a volunteer at reception moves a synthetic item to a bench and leaves a
handoff. The queue and case detail lead; desktop splits reception/workbench,
mobile stacks them. Domain vocabulary: ticket, bench, owner, fault, handoff,
outcome. Palette: cream paper, graphite labels, blue ownership, orange caution,
green outcome. The ownership/revision strip is the signature. Rejected defaults:
Kanban drag/drop, decorative metric cards, and success-only floating toasts.
Borders distinguish paper surfaces, 4px spacing/16–24px padding and system 16px
text support dependable offline rendering. Native controls keep keyboard behavior.

Review findings resolved:

- Avoided a workflow orchestrator and competing state store: pure transitions
  own invariants, IndexedDB owns durable truth, React subscribes to commits.
- Read/check/write and command journal use one transaction, eliminating partial
  persistence and cross-tab last-write-wins.
- Inputs are disabled during writes to prevent a successful form reset from
  deleting newer unsaved text. Failed saves keep input and display an error.
- Demo identity and provisional references stay explicit; local state is never
  presented as server-confirmed team ownership or synced data.
- Small domain/store/intake/detail/app modules; no file approaches 1,000 lines.
  No new packages, wrappers or permissive JSON casts. Browser storage data is
  schema-validated. JSON backup is expressly not a standard-compliant export.

External PR #12 was read without executing its code. Its undeclared Zustand
import and placeholder persistence/sync do not meet M1. It remains untouched;
this implementation does not claim its author supplied these changes.

Next review focus: bounded demo journal, backup restore, lossless simulated
conflicts and a real transactional outbox before team sync. Full-project audit
is due on day 7 and at final release. M0 participant evidence remains missing.
