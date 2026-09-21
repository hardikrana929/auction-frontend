import { toImageUrl } from "./imageUrl";

/** Works for an id string or for an object with _id / id. */
export const getEntityId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return String(value._id || value.id || "");
};

/**
 * Turns whatever the backend / socket sent for a team (a populated object,
 * an { id, name } object, or just an id string) into { id, name, logo }.
 * `directory` is a map of teamId -> team from GET /api/teams/auction/:id,
 * so an id-only reference can still be shown with its team name.
 */
export const resolveTeam = (ref, directory = {}) => {
  const id = getEntityId(ref);
  const known = id ? directory[id] : null;
  const own = ref && typeof ref === "object" ? ref : null;

  return {
    id,
    name: own?.name || own?.teamName || known?.name || "",
    logo: toImageUrl(own?.logo) || toImageUrl(known?.logo),
    ownerName: own?.ownerName || known?.ownerName || "",
  };
};

export const shortId = (id, length = 6) =>
  id ? String(id).slice(-length) : "";
