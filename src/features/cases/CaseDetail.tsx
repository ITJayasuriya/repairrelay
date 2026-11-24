import { useState, type SubmitEvent } from "react";
import { outcomes, type CaseAction, type RepairCase } from "../../domain/case";

export const statusLabels = {
  queued: "Queued",
  "in-progress": "In progress",
  "waiting-for-part": "Waiting for part",
  completed: "Completed",
  unrepairable: "Unrepairable",
};
export const outcomeLabels = {
  repaired: "Repaired",
  repairable: "Repairable — more work needed",
  "end-of-life": "End of life",
};
export function CaseDetail({
  item,
  busy,
  save,
}: {
  item: RepairCase;
  busy: boolean;
  save: (action: CaseAction) => Promise<boolean>;
}) {
  const [error, setError] = useState("");
  async function note(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("note") ?? "").trim();
    if (!body) {
      setError("Enter a handoff note.");
      return;
    }
    setError("");
    if (await save({ kind: "note", body })) form.reset();
  }
  return (
    <section className="detail" aria-labelledby="detail-title">
      <p className="eyebrow">At the bench · {item.reference}</p>
      <h2 id="detail-title">{item.fault}</h2>
      <p>{item.category}</p>
      <div className="handoff">
        <strong>{statusLabels[item.status]}</strong>
        <span>
          {item.owner ? "Owner: Demo repairer (simulated)" : "No owner"}
        </span>
        <span>Local revision {item.version} · device only</span>
      </div>
      {item.outcome ? (
        <p className="outcome">Outcome: {outcomeLabels[item.outcome]}</p>
      ) : (
        <>
          {!item.owner ? (
            <button
              className="primary"
              disabled={busy}
              onClick={() => void save({ kind: "claim" })}
            >
              Claim in demo
            </button>
          ) : (
            <>
              <div className="actions">
                <button
                  disabled={busy || item.status === "waiting-for-part"}
                  onClick={() =>
                    void save({ kind: "status", status: "waiting-for-part" })
                  }
                >
                  Wait for part
                </button>
                <button
                  disabled={busy || item.status === "in-progress"}
                  onClick={() =>
                    void save({ kind: "status", status: "in-progress" })
                  }
                >
                  Resume work
                </button>
              </div>
              <form onSubmit={note}>
                <label>
                  Handoff note
                  <textarea
                    disabled={busy}
                    name="note"
                    required
                    maxLength={2000}
                    rows={3}
                  />
                </label>
                {error && <p role="alert">{error}</p>}
                <button disabled={busy}>Save handoff note</button>
              </form>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const outcome = outcomes.find(
                    (o) => o === data.get("outcome"),
                  );
                  if (outcome) await save({ kind: "close", outcome });
                }}
              >
                <label>
                  Repair outcome
                  <select disabled={busy} name="outcome">
                    {outcomes.map((o) => (
                      <option key={o} value={o}>
                        {outcomeLabels[o]}
                      </option>
                    ))}
                  </select>
                </label>
                <button disabled={busy}>Close ticket with outcome</button>
              </form>
            </>
          )}
        </>
      )}
      <h3>Handoff trail</h3>
      {item.notes.length === 0 ? (
        <p>No handoff notes yet.</p>
      ) : (
        <ol className="notes">
          {[...item.notes].reverse().map((n) => (
            <li key={n.id}>
              <p>{n.body}</p>
              <small>
                Demo repairer ·{" "}
                <time dateTime={n.at}>{new Date(n.at).toLocaleString()}</time>
              </small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
