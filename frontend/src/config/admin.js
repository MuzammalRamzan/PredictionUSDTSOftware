export const SUPER_ADMINS = (import.meta.env.VITE_SUPER_ADMIN_ADDRESSES || "")
  .split(",")
  .map((addr) => addr.trim())
  .filter((addr) => addr);

export const VIEWER_ADMINS = (import.meta.env.VITE_VIEWER_ADMIN_ADDRESSES || "")
  .split(",")
  .map((addr) => addr.trim())
  .filter((addr) => addr);

export const isAdminAddress = (address) => {
  if (!address) return false;
  const lowerAddr = address.toLowerCase();
  return (
    SUPER_ADMINS.some((admin) => admin.toLowerCase() === lowerAddr) ||
    VIEWER_ADMINS.some((admin) => admin.toLowerCase() === lowerAddr)
  );
};

export const isSuperAdmin = (address) => {
  if (!address) return false;
  return SUPER_ADMINS.some(
    (admin) => admin.toLowerCase() === address.toLowerCase(),
  );
};
