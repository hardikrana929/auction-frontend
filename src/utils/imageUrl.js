/**
 * The backend stores images as objects ({ url, publicId }) for team logos and
 * player photos, but many components were written as if `logo` were a plain
 * string. Passing the object to <img src> turns it into "[object Object]",
 * which fails to load. This returns a usable URL string for either shape.
 */
export const toImageUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return typeof value.url === "string" ? value.url : "";
};

export default toImageUrl;
