import Dexie, { liveQuery, type EntityTable } from "dexie";
import {
  applyDemoCommand,
  caseSchema,
  commandSchema,
  type DemoCommand,
  type RepairCase,
} from "../domain/case";
import {
  demoConflict,
  maxPendingCommands,
  pendingDemoCommands,
} from "../domain/demo-outbox";
import { demoDb } from "./demo-store";

// Separate simulated authority allows a committed response to be lost before acknowledgment.
export const demoServer = new Dexie(
  "repairrelay-demo-simulator-v1",
) as Dexie & {
  cases: EntityTable<RepairCase, "id">;
  receipts: EntityTable<{ id: string; command: DemoCommand }, "id">;
};
demoServer.version(1).stores({ cases: "id", receipts: "id" });

export function watchDemoPending(
  next: (count: number) => void,
  error: (error: unknown) => void,
) {
  return liveQuery(() =>
    demoDb.transaction(
      "r",
      demoDb.commands,
      demoDb.acknowledgments,
      async () =>
        (await demoDb.commands.count()) -
        (await demoDb.acknowledgments.count()),
    ),
  ).subscribe({ next, error });
}

export async function syncDemoCommands() {
  const { journal, pending } = await demoDb.transaction(
    "r",
    demoDb.commands,
    demoDb.acknowledgments,
    async () => {
      const journal = (await demoDb.commands.toArray()).map((row) =>
        commandSchema.parse(row),
      );
      return {
        journal,
        pending: pendingDemoCommands(
          journal,
          await demoDb.acknowledgments.toCollection().primaryKeys(),
        ),
      };
    },
  );
  const blocked = new Set<string>();
  const conflicts: ReturnType<typeof demoConflict>[] = [];
  let acknowledged = 0;
  for (const command of pending.slice(0, maxPendingCommands)) {
    if (blocked.has(command.caseId)) continue;
    const result = await demoServer.transaction(
      "rw",
      demoServer.cases,
      demoServer.receipts,
      async () => {
        const receipt = await demoServer.receipts.get(command.id);
        if (receipt) {
          if (
            JSON.stringify(commandSchema.parse(receipt.command)) !==
            JSON.stringify(command)
          )
            throw new Error(
              "Simulated command identity was reused with different content.",
            );
          return { accepted: true as const };
        }
        const stored = await demoServer.cases.get(command.caseId);
        const server = stored ? caseSchema.parse(stored) : undefined;
        if ((server?.version ?? 0) !== command.baseVersion)
          return { accepted: false as const, server };
        await demoServer.cases.put(applyDemoCommand(server, command));
        await demoServer.receipts.add({ id: command.id, command });
        return { accepted: true as const };
      },
    );
    if (!result.accepted) {
      blocked.add(command.caseId);
      conflicts.push(demoConflict(journal, command, result.server));
      continue;
    }
    // Failure here leaves the original command queued for an idempotent retry.
    await demoDb.acknowledgments.put({ id: command.id });
    acknowledged++;
  }
  return { acknowledged, conflicts };
}
