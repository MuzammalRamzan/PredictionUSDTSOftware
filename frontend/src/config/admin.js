export const ADMIN_ADDRESS = '0x2686AD7C841A81170b8b2DC3D747682D1dbbE63b';

export const isAdminAddress = (address) => {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
};
