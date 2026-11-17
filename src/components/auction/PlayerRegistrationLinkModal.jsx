import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiLink,
  FiRefreshCw,
  FiShare2,
  FiTrash2,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  buildRegistrationUrl,
  disableRegistrationLink,
  generateRegistrationLink,
  getRegistrationLink,
  setRegistrationOpen,
} from "../../api/playerRegistrationApi";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";

const errorMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

export default function PlayerRegistrationLinkModal({ auction, onClose }) {
  const { confirm } = useConfirmDialog();
  const inputRef = useRef(null);
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getRegistrationLink(auction._id);
      setLink(result.link);
    } catch (err) {
      setError(errorMessage(err, "Unable to load the registration link."));
    } finally {
      setLoading(false);
    }
  }, [auction._id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const url = link?.token ? buildRegistrationUrl(link.token) : "";
  const shareText = `Register as a player for "${auction.name}":`;

  const run = async (action, successFallback) => {
    setBusy(true);
    try {
      const result = await action();
      setLink(result.link);
      toast.success(result.message || successFallback);
    } catch (err) {
      toast.error(errorMessage(err, "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  const generate = () =>
    run(() => generateRegistrationLink(auction._id), "Link generated.");

  const regenerate = async () => {
    const ok = await confirm({
      title: "Generate a new link?",
      message:
        "The link you already shared will stop working immediately. Players will need the new link.",
      confirmText: "Generate new link",
    });
    if (ok) run(() => generateRegistrationLink(auction._id, true), "New link generated.");
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Remove the registration link?",
      message:
        "Nobody will be able to register through the current link. Players who already registered are kept.",
      confirmText: "Remove link",
    });
    if (ok) run(() => disableRegistrationLink(auction._id), "Link removed.");
  };

  const toggleOpen = () =>
    run(() => setRegistrationOpen(auction._id, !link.open), "Updated.");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / non-secure origins: fall back to selecting the text.
      inputRef.current?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: auction.name, text: shareText, url });
    } catch (err) {
      if (err?.name !== "AbortError") copy();
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  const startedNote =
    link && !["draft", "upcoming"].includes(link.auctionStatus)
      ? `This auction is ${link.auctionStatus}, so new players can no longer register.`
      : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-link-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg text-white shadow-lg shadow-indigo-500/30">
              <FiUserPlus />
            </span>
            <div>
              <p className="eyebrow">Player registration</p>
              <h2
                id="reg-link-title"
                className="text-xl font-black text-slate-900 dark:text-white"
              >
                {auction.name}
              </h2>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Share one link and players can register themselves — no login needed.
          Everyone who registers is added to this auction&apos;s player list.
        </p>

        {loading ? (
          <p className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading…
          </p>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
            {error}{" "}
            <button className="font-bold underline" onClick={load}>
              Retry
            </button>
          </div>
        ) : !link?.enabled ? (
          <div className="mt-6">
            <button
              className="primary-btn w-full"
              onClick={generate}
              disabled={busy}
            >
              <FiLink /> {busy ? "Generating…" : "Generate registration link"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {startedNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                {startedNote}
              </div>
            )}

            <div>
              <label className="label" htmlFor="reg-link-url">
                Shareable link
              </label>
              <div className="flex gap-2">
                <input
                  id="reg-link-url"
                  ref={inputRef}
                  readOnly
                  value={url}
                  onFocus={(e) => e.target.select()}
                  className="input min-w-0 flex-1 font-mono !text-xs"
                />
                <button
                  className="primary-btn shrink-0"
                  onClick={copy}
                  aria-label="Copy link"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
              >
                <FiShare2 /> WhatsApp
              </a>
              {typeof navigator !== "undefined" && navigator.share ? (
                <button className="secondary-btn" onClick={nativeShare}>
                  <FiShare2 /> More…
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
              >
                <FiExternalLink /> Preview form
              </a>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-white/50 p-4 dark:bg-white/[0.05]">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {link.open ? "Registration is open" : "Registration is closed"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {link.selfRegisteredCount} player
                  {link.selfRegisteredCount === 1 ? "" : "s"} registered via this link
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={link.open}
                aria-label="Accept registrations"
                disabled={busy}
                onClick={toggleOpen}
                className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
                  link.open ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${
                    link.open ? "left-[1.375rem]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:justify-between">
              <button className="secondary-btn" onClick={regenerate} disabled={busy}>
                <FiRefreshCw /> New link
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={remove}
                disabled={busy}
              >
                <FiTrash2 /> Remove link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
