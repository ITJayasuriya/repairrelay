import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("dependent outbox survives lost acknowledgments, retries and competing sync calls", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const storeUrl = "/src/local/demo-store.ts";
    const syncUrl = "/src/local/demo-sync.ts";
    const {
      demoDb,
      saveDemoCommand,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const {
      demoServer,
      syncDemoCommands,
    }: typeof import("../src/local/demo-sync") = await import(syncUrl);
    const create = {
      id: crypto.randomUUID(),
      caseId: crypto.randomUUID(),
      baseVersion: 0,
      at: new Date().toISOString(),
      action: {
        kind: "intake" as const,
        payload: { category: "Other" as const, fault: "Hinge" },
      },
    };
    await saveDemoCommand(create);
    await saveDemoCommand({
      ...create,
      id: crypto.randomUUID(),
      baseVersion: 1,
      action: { kind: "claim" },
    });
    await saveDemoCommand({
      ...create,
      id: crypto.randomUUID(),
      baseVersion: 2,
      action: { kind: "note", body: "Preserve this note" },
    });
    const fail = () => {
      throw new Error("Lost acknowledgment");
    };
    demoDb.acknowledgments.hook("creating", fail);
    let lost = false;
    try {
      await syncDemoCommands();
    } catch {
      lost = true;
    }
    demoDb.acknowledgments.hook("creating").unsubscribe(fail);
    const boundary = [
      await demoServer.receipts.count(),
      await demoDb.acknowledgments.count(),
    ];
    await Promise.all([syncDemoCommands(), syncDemoCommands()]);
    return {
      lost,
      boundary,
      receipts: await demoServer.receipts.count(),
      acks: await demoDb.acknowledgments.count(),
      server: await demoServer.cases.get(create.caseId),
      local: await demoDb.cases.get(create.caseId),
    };
  });
  expect(result.lost).toBe(true);
  expect(result.boundary).toEqual([1, 0]);
  expect(result.receipts).toBe(3);
  expect(result.acks).toBe(3);
  expect(result.server).toEqual(result.local);
  expect(result.server?.notes).toHaveLength(1);
  await page.reload();
  await expect(
    page.getByText("0 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
});

test("conflicts stop dependent commands, keep original intent and allow other tickets to sync", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const storeUrl = "/src/local/demo-store.ts";
    const syncUrl = "/src/local/demo-sync.ts";
    const {
      demoDb,
      saveDemoCommand,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const {
      demoServer,
      syncDemoCommands,
    }: typeof import("../src/local/demo-sync") = await import(syncUrl);
    const create = {
      id: crypto.randomUUID(),
      caseId: crypto.randomUUID(),
      baseVersion: 0,
      at: new Date().toISOString(),
      action: {
        kind: "intake" as const,
        payload: { category: "Other" as const, fault: "Hinge" },
      },
    };
    await saveDemoCommand(create);
    await syncDemoCommands();
    await saveDemoCommand({
      ...create,
      id: crypto.randomUUID(),
      baseVersion: 1,
      action: { kind: "claim" },
    });
    await saveDemoCommand({
      ...create,
      id: crypto.randomUUID(),
      baseVersion: 2,
      action: { kind: "note", body: "Keep local diagnosis" },
    });
    const original = await demoDb.cases.get(create.caseId);
    await demoServer.cases.update(create.caseId, {
      version: 2,
      fault: "Competing diagnosis",
    });
    await saveDemoCommand({
      ...create,
      id: crypto.randomUUID(),
      caseId: crypto.randomUUID(),
    });
    const sync = await syncDemoCommands();
    const retry = await syncDemoCommands();
    return {
      sync,
      retry,
      original,
      after: await demoDb.cases.get(create.caseId),
      pending:
        (await demoDb.commands.count()) -
        (await demoDb.acknowledgments.count()),
      receipts: await demoServer.receipts.count(),
    };
  });
  expect(result.sync.acknowledged).toBe(1);
  expect(result.pending).toBe(2);
  expect(result.receipts).toBe(2);
  expect(result.sync.conflicts[0]?.base?.owner).toBeNull();
  expect(result.sync.conflicts[0]?.local.owner).toBe("demo-repairer");
  expect(result.sync.conflicts[0]?.server?.fault).toBe("Competing diagnosis");
  expect(result.retry.conflicts).toEqual(result.sync.conflicts);
  expect(result.after).toEqual(result.original);
  await page.getByRole("button", { name: "Run simulated sync" }).click();
  await page.getByText(/^Review D-/).click();
  await expect(
    page.getByRole("heading", { name: "Before your change" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your saved change" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Simulator version" }),
  ).toBeVisible();
  await expect(
    page.getByText("Competing diagnosis", { exact: true }),
  ).toBeVisible();
  if (test.info().project.name === "chromium") {
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: test.info().outputPath("conflict-mobile.png"),
    fullPage: true,
  });
});

test("full outbox rejects new writes atomically but permits identical retries", async ({
  page,
}) => {
  await page.goto("/demo");
  const result = await page.evaluate(async () => {
    const storeUrl = "/src/local/demo-store.ts";
    const {
      demoDb,
      saveDemoCommand,
    }: typeof import("../src/local/demo-store") = await import(storeUrl);
    const create = {
      id: crypto.randomUUID(),
      caseId: crypto.randomUUID(),
      baseVersion: 0,
      at: new Date().toISOString(),
      action: {
        kind: "intake" as const,
        payload: { category: "Other" as const, fault: "Hinge" },
      },
    };
    await saveDemoCommand(create);
    for (let i = 1; i < 500; i++)
      await saveDemoCommand({
        ...create,
        id: crypto.randomUUID(),
        caseId: crypto.randomUUID(),
      });
    let error = "";
    try {
      await saveDemoCommand({
        ...create,
        id: crypto.randomUUID(),
        caseId: crypto.randomUUID(),
      });
    } catch (cause) {
      error = String(cause);
    }
    await saveDemoCommand(create);
    return {
      error,
      cases: await demoDb.cases.count(),
      commands: await demoDb.commands.count(),
    };
  });
  expect(result.error).toContain("outbox is full");
  expect(result.cases).toBe(500);
  expect(result.commands).toBe(500);
});

test("manual simulation works offline, preserves focus and reports pending changes after refresh", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/demo");
  await page.getByLabel("Reported fault").fill("Synthetic hinge");
  await page.getByRole("button", { name: "Register demo ticket" }).click();
  await expect(
    page.getByText("1 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("1 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  const button = page.getByRole("button", { name: "Run simulated sync" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("0 changes pending simulated sync", { exact: true }),
  ).toBeVisible();
  await expect(button).toBeFocused();
  await expect(
    page.getByText(
      "1 changes acknowledged by the simulator. 0 tickets need review.",
    ),
  ).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: testInfo.outputPath("sync-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: testInfo.outputPath("sync-desktop.png"),
    fullPage: true,
  });
});
