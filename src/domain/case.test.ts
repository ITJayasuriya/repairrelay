import { describe, expect, it } from "vitest";
import {
  applyDemoCommand,
  intakeSchema,
  type CaseAction,
  type RepairCase,
} from "./case";
const caseId = "00000000-0000-4000-8000-000000000001";
function apply(
  current: RepairCase | undefined,
  action: CaseAction,
  version = current?.version ?? 0,
) {
  return applyDemoCommand(current, {
    id: crypto.randomUUID(),
    caseId,
    baseVersion: version,
    at: "2026-11-25T00:00:00.000Z",
    action,
  });
}
const intake = () =>
  apply(undefined, {
    kind: "intake",
    payload: {
      category: "Small electrical",
      fault: "Kettle does not switch on",
    },
  });
describe("synthetic kettle walkthrough", () => {
  it("keeps an anonymous provisional reference, ownership, notes and explicit outcome", () => {
    let item = intake();
    expect(item.reference).toMatch(/^D-/);
    expect(item.owner).toBeNull();
    item = apply(item, { kind: "claim" });
    item = apply(item, {
      kind: "note",
      body: "Switch requires further diagnosis",
    });
    item = apply(item, { kind: "status", status: "waiting-for-part" });
    item = apply(item, { kind: "close", outcome: "repairable" });
    expect(item).toMatchObject({
      version: 5,
      status: "completed",
      outcome: "repairable",
    });
    expect(item.notes).toHaveLength(1);
    expect(() => apply(item, { kind: "note", body: "Late edit" })).toThrow(
      "closed",
    );
  });
  it("rejects unowned mutations, double claims and stale writes", () => {
    const item = intake();
    expect(() => apply(item, { kind: "note", body: "Note" })).toThrow("Claim");
    expect(() => apply(item, { kind: "close", outcome: "repaired" })).toThrow(
      "Claim",
    );
    const claimed = apply(item, { kind: "claim" });
    expect(() => apply(claimed, { kind: "claim" })).toThrow(
      "already has an owner",
    );
    expect(() =>
      apply(claimed, { kind: "status", status: "waiting-for-part" }, 1),
    ).toThrow("another tab");
    expect(item.owner).toBeNull();
  });
  it("bounds and trims user content", () => {
    expect(
      intakeSchema.safeParse({ category: "Other", fault: "   " }).success,
    ).toBe(false);
    expect(() =>
      apply(apply(intake(), { kind: "claim" }), {
        kind: "note",
        body: "x".repeat(2001),
      }),
    ).toThrow();
    expect(
      intakeSchema.parse({ category: "Other", fault: "  Jammed  " }).fault,
    ).toBe("Jammed");
  });
});
