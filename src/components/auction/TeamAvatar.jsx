import { useState } from "react";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
};

/** Team logo, or the team's initials when there is no logo / it fails to load. */
const TeamAvatar = ({ name = "", logo = "", size = "md" }) => {
  const [failedLogo, setFailedLogo] = useState("");

  const initials =
    String(name || "T")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "T";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-500/15 font-black text-emerald-300 ring-1 ring-emerald-500/30 ${
        SIZES[size] || SIZES.md
      }`}
    >
      {logo && logo !== failedLogo ? (
        <img
          src={logo}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default TeamAvatar;
