import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from "react-icons/fi";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const inputRef = useRef(null);

  const close = useCallback((value) => {
    resolver.current?.(value);
    resolver.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog({
          mode: "confirm",
          title: options.title || "Are you sure?",
          message:
            options.message || "Please confirm that you want to continue.",
          confirmText: options.confirmText || "Continue",
          cancelText: options.cancelText || "Cancel",
          tone: options.tone || "danger",
        });
      }),
    [],
  );

  const prompt = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog({
          mode: "prompt",
          title: options.title || "Enter a value",
          message: options.message || "",
          defaultValue: options.defaultValue || "",
          placeholder: options.placeholder || "Enter value",
          confirmText: options.confirmText || "Save",
          cancelText: options.cancelText || "Cancel",
          tone: options.tone || "primary",
        });
      }),
    [],
  );

  const select = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog({
          mode: "select",
          title: options.title || "Choose an option",
          message: options.message || "",
          options: options.options || [],
          value: options.value ?? null,
          confirmText: options.confirmText || "Apply",
          cancelText: options.cancelText || "Cancel",
          tone: options.tone || "primary",
        });
      }),
    [],
  );

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape")
        close(dialog.mode === "confirm" ? false : null);
      if (event.key === "Enter" && dialog.mode === "confirm") close(true);
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [dialog, close]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm, prompt, select }}>
      {children}
      {dialog && (
        <div
          className="ap-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              close(dialog.mode === "confirm" ? false : null);
          }}
        >
          <section
            className="ap-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ap-dialog-title"
            aria-describedby="ap-dialog-description"
          >
            <button
              type="button"
              className="ap-dialog-close"
              aria-label="Close dialog"
              onClick={() => close(dialog.mode === "confirm" ? false : null)}
            >
              <FiX />
            </button>
            <div className={`ap-dialog-icon ap-dialog-icon-${dialog.tone}`}>
              {dialog.tone === "danger" ? (
                <FiAlertTriangle />
              ) : dialog.tone === "info" ? (
                <FiInfo />
              ) : (
                <FiCheck />
              )}
            </div>
            <h2 id="ap-dialog-title" className="ap-dialog-title">
              {dialog.title}
            </h2>
            {dialog.message && (
              <p id="ap-dialog-description" className="ap-dialog-message">
                {dialog.message}
              </p>
            )}
            {dialog.mode === "prompt" && (
              <input
                ref={inputRef}
                className="ap-dialog-input"
                defaultValue={dialog.defaultValue}
                placeholder={dialog.placeholder}
                onKeyDown={(event) => {
                  if (event.key === "Enter")
                    close(event.currentTarget.value.trim());
                }}
              />
            )}
            {dialog.mode === "select" && (
              <div className="ap-dialog-options" role="radiogroup">
                {dialog.options.map((opt) => {
                  const active = dialog.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`ap-dialog-option ${active ? "is-active" : ""}`}
                      onClick={() =>
                        setDialog((d) => ({ ...d, value: opt.value }))
                      }
                    >
                      <span>{opt.label}</span>
                      {active && <FiCheck />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="ap-dialog-actions">
              <button
                type="button"
                className="ap-dialog-cancel"
                onClick={() => close(dialog.mode === "confirm" ? false : null)}
              >
                {dialog.cancelText}
              </button>
              <button
                type="button"
                className={`ap-dialog-confirm ap-dialog-confirm-${dialog.tone}`}
                onClick={() =>
                  close(
                    dialog.mode === "prompt"
                      ? inputRef.current?.value?.trim() || null
                      : dialog.mode === "select"
                        ? dialog.value
                        : true,
                  )
                }
              >
                {dialog.confirmText}
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context)
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider",
    );
  return context;
}
