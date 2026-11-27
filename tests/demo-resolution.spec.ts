import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("practice conflict combines both notes, survives reload and replays a version 2 backup", async ({
  page,
}, testInfo) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Create practice conflict" }).click();
  await page.getByText(/^Review D-/).click();
  await expect(
    page.getByText("This device: inspect the hinge pin.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Other simulated device: keep the original screw.", {
      exact: true,
    }),
  ).toBeVisible();
  if (testInfo.project.name === "chromium")
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: testInfo.outputPath("resolution-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: testInfo.outputPath("resolution-desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Keep my fields and combine notes" })
    .click();
  await expect(
    page.getByText("0 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run simulated sync" }),
  ).toBeFocused();
  await page.reload();
  const result = await page.evaluate(async () => {
    const storeUrl = "/src/local/demo-store.ts";
    const backupUrl = "/src/domain/demo-backup.ts";
    const {
      demoDb,
      exportDemoBackup,
      restoreDemoBackup,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const { validateDemoBackup }: typeof import("../src/domain/demo-backup") =
      await import(backupUrl);
    const backup = validateDemoBackup(await exportDemoBackup());
    await demoDb.transaction(
      "rw",
      demoDb.cases,
      demoDb.commands,
      demoDb.acknowledgments,
      async () => {
        await demoDb.cases.clear();
        await demoDb.commands.clear();
        await demoDb.acknowledgments.clear();
      },
    );
    await restoreDemoBackup(backup);
    return {
      backup,
      cases: await demoDb.cases.toArray(),
      commands: await demoDb.commands.count(),
    };
  });
  expect(result.backup.version).toBe(2);
  expect(result.commands).toBe(4);
  expect(result.cases).toEqual(result.backup.cases);
  expect(result.cases[0]?.notes).toHaveLength(2);
  // Original simulator receipts also make a restored resolution an identical retry.
  await page.getByRole("button", { name: "Run simulated sync" }).click();
  await expect(
    page.getByText("0 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
});

test("stale reviews reject, stale server resolutions pause, and lost resolution acknowledgments retry once", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const syncUrl = "/src/local/demo-sync.ts";
    const storeUrl = "/src/local/demo-store.ts";
    const exerciseUrl = "/src/local/demo-exercise.ts";
    const {
      demoDb,
      saveDemoCommand,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const {
      practiceDemoConflict,
    }: typeof import("../src/local/demo-exercise") = await import(exerciseUrl);
    const {
      demoServer,
      syncDemoCommands,
      resolveDemoConflict,
    }: typeof import("../src/local/demo-sync") = await import(syncUrl);
    const item = await practiceDemoConflict();
    const conflict = (await syncDemoCommands()).conflicts[0]!;
    await saveDemoCommand({
      id: crypto.randomUUID(),
      caseId: item.id,
      baseVersion: item.version,
      at: new Date().toISOString(),
      action: { kind: "note", body: "Later local note" },
    });
    let staleLocal = false;
    try {
      await resolveDemoConflict(conflict, "combine");
    } catch {
      staleLocal = true;
    }
    const fresh = (await syncDemoCommands()).conflicts[0]!;
    await resolveDemoConflict(fresh, "combine");
    await demoServer.cases.update(item.id, { version: 8 });
    const staleServer = await syncDemoCommands();
    await resolveDemoConflict(staleServer.conflicts[0]!, "combine");
    const fail = () => {
      throw new Error("Lost resolution acknowledgment");
    };
    demoDb.acknowledgments.hook("creating", fail);
    let lost = false;
    try {
      await syncDemoCommands();
    } catch {
      lost = true;
    }
    demoDb.acknowledgments.hook("creating").unsubscribe(fail);
    await Promise.all([syncDemoCommands(), syncDemoCommands()]);
    return {
      staleLocal,
      staleServer: staleServer.conflicts.length,
      lost,
      server: await demoServer.cases.get(item.id),
      local: await demoDb.cases.get(item.id),
      journal: await demoDb.commands.count(),
      receipts: await demoServer.receipts.count(),
      final: await syncDemoCommands(),
    };
  });
  expect(result.staleLocal).toBe(true);
  expect(result.staleServer).toBe(1);
  expect(result.lost).toBe(true);
  expect(result.server).toEqual(result.local);
  expect(result.server?.version).toBe(9);
  expect(result.server?.notes).toHaveLength(3);
  expect(result.journal).toBe(6);
  expect(result.receipts).toBe(4);
  expect(result.final.conflicts).toEqual([]);
});

test("choosing simulator retains local intent only in history and two tabs cannot resolve the same stale review", async ({
  page,
  context,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Create practice conflict" }).click();
  const other = await context.newPage();
  await other.goto("/demo");
  await other.getByRole("button", { name: "Run simulated sync" }).click();
  await other.getByText(/^Review D-/).click();
  await page.getByText(/^Review D-/).click();
  await page.getByRole("button", { name: "Use simulator ticket" }).click();
  await expect(
    page.getByText("0 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
  await other
    .getByRole("button", { name: "Keep my fields and combine notes" })
    .click();
  await expect(other.getByRole("alert")).toContainText("Local ticket changed");
  const state = await page.evaluate(async () => {
    const url = "/src/local/demo-store.ts";
    const { exportDemoBackup }: typeof import("../src/local/demo-store") =
      await import(url);
    return exportDemoBackup();
  });
  expect(state.cases[0]?.notes.map((n) => n.body)).toEqual([
    "Other simulated device: keep the original screw.",
  ]);
  expect(JSON.stringify(state.commands)).toContain(
    "This device: inspect the hinge pin.",
  );
});

test("resolution save rolls back on storage failure and later pending notes apply in order", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const storeUrl = "/src/local/demo-store.ts";
    const syncUrl = "/src/local/demo-sync.ts";
    const exerciseUrl = "/src/local/demo-exercise.ts";
    const {
      demoDb,
      saveDemoCommand,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const {
      demoServer,
      syncDemoCommands,
      resolveDemoConflict,
    }: typeof import("../src/local/demo-sync") = await import(syncUrl);
    const {
      practiceDemoConflict,
    }: typeof import("../src/local/demo-exercise") = await import(exerciseUrl);
    const item = await practiceDemoConflict();
    const conflict = (await syncDemoCommands()).conflicts[0]!;
    const fail = () => {
      throw new Error("Storage unavailable");
    };
    demoDb.commands.hook("creating", fail);
    let failed = false;
    try {
      await resolveDemoConflict(conflict, "combine");
    } catch {
      failed = true;
    }
    demoDb.commands.hook("creating").unsubscribe(fail);
    const afterFailure = {
      item: await demoDb.cases.get(item.id),
      count: await demoDb.commands.count(),
    };
    await resolveDemoConflict(conflict, "combine");
    const resolved = (await demoDb.cases.get(item.id))!;
    const note = {
      id: crypto.randomUUID(),
      caseId: item.id,
      baseVersion: resolved.version,
      at: new Date().toISOString(),
      action: { kind: "note" as const, body: "After resolution" },
    };
    await saveDemoCommand(note);
    await syncDemoCommands();
    const receipt = await demoServer.receipts.get(note.id);
    return {
      failed,
      afterFailure,
      original: item,
      receipt: !!receipt,
      server: await demoServer.cases.get(item.id),
      local: await demoDb.cases.get(item.id),
    };
  });
  expect(result.failed).toBe(true);
  expect(result.afterFailure.item).toEqual(result.original);
  expect(result.afterFailure.count).toBe(3);
  expect(result.receipt).toBe(true);
  expect(result.server).toEqual(result.local);
  expect(result.server?.notes).toHaveLength(3);
});
