import { useState } from "react";
import { FiCheck, FiCopy, FiKey } from "react-icons/fi";
import toast from "react-hot-toast";
import { copyText } from "../../utils/clipboard";

/**
 * Popup that shows the login details of an auction's admin right after the
 * auction is created (or the password is reset), with copy-to-clipboard.
 *
 * credentials: { username, password, auctionId }
 */
export default function AuctionCredentialsModal({
  credentials,
  auctionName,
  onClose,
  closeLabel = "I have saved the credentials",
}) {
  const [copied, setCopied] = useState("");

  if (!credentials) return null;

  const rows = [
    ["Auction ID", credentials.auctionId],
    ["Username", credentials.username],
    ["Password", credentials.password],
  ];

  const copy = async (label, value) => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(""), 1800);
    } else {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  const copyAll = () =>
    copy(
      "All credentials",
      [
        auctionName ? `Auction: ${auctionName}` : null,
        ...rows.map(([label, value]) => `${label}: ${value}`),
      ]
        .filter(Boolean)
        .join("\n"),
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Auction credentials"
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <FiKey />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Auction credentials
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {auctionName ? <strong>{auctionName}. </strong> : null}
              Share these with the auction admin. The password is shown only
              now; you can reset it later from Auction Management.
            </p>
          </div>
        </div>

        {rows.map(([label, value]) => (
          <div key={label} className="mt-4">
            <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
              {label}
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={value || ""}
                onFocus={(event) => event.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
              />
              <button
                type="button"
                onClick={() => copy(label, value)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={`Copy ${label}`}
              >
                {copied === label ? <FiCheck /> : <FiCopy />}
                {copied === label ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyAll}
            className="secondary-btn flex-1 justify-center"
          >
            {copied === "All credentials" ? <FiCheck /> : <FiCopy />} Copy all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="primary-btn flex-1 justify-center"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
