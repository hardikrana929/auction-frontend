// The database role names are kept as they are; this only changes what people see.
//   admin           -> Super Admin (creates auctions, assigns an admin to each)
//   auction_manager -> Admin       (runs the one auction assigned to them)
//   user            -> User
const LABELS = {
  admin: "Super Admin",
  auction_manager: "Admin",
  user: "User",
};

export const roleLabel = (role) => LABELS[role] || "User";
