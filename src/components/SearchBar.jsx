import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full">
      <FiSearch
        size={18}
        className="
          pointer-events-none
          absolute left-4 top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="glass-input py-3 pl-11 pr-11"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="
            absolute right-3 top-1/2
            -translate-y-1/2
            rounded-lg
            p-1.5
            text-slate-400
            transition
            hover:bg-white/60 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white
          "
        >
          <FiX size={17} />
        </button>
      )}
    </div>
  );
}
