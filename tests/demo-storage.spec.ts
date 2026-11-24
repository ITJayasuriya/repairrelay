import { test, expect } from "@playwright/test";

test("IndexedDB atomically journals writes, rejects stale versions and deduplicates retries", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Device storage ready");
  const result = await page.evaluate(async () => {
    const moduleUrl = "/src/local/demo-store.ts";
    const {
      saveDemoCommand,
      demoDb,
    }: typeof import("../src/local/demo-store") = await import(moduleUrl);
    const id = crypto.randomUUID();
    const create = {
      id: crypto.randomUUID(),
      caseId: id,
      baseVersion: 0,
      at: new Date().toISOString(),
      action: {
        kind: "intake" as const,
        payload: {
          category: "Other" as const,
          fault: "Synthetic jammed hinge",
        },
      },
    };
    await saveDemoCommand(create);
    await saveDemoCommand(create);
    let mismatch = false;
    try {
      await saveDemoCommand({
        ...create,
        action: {
          ...create.action,
          payload: { ...create.action.payload, fault: "Changed payload" },
        },
      });
    } catch {
      mismatch = true;
    }
    const claim = {
      ...create,
      id: crypto.randomUUID(),
      baseVersion: 1,
      action: { kind: "claim" as const },
    };
    const race = await Promise.allSettled([
      saveDemoCommand(claim),
      saveDemoCommand({ ...claim, id: crypto.randomUUID() }),
    ]);
    const before = await demoDb.cases.get(id);
    let rolledBack = false;
    try {
      await demoDb.transaction(
        "rw",
        demoDb.cases,
        demoDb.commands,
        async () => {
          await saveDemoCommand({
            ...create,
            id: crypto.randomUUID(),
            baseVersion: 2,
            action: { kind: "note", body: "Must roll back" },
          });
          throw new Error("simulated transaction abort");
        },
      );
    } catch {
      rolledBack = true;
    }
    return {
      mismatch,
      rolledBack,
      race: race.map((r) => r.status),
      before,
      after: await demoDb.cases.get(id),
      commands: await demoDb.commands.count(),
    };
  });
  expect(result.mismatch).toBe(true);
  expect(result.rolledBack).toBe(true);
  expect(result.race.sort()).toEqual(["fulfilled", "rejected"]);
  expect(result.after).toEqual(result.before);
  expect(result.commands).toBe(2);
});
