import { maxPendingCommands } from "../domain/demo-outbox";
import { validateDemoBackup } from "../domain/demo-backup";
import Dexie, { liveQuery, type EntityTable } from "dexie";
import {
  applyDemoCommand,
  caseSchema,
  commandSchema,
  type DemoCommand,
  type RepairCase,
} from "../domain/case";

export const demoDb = new Dexie("repairrelay-demo-v1") as Dexie & {
  cases: EntityTable<RepairCase, "id">;
  commands: EntityTable<DemoCommand, "id">;
  acknowledgments: EntityTable<{ id: string }, "id">;
};
demoDb.version(1).stores({ cases: "id, updatedAt", commands: "id, caseId" });
demoDb.version(2).stores({ acknowledgments: "id" });

export function watchDemoCases(
  next: (items: RepairCase[]) => void,
  error: (error: unknown) => void,
) {
  return liveQuery(async () =>
    (await demoDb.cases.toArray())
      .map((item) => caseSchema.parse(item))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  ).subscribe({ next, error });
}

export async function saveDemoCommand(input: DemoCommand) {
  const command = commandSchema.parse(input);
  return demoDb.transaction(
    "rw",
    demoDb.cases,
    demoDb.commands,
    demoDb.acknowledgments,
    async () => {
      const previous = await demoDb.commands.get(command.id);
      if (previous) {
        if (JSON.stringify(previous) !== JSON.stringify(command))
          throw new Error(
            "Command identity was reused with different content.",
          );
        return;
      }
      if (
        (await demoDb.commands.count()) -
          (await demoDb.acknowledgments.count()) >=
        maxPendingCommands
      )
        throw new Error(
          "The demo outbox is full (500 changes). Back up your data, then run simulated sync before saving more.",
        );
      const stored = await demoDb.cases.get(command.caseId);
      const next = applyDemoCommand(
        stored ? caseSchema.parse(stored) : undefined,
        command,
      );
      await demoDb.cases.put(next);
      await demoDb.commands.add(command);
    },
  );
}

export async function exportDemoBackup() {
  return demoDb.transaction("r", demoDb.cases, demoDb.commands, async () => ({
    format: "repairrelay-demo-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    cases: (await demoDb.cases.toArray()).map((item) => caseSchema.parse(item)),
    commands: (await demoDb.commands.toArray()).map((item) =>
      commandSchema.parse(item),
    ),
  }));
}

// The emptiness check and import share the write lock, including across tabs.
export async function restoreDemoBackup(input: unknown) {
  const backup = validateDemoBackup(input);
  return demoDb.transaction(
    "rw",
    demoDb.cases,
    demoDb.commands,
    demoDb.acknowledgments,
    async () => {
      if (
        (await demoDb.cases.count()) ||
        (await demoDb.commands.count()) ||
        (await demoDb.acknowledgments.count())
      )
        throw new Error(
          "Restore needs an empty demo store. Existing tickets have been kept. Use a separate browser profile to restore this backup.",
        );
      // Recovery keeps all original identities, including journals above the new-write limit.
      await demoDb.cases.bulkAdd(backup.cases);
      await demoDb.commands.bulkAdd(backup.commands);
      return backup.cases.length;
    },
  );
}
