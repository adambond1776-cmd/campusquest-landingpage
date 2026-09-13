/**
 * Shared production detection.
 *
 * Safe to import from client components: it only reads NODE_ENV, which Next
 * inlines at build time. Do not put secrets in this file.
 */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

export const AUTH_UNCONFIGURED_MESSAGE =
  'CampusQuest sign-in is temporarily unavailable. Please try again later.';

export const STORAGE_UNCONFIGURED_MESSAGE =
  'CampusQuest is temporarily unavailable because storage is not configured.';
