import { useEffect, useRef, useState } from "react";
import {
  resolveDemoConflict,
  syncDemoCommands,
  watchDemoPending,
} from "../../local/demo-sync";

import { practiceDemoConflict } from "../../local/demo-exercise";

export function DemoSync({
  disabled,
  setBusy,
}: {
  disabled: boolean;
  setBusy: (busy: boolean) => void;
}) {
  const syncButton = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(0);
  const [result, setResult] =
    useState<Awaited<ReturnType<typeof syncDemoCommands>>>();
  const [error, setError] = useState("");
  useEffect(() => {
    const subscription = watchDemoPending(setPending, () =>
      setError(
        "Cannot read the demo outbox. Keep your backup and check device storage.",
      ),
    );
    return () => subscription.unsubscribe();
  }, []);
  async function sync(before?: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setResult(undefined);
    try {
      await before?.();
      setResult(await syncDemoCommands());
      syncButton.current?.focus();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Simulated sync stopped. Saved changes remain on this device; retry with the same command identities.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-labelledby="sync-title" className="demo-sync">
      <h2 id="sync-title">Practice sync</h2>
      <p>
        This simulator stays in your browser and works without a network. It
        does not confirm team ownership.
      </p>
      <p className="count">{pending} changes pending simulated sync</p>
      <div className="actions">
        <button
          ref={syncButton}
          onClick={() => {
            if (!disabled && pending > 0) void sync();
          }}
          aria-disabled={disabled || pending === 0}
        >
          Run simulated sync
        </button>
        <button
          disabled={disabled}
          onClick={() => void sync(practiceDemoConflict)}
        >
          Create practice conflict
        </button>
      </div>
      <p role="status">
        {result
          ? `${result.acknowledged} changes acknowledged by the simulator. ${result.conflicts.length} tickets need review.`
          : "Saved changes wait here until you run the simulation."}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result?.conflicts.map((conflict) => (
        <details key={conflict.command.id}>
          <summary>Review {conflict.local.reference}</summary>
          <p>
            Dependent changes are paused. Review the entire saved ticket below,
            including later notes. Choose the simulator ticket, or keep your
            ticket’s fields and combine both sets of notes. Every original
            change stays in your backup. A changed simulator version requires
            another review.
          </p>
          <div className="conflict-values">
            {(
              [
                ["Before your change", conflict.base],
                ["Your saved change", conflict.local],
                ["Simulator version", conflict.server],
              ] as const
            ).map(([label, item]) => (
              <div key={label}>
                <h3>{label}</h3>
                {item ? (
                  <>
                    <p>{item.fault}</p>
                    <p>
                      Version {item.version} · {item.status} ·{" "}
                      {item.owner ?? "Unassigned"}
                    </p>
                    <p>Outcome: {item.outcome ?? "Not recorded"}</p>
                    <ul>
                      {item.notes.map((note) => (
                        <li key={note.id}>{note.body}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>Ticket does not exist in this version.</p>
                )}
              </div>
            ))}
          </div>
          <div className="actions">
            <button
              disabled={disabled || !conflict.server}
              onClick={() =>
                void sync(() => resolveDemoConflict(conflict, "server"))
              }
            >
              Use simulator ticket
            </button>
            <button
              disabled={disabled || !conflict.server}
              onClick={() =>
                void sync(() => resolveDemoConflict(conflict, "combine"))
              }
            >
              Keep my fields and combine notes
            </button>
          </div>
          <p>
            Choosing the simulator ticket retains this device’s original notes
            in the journal backup, but removes them from the active ticket.
          </p>
        </details>
      ))}
    </section>
  );
}
