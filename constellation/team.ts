// The curator team. Each curator signs with their own wallet (or personal
// Safe) and acts on a vault through the Roles mod's `curator` role.
//
// TODO: replace with the curators' real signer addresses.
export const CURATORS = {
  jan_felix: "0x0000000000000000000000000000000000000001",
  julia: "0x0000000000000000000000000000000000000002",
} as const;

// Owners of the client vaults. Owners can do anything, including moving funds
// in and out, so this stays with the firm's (and possibly the client's)
// signers, separate from the curators' day-to-day role.
//
// TODO: replace with the real owner signer addresses.
export const VAULT_OWNERS = [
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000002",
] as const;
