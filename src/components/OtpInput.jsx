import { useRef } from "react";

const LENGTH = 6;

/**
 * Six single-digit boxes. Typing moves to the next box, Backspace moves back,
 * and pasting (or an SMS auto-fill) spreads the whole code over the boxes.
 * `digits` is an array of 6 strings ("" when empty).
 * Works in light and dark mode.
 */
export default function OtpInput({ digits, onChange, disabled = false, invalid = false }) {
  const refs = useRef([]);

  const focus = (index) => {
    const el = refs.current[Math.max(0, Math.min(LENGTH - 1, index))];

    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const fillFrom = (index, text) => {
    const clean = String(text).replace(/\D/g, "");

    if (!clean) {
      return;
    }

    const next = digits.slice();

    for (let i = 0; i < clean.length && index + i < LENGTH; i += 1) {
      next[index + i] = clean[i];
    }

    onChange(next);
    focus(index + clean.length >= LENGTH ? LENGTH - 1 : index + clean.length);
  };

  const handleChange = (index, event) => {
    const value = event.target.value;

    if (!value) {
      const next = digits.slice();
      next[index] = "";
      onChange(next);
      return;
    }

    fillFrom(index, value);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();

      const next = digits.slice();
      next[index - 1] = "";
      onChange(next);
      focus(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  const boxColors = (digit) => {
    if (invalid) {
      return "border-red-500 bg-red-50 text-red-700 focus:border-red-600 focus:ring-red-200 dark:border-red-400 dark:bg-red-950/40 dark:text-red-200 dark:focus:border-red-300 dark:focus:ring-red-900";
    }

    return digit
      ? "border-slate-950 bg-white text-slate-950 focus:border-slate-950 focus:ring-slate-300 dark:border-slate-200 dark:bg-slate-800 dark:text-white dark:focus:border-white dark:focus:ring-slate-600"
      : "border-slate-300 bg-white text-slate-950 focus:border-slate-950 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-white dark:focus:ring-slate-600";
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid || undefined}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-full min-w-0 rounded-xl border-2 text-center text-2xl font-black outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${boxColors(digit)}`}
        />
      ))}
    </div>
  );
}
