import { useRef, useState } from "react";
import { maxBackupBytes, parseDemoBackup } from "../../domain/demo-backup";
import { restoreDemoBackup } from "../../local/demo-store";

export function BackupRestore({
  disabled,
  occupied,
  setBusy,
}: {
  disabled: boolean;
  occupied: boolean;
  setBusy: (busy: boolean) => void;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  function dismissPreview() {
    setPreview(null);
    disclosure.current?.querySelector("summary")?.focus();
  }
  const [preview, setPreview] = useState<ReturnType<
    typeof parseDemoBackup
  > | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function choose(file: File | undefined) {
    setPreview(null);
    setError("");
    setMessage("");
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > maxBackupBytes)
        throw new Error("Backup exceeds the 5 MiB restore limit.");
      setPreview(parseDemoBackup(await file.text()));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Cannot read this backup.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    if (!preview) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const count = await restoreDemoBackup(preview);
      dismissPreview();
      setMessage(
        `Restored ${count} demo tickets on this device. No team data was sent.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Restore failed. Existing device data has been kept.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="recovery" ref={disclosure}>
      <summary>Restore a demo backup</summary>
      <p id="restore-help">
        Restore version 1 backups up to 5 MiB into an empty demo store. Existing
        tickets are never replaced. To review a backup separately, use another
        browser profile.
      </p>
      <label>
        Demo backup file
        <input
          type="file"
          accept=".json,application/json"
          aria-describedby="restore-help"
          disabled={disabled || occupied}
          onChange={(event) => {
            void choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {occupied && (
        <p>
          This browser already has demo tickets. Back them up before moving to
          another profile.
        </p>
      )}
      {preview && (
        <div className="handoff">
          <strong>Backup preview · {preview.cases.length} tickets</strong>
          <span>
            {preview.commands.length} journal entries · exported{" "}
            {new Date(preview.exportedAt).toLocaleString()}
          </span>
          <div className="actions">
            <button
              className="primary"
              disabled={disabled || occupied}
              onClick={() => void restore()}
            >
              Restore these demo tickets
            </button>
            <button disabled={disabled} onClick={dismissPreview}>
              Cancel restore
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error} Nothing was imported.
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
