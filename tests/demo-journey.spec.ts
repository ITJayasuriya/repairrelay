import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("reception to outcome survives refresh, preserves notes and downloads an honest backup", async ({
  page,
  context,
  browserName,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/demo");
  await page.getByLabel("Reported fault").fill("Kettle does not switch on");
  await page.getByRole("button", { name: "Register demo ticket" }).click();
  await expect(page.locator(".save-status")).toContainText(
    "Saved on this device",
  );
  await page.getByRole("button", { name: "Claim in demo" }).click();
  await page
    .getByLabel("Handoff note")
    .fill("Synthetic fixture: switch needs further diagnosis.");
  await page.getByRole("button", { name: "Save handoff note" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Synthetic fixture:" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /D-.*Kettle/ }).click();
  await expect(
    page.getByText("Synthetic fixture: switch needs further diagnosis."),
  ).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Wait for part" }).click();
  await expect(page.locator(".save-status")).toContainText(
    "Saved on this device",
  );
  await expect(
    page.getByRole("button", { name: "Wait for part" }),
  ).toBeDisabled();
  await page.getByLabel("Repair outcome").selectOption("repairable");
  await page.getByRole("button", { name: "Close ticket with outcome" }).click();
  await expect(
    page.getByText("Outcome: Repairable — more work needed"),
  ).toBeVisible();
  await context.setOffline(false);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Back up demo data" }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const backup = JSON.parse(Buffer.concat(chunks).toString());
  expect(backup.format).toBe("repairrelay-demo-backup");
  expect(backup.cases[0]).toMatchObject({ outcome: "repairable", version: 5 });
  expect(backup.commands).toHaveLength(5);
  if (browserName === "chromium") {
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("two tabs observe committed tickets and a failed write keeps form text", async ({
  page,
  context,
}) => {
  await page.goto("/demo");
  const other = await context.newPage();
  await other.goto("/demo");
  await page.getByLabel("Reported fault").fill("Jammed hinge");
  await page.getByRole("button", { name: "Register demo ticket" }).click();
  await expect(
    other.getByRole("button", { name: /D-.*Jammed hinge/ }),
  ).toBeVisible();
  await page.evaluate(async () => {
    const moduleUrl = "/src/local/demo-store.ts";
    const { demoDb }: typeof import("../src/local/demo-store") = await import(
      moduleUrl
    );
    demoDb.cases.hook("creating", () => {
      throw new DOMException(
        "Simulated storage quota reached",
        "QuotaExceededError",
      );
    });
  });
  await page.getByLabel("Reported fault").fill("Unsaved synthetic toaster");
  await page.getByRole("button", { name: "Register demo ticket" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Nothing was acknowledged as saved",
  );
  await expect(page.getByLabel("Reported fault")).toHaveValue(
    "Unsaved synthetic toaster",
  );
  await expect(
    page.getByRole("button", { name: /D-.*Unsaved synthetic toaster/ }),
  ).toHaveCount(0);
});

test("keyboard entry, empty state and validation remain accessible", async ({
  page,
  browserName,
}) => {
  await page.goto("/demo");
  await expect(page.locator(".save-status")).toContainText(
    "Device storage ready",
  );
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to repair queue" });
  if (process.platform === "darwin" && browserName === "webkit") {
    // macOS WebKit skips links when full keyboard access is disabled.
    await expect(page.locator(".recovery summary")).toBeFocused();
    await skip.focus();
  } else {
    await expect(skip).toBeFocused();
  }
  await page.keyboard.press("Enter");
  await expect(page.locator("#queue")).toBeFocused();
  await expect(
    page.getByText("No tickets here yet.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Reported fault").fill("   ");
  await page.getByRole("button", { name: "Register demo ticket" }).click();
  await expect(page.getByRole("alert")).toContainText("describe the fault");
  if (browserName === "chromium") {
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
