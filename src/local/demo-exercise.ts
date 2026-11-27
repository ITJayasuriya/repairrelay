import { applyDemoCommand, caseSchema, type DemoCommand } from "../domain/case";
import { demoDb, saveDemoCommand } from "./demo-store";
import { demoServer, syncDemoCommands } from "./demo-sync";

// A synthetic second device writes only to the independent browser simulator.
export async function practiceDemoConflict() {
  const intake: DemoCommand = {
    id: crypto.randomUUID(),
    caseId: crypto.randomUUID(),
    baseVersion: 0,
    at: new Date().toISOString(),
    action: {
      kind: "intake",
      payload: {
        category: "Mechanical",
        fault: "Practice ticket: stiff hinge",
      },
    },
  };
  await saveDemoCommand(intake);
  await syncDemoCommands();
  const claim: DemoCommand = {
    ...intake,
    id: crypto.randomUUID(),
    baseVersion: 1,
    action: { kind: "claim" },
  };
  await saveDemoCommand(claim);
  await saveDemoCommand({
    ...claim,
    id: crypto.randomUUID(),
    baseVersion: 2,
    action: { kind: "note", body: "This device: inspect the hinge pin." },
  });
  await demoServer.transaction(
    "rw",
    demoServer.cases,
    demoServer.receipts,
    async () => {
      let server = caseSchema.parse(await demoServer.cases.get(intake.caseId));
      for (const command of [
        { ...claim, id: crypto.randomUUID() },
        {
          ...claim,
          id: crypto.randomUUID(),
          baseVersion: 2,
          action: {
            kind: "note" as const,
            body: "Other simulated device: keep the original screw.",
          },
        },
      ]) {
        server = applyDemoCommand(server, command);
        await demoServer.receipts.add({ id: command.id, command });
      }
      await demoServer.cases.put(server);
    },
  );
  // Keep the exercise discoverable in the normal queue after a refresh.
  return caseSchema.parse(await demoDb.cases.get(intake.caseId));
}
