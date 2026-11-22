import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("setup page loads and has no automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "RepairRelay", exact: true }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
