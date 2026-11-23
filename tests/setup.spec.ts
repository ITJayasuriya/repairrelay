import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { workflowOrchestrator } from "../src/workflow/orchestrator";

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

test("end-to-end workflow: complete journey from event creation to export", async ({
  page,
}) => {
  // Start at the initial state
  expect(workflowOrchestrator.getState()).toBe("initial");
  expect(workflowOrchestrator.hasPendingChanges()).toBe(false);

  // Step 1: Create an event
  await workflowOrchestrator.createEvent({
    title: "Community Repair Event",
    date: "2023-11-15",
  });
  expect(workflowOrchestrator.getState()).toBe("event-created");

  // Step 2: Register a case
  await workflowOrchestrator.registerCase({
    ticketNo: "R001",
    category: "Electronics",
    fault: "Device not powering on",
  });
  expect(workflowOrchestrator.getState()).toBe("case-registered");

  // Step 3: Assign case to repairer
  await workflowOrchestrator.assignCase("case-123", "repairer-456");
  expect(workflowOrchestrator.getState()).toBe("case-assigned");
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);

  // Step 4: Start repair work
  await workflowOrchestrator.startRepair("case-123");
  expect(workflowOrchestrator.getState()).toBe("in-progress");
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);

  // Step 5: Simulate going offline
  workflowOrchestrator.goOffline();
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);

  // Step 6: Complete repair work while offline
  await workflowOrchestrator.completeRepair("case-123", "Repaired - replaced power button");
  expect(workflowOrchestrator.getState()).toBe("completed");
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);

  // Step 7: Come back online and sync
  await workflowOrchestrator.goOnline();
  expect(workflowOrchestrator.hasPendingChanges()).toBe(false);
  expect(workflowOrchestrator.getLastSync()).not.toBeNull();

  // Step 8: Export results
  const exportResult = await workflowOrchestrator.exportResults("event-789");
  expect(workflowOrchestrator.getState()).toBe("exported");
  expect(exportResult).toBeDefined();

  // Verify the complete workflow sequence
  expect(workflowOrchestrator.getState()).toBe("exported");
});

test("workflow handles offline changes and conflicts", async ({
  page,
}) => {
  // Reset to initial state
  workflowOrchestrator.dispatch({ type: 'CREATE_EVENT' });
  
  // Create and register a case
  await workflowOrchestrator.createEvent({ title: "Test Event" });
  await workflowOrchestrator.registerCase({ ticketNo: "T001", category: "Furniture", fault: "Wobbly chair" });
  
  // Go offline
  workflowOrchestrator.goOffline();
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);
  
  // Make changes while offline
  await workflowOrchestrator.assignCase("case-123", "repairer-456");
  expect(workflowOrchestrator.hasPendingChanges()).toBe(true);
  
  // Come back online
  await workflowOrchestrator.goOnline();
  expect(workflowOrchestrator.hasPendingChanges()).toBe(false);
  
  // Verify no conflicts in this simple case
  expect(workflowOrchestrator.getConflicts()).toHaveLength(0);
});
