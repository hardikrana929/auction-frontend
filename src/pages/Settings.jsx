import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-cyan-500">Account Settings</p>

        <h1
          className="
            mt-1
            font-display text-3xl font-bold
            text-navy-950
            dark:text-white
          "
        >
          Settings
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your AuctionPro preferences.
        </p>
      </div>

      {/* Appearance */}
      <section
        className="
          rounded-2xl
          border border-gray-200
          bg-white
          p-6
          shadow-sm
          dark:border-navy-700
          dark:bg-navy-850
        "
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className="
                text-lg font-bold
                text-navy-950
                dark:text-white
              "
            >
              Appearance
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose how AuctionPro looks on your device.
            </p>
          </div>

          {/* Theme Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-5 py-3
              text-sm font-semibold
              text-navy-950
              transition
              hover:border-cyan-500
              hover:text-cyan-500
              dark:border-navy-700
              dark:bg-navy-900
              dark:text-white
              dark:hover:border-cyan-500
              dark:hover:text-cyan-400
            "
          >
            {theme === "dark" ? (
              <>
                <FiSun size={18} />
                Light Mode
              </>
            ) : (
              <>
                <FiMoon size={18} />
                Dark Mode
              </>
            )}
          </button>
        </div>

        {/* Current Theme */}
        <div
          className="
            mt-6
            rounded-xl
            bg-pitch-50
            p-4
            dark:bg-navy-900
          "
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current theme
          </p>

          <p
            className="
              mt-1
              font-semibold
              text-navy-950
              dark:text-white
            "
          >
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </p>
        </div>
      </section>
    </div>
  );
}
