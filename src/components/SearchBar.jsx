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
          text-gray-400
        "
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-xl
          border border-gray-300
          bg-white
          py-3 pl-11 pr-11
          text-sm
          text-navy-950
          outline-none
          transition
          placeholder:text-gray-400
          focus:border-cyan-500
          focus:ring-2
          focus:ring-cyan-500/20
          dark:border-navy-700
          dark:bg-navy-850
          dark:text-white
          dark:focus:bg-navy-850
        "
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
            text-gray-400
            transition
            hover:bg-gray-100
            hover:text-gray-700
            dark:hover:bg-navy-700
            dark:hover:text-white
          "
        >
          <FiX size={17} />
        </button>
      )}
    </div>
  );
}
