import { describe, expect, it } from "vitest";
import { applyDemoCommand, type DemoCommand } from "./case";
import {
  maxBackupBytes,
  parseDemoBackup,
  validateDemoBackup,
} from "./demo-backup";

const create: DemoCommand = {
  id: crypto.randomUUID(),
  caseId: crypto.randomUUID(),
  baseVersion: 0,
  at: "2026-11-26T00:00:00.000Z",
  action: {
    kind: "intake",
    payload: { category: "Other", fault: "Jammed hinge" },
  },
};
const claim: DemoCommand = {
  ...create,
  id: crypto.randomUUID(),
  baseVersion: 1,
  action: { kind: "claim" },
};
const item = applyDemoCommand(applyDemoCommand(undefined, create), claim);
const backup = {
  format: "repairrelay-demo-backup",
  version: 1,
  exportedAt: create.at,
  cases: [item],
  commands: [claim, create],
};

describe("demo recovery boundary", () => {
  it("replays an unordered journal and accepts an empty backup", () => {
    expect(parseDemoBackup(JSON.stringify(backup)).cases).toEqual([item]);
    expect(
      validateDemoBackup({ ...backup, cases: [], commands: [] }).cases,
    ).toEqual([]);
  });
  it("rejects changed snapshots, orphan commands and missing dependencies", () => {
    expect(() =>
      validateDemoBackup({
        ...backup,
        cases: [{ ...item, fault: "Tampered" }],
      }),
    ).toThrow("do not match");
    expect(() => validateDemoBackup({ ...backup, cases: [] })).toThrow(
      "do not match",
    );
    expect(() =>
      validateDemoBackup({ ...backup, commands: [claim] }),
    ).toThrow();
  });
  it("rejects duplicate command and case identities", () => {
    expect(() =>
      validateDemoBackup({ ...backup, commands: [create, claim, claim] }),
    ).toThrow("duplicate");
    expect(() =>
      validateDemoBackup({ ...backup, cases: [item, item] }),
    ).toThrow("do not match");
  });
  it("rejects malformed, oversized and unsupported files", () => {
    expect(() => parseDemoBackup("{")).toThrow("JSON");
    expect(() => parseDemoBackup(" ".repeat(maxBackupBytes + 1))).toThrow(
      "5 MiB",
    );
    expect(() => validateDemoBackup({ ...backup, version: 3 })).toThrow(
      "supported",
    );
    expect(() =>
      validateDemoBackup({
        ...backup,
        cases: [{ ...item, notes: [{ body: "x".repeat(2001) }] }],
      }),
    ).toThrow("supported");
  });
});

it("version 2 resolution replay rejects missing, duplicate and cross-ticket supersession identities", () => {
  const resolution: DemoCommand = {
    ...claim,
    id: crypto.randomUUID(),
    baseVersion: 2,
    action: {
      kind: "resolve",
      server: { ...item, version: 8 },
      choice: "combine",
      supersedes: [claim.id],
    },
  };
  const resolved = applyDemoCommand(item, resolution);
  const v2 = {
    ...backup,
    version: 2,
    cases: [resolved],
    commands: [create, claim, resolution],
  };
  expect(validateDemoBackup(v2).cases).toEqual([resolved]);
  expect(() => validateDemoBackup({ ...v2, version: 1 })).toThrow("version 2");
  if (resolution.action.kind !== "resolve") throw new Error("fixture");
  for (const supersedes of [[crypto.randomUUID()], [claim.id, claim.id]]) {
    expect(() =>
      validateDemoBackup({
        ...v2,
        commands: [
          create,
          claim,
          { ...resolution, action: { ...resolution.action, supersedes } },
        ],
      }),
    ).toThrow("missing or unrelated");
  }
  const foreign = {
    ...create,
    id: crypto.randomUUID(),
    caseId: crypto.randomUUID(),
  };
  expect(() =>
    validateDemoBackup({
      ...v2,
      commands: [
        create,
        foreign,
        claim,
        {
          ...resolution,
          action: { ...resolution.action, supersedes: [foreign.id] },
        },
      ],
    }),
  ).toThrow("missing or unrelated");
});
