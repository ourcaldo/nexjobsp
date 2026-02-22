/**
 * Paths where advertisements should never be shown,
 * regardless of the CMS "all_pages" setting.
 *
 * Matching is prefix-based: any pathname that starts with
 * one of these strings (with or without trailing slash) is excluded.
 */
export const AD_EXCLUDED_PATHS = [
  '/profil',
  '/signin',
  '/signup',
];

/**
 * Returns true when the given pathname belongs to an
 * ad-excluded route (login, signup, profile, etc.).
 */
export function isAdExcludedPath(pathname: string): boolean {
  return AD_EXCLUDED_PATHS.some(
    (excluded) =>
      pathname === excluded ||
      pathname.startsWith(excluded + '/')
  );
}
