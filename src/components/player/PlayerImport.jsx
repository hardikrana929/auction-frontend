import { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  downloadImportTemplate,
  getImportFormat,
  importPlayers,
} from "../../api/playerApi";

function ModalShell({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:rounded-3xl ${wide ? "max-w-3xl" : "max-w-xl"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function useTemplateDownload() {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      saveBlob(await downloadImportTemplate(), "player-import-format.xlsx");
    } catch {
      toast.error("Unable to download the sample file.");
    } finally {
      setBusy(false);
    }
  };
  return { download, busy };
}

/** "File format" button: how many fields the Excel file needs and what goes in each. */
export function PlayerFormatModal({ onClose }) {
  const [format, setFormat] = useState(null);
  const [error, setError] = useState("");
  const { download, busy } = useTemplateDownload();

  useEffect(() => {
    getImportFormat()
      .then(setFormat)
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to load the file format."),
      );
  }, []);

  return (
    <ModalShell
      wide
      title="Excel file format"
      subtitle="Use an .xlsx file. The first row must contain the column names below."
      onClose={onClose}
    >
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!format && !error && (
        <p className="text-sm text-slate-500">Loading…</p>
      )}
      {format && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Total columns" value={format.totalColumns} />
            <Stat label="Must fill" value={format.requiredColumns} tone="red" />
            <Stat label="Optional" value={format.optionalColumns} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Column</th>
                  <th className="px-3 py-2">Fill?</th>
                  <th className="px-3 py-2">Example</th>
                  <th className="px-3 py-2">Allowed values / notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {format.columns.map((column) => (
                  <tr key={column.header}>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                      {column.header}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${column.required ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                      >
                        {column.required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {String(column.example)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      {column.options.length
                        ? column.options.join(", ")
                        : column.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Up to {format.maxRows} players per file. Rows with a mistake are
            skipped and listed with their row number; the rest are imported.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="secondary-btn" onClick={onClose}>
              Close
            </button>
            <button className="primary-btn" onClick={download} disabled={busy}>
              <FiDownload /> {busy ? "Preparing…" : "Download sample file"}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.05]">
      <p
        className={`text-2xl font-black ${tone === "red" ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

/** "Import player" button: upload the Excel file into the selected auction. */
export function PlayerImportModal({ auction, onClose, onImported }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const { download, busy: downloading } = useTemplateDownload();

  const choose = (event) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please choose an Excel .xlsx file.");
      event.target.value = "";
      return;
    }
    if (picked.size > 2 * 1024 * 1024) {
      toast.error("The file must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(picked);
    setResult(null);
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await importPlayers(auction._id, file);
      setResult(data);
      if (data.imported) {
        toast.success(data.message);
        onImported?.();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Import players from Excel"
      subtitle={`Players are added to “${auction.name}”.`}
      onClose={onClose}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 dark:border-slate-700 dark:bg-white/[0.04]"
      >
        {file ? <FiFileText className="text-3xl text-emerald-500" /> : <FiUploadCloud className="text-3xl text-slate-400" />}
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {file ? file.name : "Choose an .xlsx file"}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Max 2 MB · up to 500 players
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={choose}
      />

      <button
        type="button"
        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        onClick={download}
        disabled={downloading}
      >
        Not sure about the format? Download the sample file
      </button>

      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            {result.imported ? (
              <FiCheckCircle className="text-emerald-500" />
            ) : (
              <FiAlertCircle className="text-amber-500" />
            )}
            {result.imported} imported · {result.skipped} skipped (of{" "}
            {result.totalRows} rows)
          </p>
          {result.errors?.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-red-600 dark:text-red-400">
              {result.errors.map((item) => (
                <li key={`${item.row}-${item.message}`}>
                  <strong>Row {item.row}:</strong> {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button className="secondary-btn" onClick={onClose}>
          {result ? "Done" : "Cancel"}
        </button>
        <button
          className="primary-btn disabled:opacity-60"
          onClick={submit}
          disabled={!file || busy}
        >
          <FiUploadCloud /> {busy ? "Importing…" : "Import players"}
        </button>
      </div>
    </ModalShell>
  );
}
