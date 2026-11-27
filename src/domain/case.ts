import { z } from "zod";

export const categories = [
  "Small electrical",
  "Electronics",
  "Textiles",
  "Mechanical",
  "Other",
] as const;
export const statuses = [
  "queued",
  "in-progress",
  "waiting-for-part",
  "completed",
  "unrepairable",
] as const;
export const outcomes = ["repaired", "repairable", "end-of-life"] as const;
const text = (max: number) =>
  z.string().trim().min(1, "Enter some text.").max(max);
export const intakeSchema = z.object({
  category: z.enum(categories),
  fault: text(500),
});
const noteSchema = z.object({
  id: z.uuid(),
  body: text(2000),
  at: z.iso.datetime(),
});
export const caseSchema = intakeSchema.extend({
  id: z.uuid(),
  reference: z.string(),
  version: z.number().int().positive(),
  owner: z.enum(["demo-repairer"]).nullable(),
  status: z.enum(statuses),
  outcome: z.enum(outcomes).nullable(),
  notes: z.array(noteSchema),
  updatedAt: z.iso.datetime(),
});
export type RepairCase = z.infer<typeof caseSchema>;
export const actionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("intake"), payload: intakeSchema }),
  z.object({ kind: z.literal("claim") }),
  z.object({ kind: z.literal("note"), body: text(2000) }),
  z.object({
    kind: z.literal("status"),
    status: z.enum(["in-progress", "waiting-for-part"]),
  }),
  z.object({ kind: z.literal("close"), outcome: z.enum(outcomes) }),
  z.object({
    kind: z.literal("resolve"),
    server: caseSchema,
    choice: z.enum(["server", "combine"]),
    supersedes: z.array(z.uuid()).min(1).max(500),
  }),
]);
export type CaseAction = z.infer<typeof actionSchema>;
export const commandSchema = z.object({
  id: z.uuid(),
  caseId: z.uuid(),
  baseVersion: z.number().int().nonnegative(),
  at: z.iso.datetime(),
  action: actionSchema,
});
export type DemoCommand = z.infer<typeof commandSchema>;

// Demo authority only. Team authorization and ticket allocation belong in Postgres.
export function applyDemoCommand(
  current: RepairCase | undefined,
  command: DemoCommand,
): RepairCase {
  const { action, caseId, at, baseVersion } = commandSchema.parse(command);
  if ((current?.version ?? 0) !== baseVersion)
    throw new Error(
      "This ticket changed in another tab. Review it and try again.",
    );
  if (action.kind === "intake") {
    if (current) throw new Error("This ticket already exists.");
    return {
      ...action.payload,
      id: caseId,
      reference: `D-${caseId.slice(0, 8)}`,
      version: 1,
      owner: null,
      status: "queued",
      outcome: null,
      notes: [],
      updatedAt: at,
    };
  }
  if (!current) throw new Error("Ticket not found.");
  if (action.kind === "resolve") {
    if (action.server.id !== caseId)
      throw new Error("Resolution belongs to a different ticket.");
    const selected = action.choice === "server" ? action.server : current;
    const notes = new Map(action.server.notes.map((note) => [note.id, note]));
    if (action.choice === "combine") {
      for (const note of current.notes) {
        const existing = notes.get(note.id);
        if (existing && JSON.stringify(existing) !== JSON.stringify(note))
          throw new Error("A note identity has conflicting content.");
        notes.set(note.id, note);
      }
    }
    return {
      ...selected,
      notes: [...notes.values()],
      version: Math.max(current.version, action.server.version) + 1,
      updatedAt: at,
    };
  }
  if (current.outcome) throw new Error("This ticket is closed.");
  const next = { ...current, version: current.version + 1, updatedAt: at };
  switch (action.kind) {
    case "claim":
      if (current.owner) throw new Error("This ticket already has an owner.");
      return { ...next, owner: "demo-repairer", status: "in-progress" };
    case "note":
      if (!current.owner)
        throw new Error("Claim the ticket before adding a handoff note.");
      return {
        ...next,
        notes: [...current.notes, { id: command.id, body: action.body, at }],
      };
    case "status":
      if (!current.owner)
        throw new Error("Claim the ticket before changing its status.");
      return { ...next, status: action.status };
    case "close":
      if (!current.owner)
        throw new Error("Claim the ticket before recording an outcome.");
      return {
        ...next,
        status: action.outcome === "end-of-life" ? "unrepairable" : "completed",
        outcome: action.outcome,
      };
  }
}
