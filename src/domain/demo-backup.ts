import { z } from "zod";
import {
  applyDemoCommand,
  caseSchema,
  commandSchema,
  type RepairCase,
} from "./case";

export const maxBackupBytes = 5 * 1024 * 1024;
const backupSchema = z.object({
  format: z.literal("repairrelay-demo-backup"),
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.iso.datetime(),
  cases: z.array(caseSchema).max(1000),
  commands: z.array(commandSchema).max(10000),
});

// Replay by case version: IndexedDB exports journal rows in command-ID order.
export function validateDemoBackup(input: unknown) {
  const parsed = backupSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      "Choose a supported RepairRelay demo backup (version 1 or 2).",
    );
  const backup = parsed.data;
  if (
    backup.version === 1 &&
    backup.commands.some((c) => c.action.kind === "resolve")
  )
    throw new Error("Resolution history requires backup version 2.");
  const cases = new Map<string, RepairCase>();
  const commandCases = new Map<string, string>();
  for (const command of [...backup.commands].sort(
    (a, b) => a.baseVersion - b.baseVersion,
  )) {
    if (commandCases.has(command.id))
      throw new Error("Backup contains duplicate command identities.");
    if (command.action.kind === "resolve") {
      const superseded = command.action.supersedes;
      if (
        new Set(superseded).size !== superseded.length ||
        superseded.some((id) => commandCases.get(id) !== command.caseId)
      )
        throw new Error(
          "Resolution history refers to missing or unrelated changes.",
        );
    }
    commandCases.set(command.id, command.caseId);
    cases.set(
      command.caseId,
      applyDemoCommand(cases.get(command.caseId), command),
    );
  }
  if (
    cases.size !== backup.cases.length ||
    new Set(backup.cases.map((item) => item.id)).size !== backup.cases.length
  )
    throw new Error("Backup tickets and journal do not match.");
  for (const item of backup.cases) {
    const replayed = cases.get(item.id);
    if (
      !replayed ||
      JSON.stringify(caseSchema.parse(replayed)) !== JSON.stringify(item)
    )
      throw new Error("Backup tickets and journal do not match.");
  }
  return backup;
}

export function parseDemoBackup(text: string) {
  if (new TextEncoder().encode(text).byteLength > maxBackupBytes)
    throw new Error("Backup exceeds the 5 MiB restore limit.");
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new Error("Backup is not valid JSON.");
  }
  return validateDemoBackup(input);
}
