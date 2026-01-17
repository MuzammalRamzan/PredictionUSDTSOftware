export const ADMIN_ADDRESS = '0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb';

export const isAdminAddress = (address) => {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
};
