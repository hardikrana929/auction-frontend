/**
 * Colour themes for the PUBLIC live auction screen only.
 * Nothing here touches the app's own light/dark theme.
 *
 * resolveLiveTheme() returns the CSS variables the page sets on its root:
 *   bg      page background            card    "ground" of the player card
 *   fg      text on the background     cardfg  text on the card
 *   muted   secondary text             accent  current-bid colour
 *   border  card border                sold / unsold  result colours
 */

const LIGHT = {
  bg: "#f1f5f9", card: "#ffffff", fg: "#0f172a", cardfg: "#0f172a",
  muted: "#475569", accent: "#4338ca", border: "#cbd5e1",
  sold: "#15803d", unsold: "#6b7280",
};
const DARK = {
  bg: "#020617", card: "#0f172a", fg: "#f8fafc", cardfg: "#f8fafc",
  muted: "#94a3b8", accent: "#fbbf24", border: "#1e293b",
  sold: "#22c55e", unsold: "#9ca3af",
};

export const LIVE_PRESETS = [
  { id: "auto", label: "Auto (match app)" },
  { id: "light", label: "Light", vars: LIGHT },
  { id: "dark", label: "Dark", vars: DARK },
  {
    id: "midnight",
    label: "Midnight",
    vars: { bg: "#0b1437", card: "#13204f", fg: "#eef2ff", cardfg: "#eef2ff", muted: "#a5b4fc", accent: "#fbbf24", border: "#27397a", sold: "#4ade80", unsold: "#9ca3af" },
  },
  {
    id: "stadium",
    label: "Stadium",
    vars: { bg: "#052e16", card: "#064e3b", fg: "#ecfdf5", cardfg: "#ecfdf5", muted: "#86efac", accent: "#fde047", border: "#047857", sold: "#4ade80", unsold: "#9ca3af" },
  },
  {
    id: "projector",
    label: "High contrast",
    vars: { bg: "#000000", card: "#0a0a0a", fg: "#ffffff", cardfg: "#ffffff", muted: "#d4d4d4", accent: "#facc15", border: "#525252", sold: "#22c55e", unsold: "#a3a3a3" },
  },
  { id: "custom", label: "Custom colours" },
];

export const DEFAULT_LIVE_THEME = {
  preset: "auto",
  bg: "#0f172a",
  card: "#1e293b",
};

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHexColor = (value) => typeof value === "string" && HEX.test(value);

// WCAG relative luminance of a #rrggbb colour (0 = black, 1 = white)
export const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Dark text on light colours, light text on dark colours. */
export const readableOn = (hex) => (luminance(hex) > 0.4 ? "#0f172a" : "#f8fafc");

const customVars = ({ bg, card }) => {
  const background = isHexColor(bg) ? bg : DEFAULT_LIVE_THEME.bg;
  const ground = isHexColor(card) ? card : DEFAULT_LIVE_THEME.card;
  const fg = readableOn(background);
  const darkBg = luminance(background) <= 0.4;
  return {
    bg: background,
    card: ground,
    fg,
    cardfg: readableOn(ground),
    muted: `color-mix(in srgb, ${fg} 68%, transparent)`,
    accent: fg,
    border: `color-mix(in srgb, ${fg} 25%, transparent)`,
    sold: darkBg ? "#4ade80" : "#15803d",
    unsold: darkBg ? "#9ca3af" : "#6b7280",
  };
};

/**
 * @param settings  { preset, bg, card }
 * @param appTheme  "light" | "dark" - used by the "auto" preset
 */
export const resolveLiveTheme = (settings, appTheme = "light") => {
  const { preset, bg, card } = { ...DEFAULT_LIVE_THEME, ...(settings || {}) };
  if (preset === "custom") return customVars({ bg, card });
  if (preset === "auto") return appTheme === "dark" ? DARK : LIGHT;
  return LIVE_PRESETS.find((item) => item.id === preset)?.vars || LIGHT;
};

/** Settings come from localStorage: never trust them blindly. */
export const sanitizeLiveSettings = (raw) => {
  const ids = LIVE_PRESETS.map((item) => item.id);
  const preset = ids.includes(raw?.preset) ? raw.preset : DEFAULT_LIVE_THEME.preset;
  return {
    preset,
    bg: isHexColor(raw?.bg) ? raw.bg : DEFAULT_LIVE_THEME.bg,
    card: isHexColor(raw?.card) ? raw.card : DEFAULT_LIVE_THEME.card,
  };
};
