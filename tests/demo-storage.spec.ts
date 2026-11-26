import { test, expect } from "@playwright/test";

test("IndexedDB atomically journals writes, rejects stale versions and deduplicates retries", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".save-status")).toContainText(
    "Device storage ready",
  );
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
        demoDb.acknowledgments,
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

test("restore is atomic, retains retry identities and never replaces another tab's data", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const moduleUrl = "/src/local/demo-store.ts";
    const {
      demoDb,
      saveDemoCommand,
      exportDemoBackup,
      restoreDemoBackup,
    }: typeof import("../src/local/demo-store") = await import(moduleUrl);
    const create = {
      id: crypto.randomUUID(),
      caseId: crypto.randomUUID(),
      baseVersion: 0,
      at: new Date().toISOString(),
      action: {
        kind: "intake" as const,
        payload: { category: "Other" as const, fault: "Recovery hinge" },
      },
    };
    await saveDemoCommand(create);
    const backup = await exportDemoBackup();
    // Emulate a fresh device while retaining the exact exported payload.
    await demoDb.transaction(
      "rw",
      demoDb.cases,
      demoDb.commands,
      demoDb.acknowledgments,
      async () => {
        await demoDb.cases.clear();
        await demoDb.commands.clear();
      },
    );
    const fail = () => {
      throw new DOMException("Simulated quota failure", "QuotaExceededError");
    };
    demoDb.commands.hook("creating", fail);
    let aborted = false;
    try {
      await restoreDemoBackup(backup);
    } catch {
      aborted = true;
    }
    demoDb.commands.hook("creating").unsubscribe(fail);
    const afterFailure = [
      await demoDb.cases.count(),
      await demoDb.commands.count(),
    ];
    const race = await Promise.allSettled([
      restoreDemoBackup(backup),
      restoreDemoBackup(backup),
    ]);
    await saveDemoCommand(create);
    return {
      aborted,
      afterFailure,
      race: race.map((item) => item.status).sort(),
      cases: await demoDb.cases.toArray(),
      count: await demoDb.commands.count(),
      backup,
    };
  });
  expect(result.aborted).toBe(true);
  expect(result.afterFailure).toEqual([0, 0]);
  expect(result.race).toEqual(["fulfilled", "rejected"]);
  expect(result.cases).toEqual(result.backup.cases);
  expect(result.count).toBe(1);
});
