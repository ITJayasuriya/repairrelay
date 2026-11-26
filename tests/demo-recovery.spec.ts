import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { applyDemoCommand, type DemoCommand } from "../src/domain/case";

function backupFile() {
  const create: DemoCommand = {
    id: crypto.randomUUID(),
    caseId: crypto.randomUUID(),
    baseVersion: 0,
    at: "2026-11-26T00:00:00.000Z",
    action: {
      kind: "intake",
      payload: { category: "Mechanical", fault: "Recovered synthetic hinge" },
    },
  };
  const claim: DemoCommand = {
    ...create,
    id: crypto.randomUUID(),
    baseVersion: 1,
    action: { kind: "claim" },
  };
  const note: DemoCommand = {
    ...create,
    id: crypto.randomUUID(),
    baseVersion: 2,
    action: { kind: "note", body: "Saved handoff survives device recovery." },
  };
  const item = [create, claim, note].reduce<
    ReturnType<typeof applyDemoCommand> | undefined
  >((current, command) => applyDemoCommand(current, command), undefined);
  return {
    format: "repairrelay-demo-backup",
    version: 1,
    exportedAt: create.at,
    cases: [item],
    commands: [note, create, claim],
  };
}
const file = (value: unknown) => ({
  name: "demo.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(value)),
});

test("backup preview, cancel and confirmed restore preserve the complete handoff", async ({
  page,
  browserName,
}, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/demo");
  await page.getByText("Restore a demo backup", { exact: true }).click();
  await page.getByLabel("Demo backup file").setInputFiles(file(backupFile()));
  await expect(page.getByText("Backup preview · 1 tickets")).toBeVisible();
  await expect(page.getByRole("button", { name: /D-.*Recovered/ })).toHaveCount(
    0,
  );
  await page.screenshot({
    path: testInfo.outputPath("recovery-mobile.png"),
    fullPage: true,
  });
  if (browserName === "chromium")
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Cancel restore" }).click();
  await expect(page.getByText("Backup preview", { exact: false })).toHaveCount(
    0,
  );
  await page.getByLabel("Demo backup file").setInputFiles(file(backupFile()));
  await page
    .getByRole("button", { name: "Restore these demo tickets" })
    .click();
  await expect(
    page.getByText(
      "Restored 1 demo tickets on this device. No team data was sent.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Demo backup file")).toBeDisabled();
  await page.reload();
  await page
    .getByRole("button", { name: /D-.*Recovered synthetic hinge/ })
    .click();
  await expect(
    page.getByText("Saved handoff survives device recovery."),
  ).toBeVisible();
  await page.getByLabel("Handoff note").fill("New note after restore");
  await page.getByRole("button", { name: "Save handoff note" }).click();
  await expect(
    page.getByText("New note after restore", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByText("Restore a demo backup", { exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("recovery-desktop.png"),
    fullPage: true,
  });
});

test("invalid backup stays reviewable and never imports partial tickets", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.getByText("Restore a demo backup", { exact: true }).click();
  await page.getByLabel("Demo backup file").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.getByRole("alert")).toContainText("not valid JSON");
  await page
    .getByLabel("Demo backup file")
    .setInputFiles(file({ ...backupFile(), commands: [] }));
  await expect(page.getByRole("alert")).toContainText("do not match");
  await expect(
    page.getByRole("button", { name: "Restore these demo tickets" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("No tickets here yet.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Demo backup file").setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1, " "),
  });
  await expect(page.getByRole("alert")).toContainText("5 MiB");
  await expect(page.getByLabel("Demo backup file")).toBeEnabled();
});
