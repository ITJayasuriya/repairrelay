import { useState, type SubmitEvent } from "react";
import { categories, intakeSchema, type CaseAction } from "../../domain/case";

export function Intake({
  save,
  busy,
}: {
  save: (action: CaseAction) => Promise<boolean>;
  busy: boolean;
}) {
  const [error, setError] = useState("");
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = intakeSchema.safeParse({
      category: data.get("category"),
      fault: data.get("fault"),
    });
    if (!parsed.success) {
      setError("Choose a category and describe the fault (1–500 characters).");
      return;
    }
    setError("");
    if (await save({ kind: "intake", payload: parsed.data })) form.reset();
  }
  return (
    <section className="intake" aria-labelledby="intake-title">
      <p className="eyebrow">Reception</p>
      <h2 id="intake-title">Register an item</h2>
      <p id="privacy">
        Use synthetic repair details. Leave out names, contact details and other
        personal information.
      </p>
      <form onSubmit={submit} aria-describedby="privacy">
        <label>
          Item category
          <select
            disabled={busy}
            name="category"
            defaultValue="Small electrical"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Reported fault
          <textarea
            disabled={busy}
            name="fault"
            required
            maxLength={500}
            rows={3}
            placeholder="Kettle does not switch on"
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="primary" disabled={busy}>
          Register demo ticket
        </button>
      </form>
    </section>
  );
}
