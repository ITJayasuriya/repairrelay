import { BackupRestore } from "../features/recovery/BackupRestore";
import { useEffect, useState } from "react";
import { type CaseAction, type RepairCase } from "../domain/case";
import {
  exportDemoBackup,
  saveDemoCommand,
  watchDemoCases,
} from "../local/demo-store";
import { Intake } from "../features/cases/Intake";
import { CaseDetail, statusLabels } from "../features/cases/CaseDetail";

export function DemoApp() {
  const [items, setItems] = useState<RepairCase[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const subscription = watchDemoCases(
      (list) => {
        setItems(list);
        setReady(true);
      },
      () => {
        setError(
          "Cannot read device storage. Existing data has not been cleared. Check browser storage permissions and reload.",
        );
      },
    );
    return () => subscription.unsubscribe();
  }, []);
  const selected = items.find((item) => item.id === selectedId);
  async function save(action: CaseAction): Promise<boolean> {
    setBusy(true);
    setError("");
    setMessage("");
    const caseId =
      action.kind === "intake" ? crypto.randomUUID() : selected?.id;
    if (!caseId) {
      setBusy(false);
      return false;
    }
    try {
      await saveDemoCommand({
        id: crypto.randomUUID(),
        caseId,
        baseVersion: action.kind === "intake" ? 0 : (selected?.version ?? 0),
        at: new Date().toISOString(),
        action,
      });
      setSelectedId(caseId);
      setMessage("Saved on this device. Demo only; no team sync.");
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message} Your form has been kept. Nothing was acknowledged as saved.`
          : "Device save failed. Your form has been kept.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function backup() {
    try {
      const data = await exportDemoBackup();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "repairrelay-demo-backup.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Backup failed. Device data has not been cleared. Try again.");
    }
  }
  const visible = items.filter(
    (item) =>
      filter === "all" ||
      (filter === "mine" ? item.owner !== null : item.outcome === null),
  );
  return (
    <>
      <a className="skip" href="#queue">
        Skip to repair queue
      </a>
      <header>
        <a className="brand" href="/demo">
          RepairRelay
        </a>
        <span className="mode">Local demo · no account needed</span>
        <a href="https://github.com/ITJayasuriya/repairrelay">Source</a>
      </header>
      <main>
        <div className="event-heading">
          <div>
            <p className="eyebrow">Synthetic practice event</p>
            <h1>The repair bench</h1>
            <p>
              Register an item. Leave a clear handoff. Record what happened.
            </p>
          </div>
          <button onClick={() => void backup()} disabled={!ready || busy}>
            Back up demo data
          </button>
        </div>
        <aside className="notice">
          This demo stays in this browser. Ownership is simulated; D- references
          are provisional. Browser storage can be cleared or evicted. Team mode,
          offline app loading and standard exports are still in development.
        </aside>
        <BackupRestore
          disabled={!ready || busy}
          occupied={items.length > 0}
          setBusy={setBusy}
        />
        <p className="save-status" role="status">
          {busy
            ? "Saving to this device…"
            : message ||
              (ready
                ? "Device storage ready · no server connection used"
                : "Opening device storage…")}
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="workspace">
          <div>
            <Intake save={save} busy={busy || !ready} />
            <section id="queue" tabIndex={-1} aria-labelledby="queue-title">
              <div className="queue-heading">
                <h2 id="queue-title">
                  Repair queue <span className="count">{items.length}</span>
                </h2>
                <label>
                  Show
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                  >
                    <option value="all">All tickets</option>
                    <option value="open">Open tickets</option>
                    <option value="mine">Demo repairer’s tickets</option>
                  </select>
                </label>
              </div>
              {!ready ? (
                <p>Loading tickets…</p>
              ) : visible.length === 0 ? (
                <p className="empty">
                  No tickets here yet. Register a synthetic item to start the
                  handoff.
                </p>
              ) : (
                <ul className="queue">
                  {visible.map((item) => (
                    <li key={item.id}>
                      <button
                        aria-pressed={selectedId === item.id}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span className="ticket">{item.reference}</span>
                        <strong>{item.fault}</strong>
                        <span>
                          {item.category} · {statusLabels[item.status]}
                        </span>
                        <span className="strip">
                          {item.owner ? "Demo repairer" : "Unassigned"} · device
                          only
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          {selected ? (
            <CaseDetail
              key={selected.id}
              item={selected}
              busy={busy}
              save={save}
            />
          ) : (
            <section className="detail empty">
              <h2>Ready for a handoff</h2>
              <p>
                Select a ticket to see its owner, add notes and record an
                outcome.
              </p>
              <p>
                No visitor personal data. No cloud account. Just a practice
                repair bench.
              </p>
            </section>
          )}
        </div>
        <footer>
          Independent demo alpha · revision {__APP_REVISION__} ·{" "}
          <a href="https://github.com/ITJayasuriya/repairrelay/issues">
            Report a problem
          </a>
        </footer>
      </main>
    </>
  );
}
