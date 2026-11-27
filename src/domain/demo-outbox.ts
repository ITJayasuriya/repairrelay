import { applyDemoCommand, type DemoCommand, type RepairCase } from "./case";

export const maxPendingCommands = 500;

// The immutable journal supplies dependencies without a competing queue order.
export function pendingDemoCommands(
  journal: DemoCommand[],
  acknowledged: string[],
) {
  const sent = new Set(acknowledged);
  for (const command of journal) {
    if (command.action.kind === "resolve")
      for (const id of command.action.supersedes) sent.add(id);
  }
  return journal
    .filter((command) => !sent.has(command.id))
    .sort((a, b) => a.baseVersion - b.baseVersion || a.id.localeCompare(b.id));
}

export function demoConflict(
  journal: DemoCommand[],
  command: DemoCommand,
  server: RepairCase | undefined,
) {
  let base: RepairCase | undefined;
  for (const previous of journal
    .filter(
      (entry) =>
        entry.caseId === command.caseId &&
        entry.baseVersion < command.baseVersion,
    )
    .sort((a, b) => a.baseVersion - b.baseVersion)) {
    base = applyDemoCommand(base, previous);
  }
  let local = applyDemoCommand(base, command);
  for (const dependent of journal
    .filter(
      (entry) =>
        entry.caseId === command.caseId &&
        entry.baseVersion > command.baseVersion,
    )
    .sort((a, b) => a.baseVersion - b.baseVersion)) {
    local = applyDemoCommand(local, dependent);
  }
  return { command, base, local, server };
}
