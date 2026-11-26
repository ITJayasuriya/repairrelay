import { expect, it } from "vitest";
import { applyDemoCommand, type DemoCommand } from "./case";
import { demoConflict, pendingDemoCommands } from "./demo-outbox";
const create: DemoCommand = {
  id: crypto.randomUUID(),
  caseId: crypto.randomUUID(),
  baseVersion: 0,
  at: "2026-11-27T00:00:00.000Z",
  action: { kind: "intake", payload: { category: "Other", fault: "Jammed" } },
};
const claim: DemoCommand = {
  ...create,
  id: crypto.randomUUID(),
  baseVersion: 1,
  action: { kind: "claim" },
};
it("orders dependent commands by case version, never client time, and skips acknowledgments", () => {
  const note: DemoCommand = {
    ...claim,
    id: crypto.randomUUID(),
    baseVersion: 2,
    action: { kind: "note", body: "Inspect hinge" },
  };
  expect(pendingDemoCommands([note, claim, create], [create.id])).toEqual([
    claim,
    note,
  ]);
  expect(
    pendingDemoCommands([note, claim, create], [create.id, claim.id, note.id]),
  ).toEqual([]);
});
it("retains original base, local intent and competing server snapshot", () => {
  const base = applyDemoCommand(undefined, create);
  const server = { ...base, version: 2, fault: "Other device diagnosis" };
  const conflict = demoConflict([claim, create], claim, server);
  expect(conflict.base).toEqual(base);
  expect(conflict.local.owner).toBe("demo-repairer");
  expect(conflict.server?.fault).toBe("Other device diagnosis");
  expect(conflict.command).toEqual(claim);
  expect(base.owner).toBeNull();
});
