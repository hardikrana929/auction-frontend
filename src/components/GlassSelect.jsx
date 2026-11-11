import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiChevronDown } from "react-icons/fi";

/**
 * Frosted-glass dropdown that replaces the native <select>.
 * (A native option list is drawn by the OS and can never be glass.)
 *
 * <GlassSelect value={v} onChange={setV} options={[{value, label}]} />
 * onChange receives the selected VALUE (not an event).
 */
export default function GlassSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  icon: Icon,
  disabled = false,
  className = "",
  menuClassName = "",
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const listId = useId();

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const place = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuH = Math.min(options.length * 42 + 12, 280);
    const below = window.innerHeight - r.bottom;
    const flip = below < menuH + 12 && r.top > below;
    setPos({
      left: r.left,
      width: r.width,
      top: flip ? undefined : r.bottom + 8,
      bottom: flip ? window.innerHeight - r.top + 8 : undefined,
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (buttonRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const reflow = () => place();
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", reflow);
      window.removeEventListener("scroll", reflow, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (open && active >= 0) {
      menuRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const choose = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (options[active]) choose(options[active]); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`ap-select ${open ? "is-open" : ""} ${className}`}
      >
        {Icon && <Icon className="ap-select-icon" size={16} />}
        <span className={`ap-select-value ${selected ? "" : "is-placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className="ap-select-chevron" size={16} />
      </button>

      {open && pos &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            className={`ap-select-menu ${menuClassName}`}
            style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          >
            {options.length === 0 && <li className="ap-select-empty">No options</li>}
            {options.map((opt, i) => {
              const isSel = i === selectedIndex;
              return (
                <li
                  key={String(opt.value)}
                  data-idx={i}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(opt)}
                  className={`ap-select-option ${isSel ? "is-selected" : ""} ${i === active ? "is-active" : ""}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSel && <FiCheck size={15} />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
